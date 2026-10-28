"""The brain of the voice bot. No screen code here, only logic."""
import os
import json
import datetime
import requests
from dotenv import load_dotenv
from groq import Groq

import india_data as geo

load_dotenv()

CHAT_MODEL = "openai/gpt-oss-20b"
STT_MODEL = "whisper-large-v3"           # Groq Whisper: the fallback speech-to-text
SARVAM_STT_MODEL = "saaras:v3"           # Sarvam: main speech-to-text for Indian languages

FIELDS = ["location", "land_size", "land_unit", "crop"]

_client = None
def get_client():
    global _client
    if _client is None:
        _client = Groq(api_key=os.environ["GROQ_API_KEY"])
    return _client


# ---------- Stage 1 + 2: understand the farmer's message ----------
def _district_text():
    return "; ".join(f"{state}: " + ", ".join(names) for state, names in geo.DISTRICTS.items())

EXTRACT_PROMPT = """You help Indian farmers in Punjab and Uttar Pradesh. The farmer says where
their farm is, how big their land is, and which crop they want to grow. The message may be
in Hindi, Punjabi, English or a mix, and it comes from speech recognition, so names may be
spelled wrongly.

Reply ONLY with JSON in exactly this form:
{"location": "...", "land_size": 0, "land_unit": "...", "crop": "...", "language": "..."}

Rules:
- location: write it in English letters. If it sounds like one of these districts, use the
  exact spelling from this list. Otherwise write the village or town name in English letters.
  Districts - """ + _district_text() + """
- crop: English lowercase name (gehu -> wheat, dhan -> rice, makka -> maize, sarson -> mustard,
  ganna -> sugarcane, kapas -> cotton, aloo -> potato). Crops we know: """ + ", ".join(geo.CROPS) + """.
- land_unit: one of acre, killa, ghumaon, kanal, marla, sarsai, murabba, hectare, gaj, decimal,
  bigha, biswa, biswansi.
- land_size: a number. Convert spoken or Hindi/Punjabi number words to digits.
- language: "en" for English, "hi" for Hindi or Hinglish, "pa" for Punjabi.
- If something is missing, use null for that field. Never guess."""

def extract_details(message):
    resp = get_client().chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": EXTRACT_PROMPT},
            {"role": "user", "content": message},
        ],
        response_format={"type": "json_object"},
    )
    data = json.loads(resp.choices[0].message.content)
    data["crop"] = geo.normalize_crop(data.get("crop"))
    data["land_unit"] = geo.normalize_unit(data.get("land_unit"))   # None if not recognised
    data["location"], data["state"] = geo.normalize_location(data.get("location"))
    return data

def merge_details(old, new):
    """Keep what we already knew, add anything new from the latest message."""
    merged = dict(old)
    for key in FIELDS + ["language"]:
        value = new.get(key)
        if value not in (None, "", 0):
            merged[key] = value
    if new.get("location") not in (None, "", 0):
        merged["state"] = new.get("state")      # state belongs to the latest place named
    return merged

def missing_fields(details):
    return [f for f in FIELDS if details.get(f) in (None, "", 0)]

ASK_MISSING = {
    "en": {
        "location": "Where is your farm located?",
        "land_size": "How big is your land?",
        "land_unit": "Is that in acres, bigha or kanal?",
        "crop": "Which crop do you want to grow?",
    },
    "hi": {
        "location": "आपका खेत कहाँ है?",
        "land_size": "आपकी ज़मीन कितनी बड़ी है?",
        "land_unit": "यह एकड़, बीघा या कनाल में है?",
        "crop": "आप कौन सी फसल उगाना चाहते हैं?",
    },
    "pa": {
        "location": "ਤੁਹਾਡਾ ਖੇਤ ਕਿੱਥੇ ਹੈ?",
        "land_size": "ਤੁਹਾਡੀ ਜ਼ਮੀਨ ਕਿੰਨੀ ਵੱਡੀ ਹੈ?",
        "land_unit": "ਇਹ ਏਕੜ, ਬੀਘਾ ਜਾਂ ਕਨਾਲ ਵਿੱਚ ਹੈ?",
        "crop": "ਤੁਸੀਂ ਕਿਹੜੀ ਫ਼ਸਲ ਬੀਜਣੀ ਚਾਹੁੰਦੇ ਹੋ?",
    },
}

