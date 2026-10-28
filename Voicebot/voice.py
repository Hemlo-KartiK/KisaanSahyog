"""Text to speech for a farmer-facing assistant.

Order of preference (first one that works wins):
  1. Sarvam "Bulbul" - built for Indian languages and accents, sounds the most natural
     in Hindi, Punjabi and Indian English. Needs a free API key: SARVAM_API_KEY in .env
  2. Microsoft neural voices (edge-tts) - good Hindi and Indian English, no key needed.
  3. gTTS - robotic, last resort.
  4. None - the screen then shows text only.

Optional settings in .env:
  SARVAM_API_KEY   key from https://dashboard.sarvam.ai  (turns on option 1)
  SARVAM_SPEAKER   default "shubh" (a calm male voice). Try others from the Sarvam docs.
  VOICE_GENDER     "female" (default) or "male" - used for the edge-tts fallback
"""
import asyncio
import base64
import concurrent.futures
import io
import os
import re

try:                                    # .env is optional here; bot_logic loads it too
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

SARVAM_URL = "https://api.sarvam.ai/text-to-speech"
SARVAM_MODEL = "bulbul:v3"
SARVAM_LANG = {"en": "en-IN", "hi": "hi-IN", "pa": "pa-IN"}
SARVAM_PACE = 0.95          # a touch slower than normal: easier to follow outdoors
SARVAM_MAX_CHARS = 2400     # API limit is 2500 for bulbul:v3

# edge-tts: (female, male) per language. First name that exists on the server wins.
EDGE_VOICES = {
    "en": ("en-IN-NeerjaNeural", "en-IN-PrabhatNeural"),
    "hi": ("hi-IN-SwaraNeural", "hi-IN-MadhurNeural"),
    "pa": ("pa-IN-GagandeepNeural", "pa-IN-NirvairNeural"),
}
LOCALE = {"en": "en-IN", "hi": "hi-IN", "pa": "pa-IN"}
EDGE_RATE = "-5%"

_voice_names = None
last_engine = None          # which engine made the last audio (handy for debugging)


# ------------------------------------------------------------ text clean-up
_EMOJI = re.compile("[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F]")

def _clean_for_speech(text):
    """Remove things a voice would read out loud badly (markdown, emoji, symbols)."""
    text = _EMOJI.sub("", str(text))
    text = re.sub(r"[*_`#>|~]+", " ", text)
    text = re.sub(r"\bkg\s*/\s*(ha|hectare)\b", "kilo per hectare", text, flags=re.I)
    text = re.sub(r"\bkgs?\b", "kilo", text, flags=re.I)
    text = text.replace("&", " and ").replace("₂", "2")
    return re.sub(r"\s+", " ", text).strip()

def _shorten(text, limit):
    if len(text) <= limit:
        return text
    cut = text[:limit]
    end = max(cut.rfind("."), cut.rfind("।"), cut.rfind("?"), cut.rfind("!"))
    return cut[: end + 1] if end > limit // 2 else cut


# ------------------------------------------------------------ 1. Sarvam
def _sarvam(text, language):
    key = os.environ.get("SARVAM_API_KEY", "").strip()
    if not key:
        return None
    import requests
    speaker = os.environ.get("SARVAM_SPEAKER", "shubh").strip() or "shubh"
    for sp in dict.fromkeys([speaker, "shubh"]):       # retry once with the default
        r = requests.post(
            SARVAM_URL,
            headers={"api-subscription-key": key, "Content-Type": "application/json"},
            json={
                "text": _shorten(text, SARVAM_MAX_CHARS),
                "target_language_code": SARVAM_LANG.get(language, "en-IN"),
                "speaker": sp,
                "model": SARVAM_MODEL,
                "pace": SARVAM_PACE,
            },
            timeout=30,
        )
        if r.status_code == 200:
            audios = r.json().get("audios") or []
            if audios:
                return base64.b64decode("".join(audios))        # WAV bytes
            return None
        if r.status_code != 422:                               # 422 = bad speaker name
            return None
    return None


# ------------------------------------------------------------ 2. edge-tts
def _run(coro):
    """Run an async function from normal (sync) code, even inside Streamlit."""
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(coro)
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        return pool.submit(asyncio.run, coro).result()

async def _list_voices():
    import edge_tts
    return [v["ShortName"] for v in await edge_tts.list_voices()]

def _pick_edge_voice(language):
    global _voice_names
    if _voice_names is None:
        try:
            _voice_names = _run(_list_voices())
        except Exception:
            _voice_names = []
    female, male = EDGE_VOICES.get(language, EDGE_VOICES["en"])
    prefs = (male, female) if os.environ.get("VOICE_GENDER", "").lower() == "male" else (female, male)
    if not _voice_names:
        return prefs[0]
    for name in prefs:
        if name in _voice_names:
            return name
    prefix = LOCALE.get(language, "en-IN")
    for name in _voice_names:
        if name.startswith(prefix):
            return name
    return None                      # no neural voice for this language (e.g. Punjabi)

async def _synth(text, voice):
    import edge_tts
    buf = io.BytesIO()
    async for chunk in edge_tts.Communicate(text, voice, rate=EDGE_RATE).stream():
        if chunk["type"] == "audio":
            buf.write(chunk["data"])
    return buf.getvalue()

def _edge(text, language):
    voice = _pick_edge_voice(language)
    return _run(_synth(text, voice)) if voice else None


# ------------------------------------------------------------ 3. gTTS
def _gtts(text, language):
    from gtts import gTTS
    buf = io.BytesIO()
    gTTS(text=text, lang=language).write_to_fp(buf)
    return buf.getvalue()


# ------------------------------------------------------------------- public
def mime_type(audio):
    """MIME type for st.audio: Sarvam returns WAV, the others return MP3."""
    return "audio/wav" if audio[:4] == b"RIFF" else "audio/mp3"

def speak(text, language="en"):
    """Returns audio bytes (WAV or MP3), or None if every method failed."""
    global last_engine
    text = _clean_for_speech(text)
    if not text:
        return None
    for name, fn in (("sarvam", _sarvam), ("edge-tts", _edge), ("gtts", _gtts)):
        try:
            audio = fn(text, language)
            if audio:
                last_engine = name
                return audio
        except Exception:
            continue
    last_engine = None
    return None