OPENING = {
    "en": "Namaste! Tell me three things: where your farm is, how big your land is, and which crop you want to grow.",
    "hi": "नमस्ते! मुझे तीन बातें बताइए: आपका खेत कहाँ है, ज़मीन कितनी बड़ी है, और आप कौन सी फसल उगाना चाहते हैं।",
    "pa": "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਨੂੰ ਤਿੰਨ ਗੱਲਾਂ ਦੱਸੋ: ਤੁਹਾਡਾ ਖੇਤ ਕਿੱਥੇ ਹੈ, ਜ਼ਮੀਨ ਕਿੰਨੀ ਹੈ, ਅਤੇ ਤੁਸੀਂ ਕਿਹੜੀ ਫ਼ਸਲ ਬੀਜਣੀ ਚਾਹੁੰਦੇ ਹੋ।",
}


# ---------- Stage 3 + 4: data file and calculations ----------
def _fertilizer_file():
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "fertilizers.json"), encoding="utf-8") as f:
        return json.load(f)

def load_fertilizers():
    """Crops that have checked figures in fertilizers.json (ICAR district table)."""
    return _fertilizer_file()["crops"]

def advice_crops():
    """Every crop we can give checked advice for: ICAR table crops plus PAU product guides."""
    data = _fertilizer_file()
    names = set(data["crops"]) | {k.split("|")[0] for k in data.get("product_guides", {})}
    return sorted(names)

def land_in_acres(size, unit, state=None):
    per_unit = geo.acres_per_unit(unit, state)
    return float(size) * (per_unit if per_unit is not None else 1.0)

def unit_note(unit, state=None):
    """A caption when the unit size differs from place to place (bigha family)."""
    unit = geo.normalize_unit(unit)
    if unit in geo.BIGHA_FAMILY:
        used = state if state in geo.BIGHA_ACRES else geo.BIGHA_DEFAULT_STATE
        acres = geo.acres_per_unit(unit, used)
        return (f"1 {unit} is taken as {acres:.4g} acre ({used} standard). "
                "Local bigha sizes differ, so please confirm your land in acres.")
    return ""

def no_advice_message(crop):
    known = ", ".join(advice_crops())
    if geo.is_known_crop(crop):
        return (f"I know '{crop}', but I do not have checked fertilizer figures for it yet. "
                f"I can give checked advice for: {known}.")
    return f"Sorry, I did not recognise the crop '{crop}'. I can help with: {known}."

# Nutrient content of the fertilizers (share of the bag's weight)
UREA_N = 0.46      # urea is 46% nitrogen
DAP_N = 0.18       # DAP is 18-46-0
DAP_P2O5 = 0.46
MOP_K2O = 0.60     # muriate of potash is 60% K2O
HA_PER_ACRE = 1 / 2.47105

def resolve_place(details, weather):
    """Returns (district, state). Either can be None."""
    if details.get("state"):
        return details["location"], details["state"]
    if weather:
        district, state = geo.normalize_location(weather.get("district"))
        if state:
            return district, state
        if weather.get("state") in geo.DISTRICTS:
            return None, weather["state"]
    return None, None

def _timing(data, crop, state, product, default):
    """When to apply a product: from fertilizers.json if checked, else a general line."""
    return data.get("timing", {}).get(f"{crop}|{state}", {}).get(product, default)

def _weather_suffix(flags):
    return "".join(" (" + WEATHER_WARNINGS[f] + ")" for f in WARNING_ORDER if f in flags)

def _guide_advice(data, crop, state, acres, flags):
    """Advice from a PAU / ICAR product guide (kg of each fertilizer per acre)."""
    guide = data["product_guides"][f"{crop}|{state}"]
    rows = []
    for name, per_acre in guide["per_acre_kg"].items():
        kg = per_acre * acres
        if kg < 0.5:
            continue
        when = guide["timing"].get(name, "Ask your local agriculture office for exact timing")
        if name.startswith("Urea"):
            when += _weather_suffix(flags)
        why = {"Urea": "Gives nitrogen for leaves and stems",
               "DAP": "Gives phosphorus for roots, and some nitrogen"}.get(
            name, "Gives phosphorus and sulphur for roots and good seed")
        rows.append({"What to use": name, "How much (for your land)": f"{kg:.0f} kg",
                     "When": when, "Why": why})
    notes = [guide["note"]]
    notes += [v for k, v in data.get("notes", {}).items() if k.startswith(f"{crop}|{state}|")]
    amounts = " + ".join(f"{v} kg {k.split(' (')[0]}" for k, v in guide["per_acre_kg"].items())
    note = (f"Based on: {guide['label']} ({amounts} per acre). "
            "Your Soil Health Card and local PAU/state guide come first. " + " ".join(notes))
    return {"rows": rows, "note": note.strip(), "message": None}

def get_advice(crop, acres, district, state, flags=(), month=None):
    """Returns {"rows": [...], "note": "...", "message": None} on success, or
    {"rows": None, "message": "..."} when we cannot give checked advice."""
    crop = str(crop).lower()
    data = _fertilizer_file()
    entry = data["crops"].get(crop)
    has_guide = any(k.startswith(crop + "|") for k in data.get("product_guides", {}))
    if entry is None and not has_guide:
        return {"rows": None, "message": no_advice_message(crop)}
    if state is None:
        return {"rows": None, "message": "I could not tell if this place is in Punjab or Uttar Pradesh. "
                                         "Please tell me your district."}
    if f"{crop}|{state}" in data.get("product_guides", {}):
        return _guide_advice(data, crop, state, acres, flags)
    if entry is None:
        return {"rows": None, "message": f"I do not have checked figures for {crop} in {state} yet."}
    month = month or datetime.date.today().month
    seasons = entry["seasons"]
    season = "all" if "all" in seasons else ("kharif" if 6 <= month <= 10 else "rabi")
    notes = []
    table = seasons.get(season, {}).get(state)
    if table is None:                        # e.g. rabi maize has no Punjab figures
        for name, by_state in seasons.items():
            if state in by_state:
                season, table = name, by_state[state]
                notes.append(f"No {state} figures for this season, so the {name} figures are shown.")
                break
    if table is None:
        return {"rows": None, "message": f"I do not have checked figures for {crop} in {state} yet."}

    dose = table.get(district) if district else None
    if dose is not None:
        basis = f"{district}, {state}"
    else:
        values = list(table.values())
        dose = [int(round(sum(v[i] for v in values) / len(values) / 5.0) * 5) for i in range(3)]
        basis = f"the average of {state} districts"
        notes.append("Your district was not found, so the state average is used.")

    n, p, k = (x * HA_PER_ACRE * acres for x in dose)     # kg of nutrient for this land
    dap = p / DAP_P2O5
    urea = max(0.0, (n - dap * DAP_N) / UREA_N)           # DAP already supplies some nitrogen
    mop = k / MOP_K2O
    items = [
        ("Urea", urea, _timing(data, crop, state, "Urea",
         "In 2-3 split doses while the crop grows (ask your local office for exact timing)"),
         "Gives nitrogen for leaves and stems", True),
        ("DAP", dap, _timing(data, crop, state, "DAP",
                                    "Before transplanting" if crop == "rice" else "At sowing"),
         "Gives phosphorus for roots, and some nitrogen", False),
        ("MOP (potash)", mop, _timing(data, crop, state, "MOP (potash)", "At sowing"),
         "Gives potash for strong plants and good grain", False),
    ]
    rows = []
    for name, kg, when, why, sensitive in items:
        if kg < 0.5:
            continue
        if sensitive:
            when += _weather_suffix(flags)
        rows.append({"What to use": name, "How much (for your land)": f"{kg:.0f} kg",
                     "When": when, "Why": why})
    notes += [v for key, v in data.get("notes", {}).items() if key.startswith(f"{crop}|{state}")]
    season_text = "" if season == "all" else f" ({season} season)"
    note = (f"Based on the ICAR district recommendation for {basis}{season_text}: "
            f"N {dose[0]}, P2O5 {dose[1]}, K2O {dose[2]} kg per hectare. "
            "Your Soil Health Card and local PAU/state guide come first. ") + " ".join(notes)
    return {"rows": rows, "note": note.strip(), "message": None}

# ---------- Stage 5: weather (free, no key) ----------
# Open-Meteo gives the 2-day forecast and soil conditions.
# NASA POWER gives the long-term typical weather for this month (climatology).

# Rough thresholds. These are starting points: have an agronomist confirm them.
RAIN_MM = 10          # this much rain in 2 days = wait before urea
RAIN_CHANCE = 70      # % chance of rain
WIND_KMH = 25         # above this, spreading fertilizer is wasteful
HOT_C = 38            # above this, apply in the evening
COLD_C = 5            # night minimum below this, apply in the warmer part of the day
DRY_SOIL = 0.15       # soil moisture (m3/m3) below this = dry topsoil

WEATHER_WARNINGS = {
    "rain": "Heavy rain expected soon: wait until it stops",
    "wind": "Strong wind expected: apply when the air is calm",
    "hot": "Very hot days ahead: apply in the evening",
    "cold": "Very cold nights ahead: apply in the warmer part of the day",
    "dry": "Soil is dry: irrigate after applying",
}
WARNING_ORDER = ["rain", "wind", "hot", "cold", "dry"]

def _average(values):
    values = [v for v in values if v is not None]
    return sum(values) / len(values) if values else None

def _round(value, digits=1):
    return None if value is None else round(value, digits)

def get_weather(location, state=None):
    """Returns a dict of forecast + soil numbers, or None if anything fails.
    Any single value can be None if Open-Meteo has no data for it."""
    try:
        found = requests.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={"name": geo.GEOCODE_NAME.get(location, location), "count": 10,
                    "countryCode": "IN", "language": "en"},
            timeout=8,
        ).json()
        results = found.get("results") or []
        if not results:
            return None
        wanted = ([state] if state else []) + geo.PREFERRED_STATES
        place = results[0]
        for st_name in wanted:                  # prefer a match inside Punjab / UP
            match = next((r for r in results if r.get("admin1") == st_name), None)
            if match:
                place = match
                break
        data = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": place["latitude"],
                "longitude": place["longitude"],
                "daily": ",".join([
                    "precipitation_sum",
                    "precipitation_probability_max",
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "et0_fao_evapotranspiration",
                    "wind_speed_10m_max",
                ]),
                "hourly": "soil_moisture_3_to_9cm,soil_temperature_6cm",
                "forecast_days": 2,
                "timezone": "auto",
            },
            timeout=8,
        ).json()
        daily = data["daily"]
        hourly = data.get("hourly", {})
        probs = [p for p in daily.get("precipitation_probability_max", []) if p is not None]
        temps_max = [t for t in daily.get("temperature_2m_max", []) if t is not None]
        temps_min = [t for t in daily.get("temperature_2m_min", []) if t is not None]
        winds = [w for w in daily.get("wind_speed_10m_max", []) if w is not None]
        return {
            "place": place["name"],
            "state": place.get("admin1", ""),
            "district": place.get("admin2", ""),
            "lat": place["latitude"],
            "lon": place["longitude"],
            "rain_mm": round(sum(x or 0 for x in daily["precipitation_sum"]), 1),
            "rain_chance": max(probs) if probs else None,          # %
            "temp_max": max(temps_max) if temps_max else None,     # deg C
            "temp_min": min(temps_min) if temps_min else None,     # deg C
            "wind_max": max(winds) if winds else None,             # km/h
            "et0_mm": _round(sum(x or 0 for x in daily.get("et0_fao_evapotranspiration", []))),
            "soil_moisture": _round(_average(hourly.get("soil_moisture_3_to_9cm", [])[:24]), 2),
            "soil_temp": _round(_average(hourly.get("soil_temperature_6cm", [])[:24])),
        }
    except Exception:
        return None

def get_climate(weather):
    """Typical rain and temperature for this month, from NASA POWER (no key).
    Returns {'rain_mm_per_day': ..., 'temp_c': ...} or None."""
    if weather is None:
        return None
    try:
        data = requests.get(
            "https://power.larc.nasa.gov/api/temporal/climatology/point",
            params={
                "parameters": "PRECTOTCORR,T2M",
                "community": "ag",
                "latitude": weather["lat"],
                "longitude": weather["lon"],
                "format": "json",
            },
            timeout=15,
        ).json()
        month = datetime.date.today().strftime("%b").upper()   # e.g. "OCT"
        params = data["properties"]["parameter"]
        rain = params["PRECTOTCORR"][month]
        temp = params["T2M"][month]
        if rain is None or temp is None or rain < 0 or temp < -900:   # -999 = missing
            return None
        return {"rain_mm_per_day": round(rain, 1), "temp_c": round(temp, 1)}
    except Exception:
        return None

def weather_flags(weather):
    """Which weather warnings apply right now. Returns a set like {'rain', 'wind'}."""
    flags = set()
    if weather is None:
        return flags
    if weather["rain_mm"] >= RAIN_MM or (weather["rain_chance"] or 0) >= RAIN_CHANCE:
        flags.add("rain")
    if (weather["wind_max"] or 0) >= WIND_KMH:
        flags.add("wind")
    if (weather["temp_max"] or 0) >= HOT_C:
        flags.add("hot")
    if weather["temp_min"] is not None and weather["temp_min"] <= COLD_C:
        flags.add("cold")
    if weather["soil_moisture"] is not None and weather["soil_moisture"] < DRY_SOIL:
        flags.add("dry")
    if "rain" in flags:
        flags.discard("dry")      # rain is coming, so no need to tell them to irrigate
    return flags

def weather_note(weather, climate=None):
    """One short line for the screen, in English."""
    if weather is None:
        return "Weather could not be checked right now."
    where = ", ".join(x for x in [weather["place"], weather.get("state")] if x)
    parts = [f"{where}, next 2 days: rain {weather['rain_mm']} mm"]
    if weather["rain_chance"] is not None:
        parts.append(f"rain chance {weather['rain_chance']:.0f}%")
    if weather["wind_max"] is not None:
        parts.append(f"wind up to {weather['wind_max']:.0f} km/h")
    if weather["soil_moisture"] is not None:
        parts.append(f"soil moisture {weather['soil_moisture']}")
    note = ", ".join(parts) + "."
    if climate:
        note += f" Usual for this month: about {climate['rain_mm_per_day']} mm rain per day."
    return note


# ---------- Stage 6: simple explanation in the farmer's language ----------
LANG_NAME = {"en": "English", "hi": "Hindi", "pa": "Punjabi"}

def explain(details, acres, rows, weather, language, climate=None, price=None):
    # Temperature is used only to choose the advice (the "hot"/"cold" flags change the
    # timing in the table). It is NOT passed to the writer, so it can never be read out.
    facts = {
        "crop": details["crop"],
        "location": details["location"],
        "acres": round(acres, 2),
        "table": rows,
        "weather_advice": [WEATHER_WARNINGS[f] for f in WARNING_ORDER
                           if f in weather_flags(weather)],
    }
    if price:
        facts["price_rupees_per_quintal"] = price
    prompt = (
        f"Write 3 or 4 short, very simple sentences in {LANG_NAME.get(language, 'English')} "
        "for a farmer. Summarise the advice below and say the full details are on the screen. "
        "Use ONLY the numbers given. Do not invent any number or product. "
        "Never say the temperature, the forecast or any weather numbers. If weather_advice "
        "is not empty, mention it only as a simple instruction (for example: apply urea in "
        "the evening), without saying why in numbers. If price_rupees_per_quintal is present, "
        "add ONE short sentence saying the approximate price in rupees per quintal (a quintal "
        "is 100 kg), using the market price if given, otherwise the support price.\n\n"
        + json.dumps(facts, ensure_ascii=False)
    )
    resp = get_client().chat.completions.create(
        model=CHAT_MODEL,
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.choices[0].message.content.strip()


# ---------- Stage 8: speech to text ----------
# Main: Sarvam Saaras v3 (made for Hindi/Punjabi/Indian English and mixed-language speech).
# Fallback: Groq Whisper large-v3. Both are tried automatically, best first.
# Whisper only reads about 224 tokens of hint, so the full district list cannot go here.
# The hint carries the most likely names; the extraction step then snaps whatever was
# heard to the full list of Punjab and UP districts (see india_data.py).
# Each language has a long and a short hint; if Groq rejects the long one we try the short.
HINTS = {
    None: ["Kisan: gehu, dhan, makka, sarson, ganna, kapas, bajra, aloo, wheat, rice, maize, "
           "mustard, sugarcane, cotton, acre, killa, bigha, biswa, kanal, marla, Ludhiana, "
           "Amritsar, Jalandhar, Patiala, Bathinda, Sangrur, Moga, Ferozepur, Lucknow, Kanpur, "
           "Agra, Meerut, Varanasi, Gorakhpur, Bareilly, Prayagraj, Aligarh, Mathura, urea, DAP.",
           "Gehu, dhan, makka, acre, bigha, kanal, Ludhiana, Amritsar, Patiala, Lucknow, Meerut."],
    "en": ["Wheat, rice, maize, mustard, sugarcane, cotton, acre, killa, bigha, kanal, Ludhiana, "
           "Amritsar, Jalandhar, Patiala, Bathinda, Sangrur, Lucknow, Kanpur, Agra, Meerut, "
           "Varanasi, Gorakhpur, Bareilly, Prayagraj, urea, DAP.",
           "Wheat, rice, maize, acre, bigha, kanal, Ludhiana, Amritsar, Lucknow, Meerut."],
    "hi": ["गेहूं, धान, मक्का, सरसों, गन्ना, कपास, एकड़, बीघा, कनाल, किल्ला, लुधियाना, अमृतसर, "
           "पटियाला, बठिंडा, लखनऊ, कानपुर, आगरा, मेरठ, वाराणसी, गोरखपुर, बरेली, प्रयागराज।",
           "गेहूं, धान, मक्का, एकड़, बीघा, लुधियाना, लखनऊ, मेरठ।"],
    "pa": ["ਕਣਕ, ਝੋਨਾ, ਮੱਕੀ, ਕਪਾਹ, ਗੰਨਾ, ਏਕੜ, ਕਨਾਲ, ਕਿੱਲਾ, ਲੁਧਿਆਣਾ, ਅੰਮ੍ਰਿਤਸਰ, ਜਲੰਧਰ, "
           "ਪਟਿਆਲਾ, ਬਠਿੰਡਾ, ਸੰਗਰੂਰ, ਮੋਗਾ।",
           "ਕਣਕ, ਝੋਨਾ, ਏਕੜ, ਲੁਧਿਆਣਾ, ਪਟਿਆਲਾ।"],
}

# ---- Sarvam (main) ----
SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text"
SARVAM_LANG = {None: "unknown", "en": "en-IN", "hi": "hi-IN", "pa": "pa-IN"}
SARVAM_MAX_SECONDS = 29          # Sarvam's REST endpoint accepts up to 30 s
# "codemix" keeps English words (acre, Ludhiana) in English and the rest in the farmer's
# script. Set SARVAM_STT_MODE=transcribe in .env if you prefer plain output.
SARVAM_STT_MODE = os.environ.get("SARVAM_STT_MODE", "codemix").strip()

# Whisper invents these phrases on silence or noise; treat them as "heard nothing".
_JUNK = {"thank you", "thanks for watching", "thank you for watching", "you", "bye",
         "subtitles by", "धन्यवाद", "ਧੰਨਵਾਦ"}

def _wav_info(audio_bytes):
    """(seconds, loudness 0-1) for a WAV file, or (None, None) if it cannot be read."""
    import io, wave, array
    try:
        with wave.open(io.BytesIO(audio_bytes)) as w:
            seconds = w.getnframes() / float(w.getframerate())
            if w.getsampwidth() != 2:
                return seconds, None
            samples = array.array("h", w.readframes(w.getnframes()))
        if not samples:
            return seconds, 0.0
        peak = max(abs(x) for x in samples[:: max(1, len(samples) // 20000)])
        return seconds, peak / 32768.0
    except Exception:
        return None, None

last_stt = {"engine": None, "error": None}     # shown on screen to help debugging

def _sarvam_transcribe(audio_bytes, language):
    key = os.environ.get("SARVAM_API_KEY", "").strip()
    if not key:
        last_stt["error"] = "SARVAM_API_KEY not found in .env (restart Streamlit after editing .env)"
        return None
    modes = [SARVAM_STT_MODE, None] if SARVAM_STT_MODE else [None]
    for mode in modes:                       # if the mode name is rejected, retry without it
        data = {"model": SARVAM_STT_MODEL, "language_code": SARVAM_LANG.get(language, "unknown")}
        if mode:
            data["mode"] = mode
        r = requests.post(
            SARVAM_STT_URL,
            headers={"api-subscription-key": key},
            files={"file": ("speech.wav", audio_bytes, "audio/wav")},
            data=data,
            timeout=30,
        )
        if r.status_code == 200:
            return (r.json().get("transcript") or "").strip()
        last_stt["error"] = f"Sarvam said {r.status_code}: {r.text[:200]}"
        if r.status_code not in (400, 422):  # auth, quota, server error: give up on Sarvam
            return None
    return None

# ---- Groq Whisper (fallback) ----
def _groq_transcribe(audio_bytes, language):
    kwargs = {"language": language} if language else {}
    hints = HINTS.get(language, HINTS[None]) + [None]       # last try: no hint at all
    last_error = None
    for hint in hints:
        try:
            extra = dict(kwargs)
            if hint:
                extra["prompt"] = hint
            resp = get_client().audio.transcriptions.create(
                file=("speech.wav", audio_bytes),
                model=STT_MODEL,
                temperature=0,
                **extra,
            )
            return (resp.text or "").strip()
        except Exception as e:
            last_error = e
    raise last_error

def transcribe(audio_bytes, language=None):
    """language: "en", "hi", "pa", or None to auto-detect. Returns text, or "" if nothing
    clear was heard."""
    seconds, loudness = _wav_info(audio_bytes)
    if loudness is not None and loudness < 0.01:        # silence: do not let Whisper invent words
        return ""

    last_stt.update(engine=None, error=None)
    text = ""
    if seconds is None or seconds <= SARVAM_MAX_SECONDS:
        try:
            text = _sarvam_transcribe(audio_bytes, language) or ""
            if text:
                last_stt["engine"] = "Sarvam Saaras"
        except Exception as e:
            last_stt["error"] = f"Sarvam failed: {e}"
            text = ""
    if not text:
        text = _groq_transcribe(audio_bytes, language)
        last_stt["engine"] = "Groq Whisper (backup)"

    if text.strip(" .!।").lower() in _JUNK:
        return ""
    return text
