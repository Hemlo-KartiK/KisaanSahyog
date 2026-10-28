"""The screen. Run with:  streamlit run app.py"""
import hashlib
import pandas as pd
import streamlit as st

import bot_logic as bot
import prices
import soil
import voice

st.set_page_config(page_title="Smart Agriculture Copilot", page_icon="🌱")
st.title("🌱 Smart Agriculture Copilot")

# ---- Remember things between button presses ----
if "details" not in st.session_state:
    st.session_state.details = {}
    st.session_state.language = "en"
    st.session_state.reply = None       # text of the bot's last reply
    st.session_state.rows = None        # table rows (or None)
    st.session_state.last_audio = None  # to avoid handling the same recording twice

@st.cache_data(show_spinner=False)
def speak(text, language):
    """audio bytes (wav or mp3) of the spoken reply, or None if it fails. Cached so a rerun
    does not generate the same audio again."""
    return voice.speak(text, language)

def handle_message(message):
    """The whole pipeline for one farmer message."""
    try:
        new = bot.extract_details(message)
    except Exception as e:
        st.error(f"Technical error: {e}")
        st.session_state.reply = "Sorry, I could not understand that. Please try again."
        st.session_state.rows = None
        return

    st.session_state.details = bot.merge_details(st.session_state.details, new)
    d = st.session_state.details
    lang = d.get("language", "en")
    if lang not in bot.OPENING:
        lang = "en"
    st.session_state.language = lang

    # Stage 2: ask only for what is missing
    missing = bot.missing_fields(d)
    if missing:
        st.session_state.reply = bot.ASK_MISSING[lang][missing[0]]
        st.session_state.rows = None
        return

    # Stage 4 + 5: weather first (it can tell us the state/district), then calculate
    weather = bot.get_weather(d["location"], d.get("state"))
    district, state = bot.resolve_place(d, weather)
    acres = bot.land_in_acres(d["land_size"], d["land_unit"], state)
    st.session_state.unit_note = bot.unit_note(d["land_unit"], state)
    climate = bot.get_climate(weather)
    advice = bot.get_advice(d["crop"], acres, district, state, bot.weather_flags(weather))
    rows = advice["rows"]

    if rows is None:
        st.session_state.reply = advice["message"]
        st.session_state.rows = None
        return
    st.session_state.advice_note = advice["note"]

    # Weather + soil of the area (soil is a free map estimate; may be unavailable)
    try:
        soil_info = soil.get_soil(weather["lat"], weather["lon"]) if weather else None
        field = soil.build_field_report(weather, soil_info)
    except Exception:
        field = None
    st.session_state.field_rows = soil.field_rows(field)
    st.session_state.soil_tips = soil.soil_tips(field)

    # Approximate crop price: government support price + live market price (if available)
    try:
        price_info = prices.get_price_info(d["crop"], district, state)
    except Exception:
        price_info = {"rows": [], "caption": ""}
    st.session_state.price_rows = price_info["rows"]
    st.session_state.price_caption = price_info["caption"]

    # Stage 6: friendly explanation + table
    try:
        st.session_state.reply = bot.explain(d, acres, rows, weather, lang, climate,
                                             prices.price_facts(price_info) or None,
                                             soil.field_facts(field))
    except Exception:
        st.session_state.reply = "Here is the advice for your land. Please see the table."
    st.session_state.rows = rows
    st.session_state.weather_note = bot.weather_note(weather, climate)

# ---- Screen ----
lang_now = st.session_state.language
st.info(bot.OPENING[lang_now])

# Stage 8: microphone
STT_LANGUAGES = {"Auto": None, "English": "en", "Hindi": "hi", "Punjabi": "pa"}
stt_choice = st.radio("Speaking language", list(STT_LANGUAGES), horizontal=True)
audio = st.audio_input("🎤 Tap to speak, tap again to stop")
if audio is not None:
    data = audio.getvalue()
    digest = hashlib.md5(data).hexdigest()
    if digest != st.session_state.last_audio:
        st.session_state.last_audio = digest
        with st.spinner("Listening..."):
            try:
                heard = bot.transcribe(data, STT_LANGUAGES[stt_choice])
            except Exception:
                heard = None
        if heard:
            st.write(f"**I heard:** {heard}")
            with st.spinner("Thinking..."):
                handle_message(heard)
        else:
            st.session_state.reply = "I could not hear that clearly. Please try again or type below."
            st.session_state.rows = None

# Backup: typing
typed = st.chat_input("Or type here (Hindi, Punjabi or English)")
if typed:
    handle_message(typed)

# Show the bot's answer
if st.session_state.reply:
    st.subheader("Answer")
    st.write(st.session_state.reply)

    # Stage 7: speaker
    clip = speak(st.session_state.reply, st.session_state.language)
    if clip:
        st.audio(clip, format=voice.mime_type(clip))

    if st.session_state.rows:
        if st.session_state.get("field_rows"):
            st.subheader("Weather and soil in your area")
            st.table(pd.DataFrame(st.session_state.field_rows))
            for tip in st.session_state.get("soil_tips", []):
                st.caption("Tip: " + tip)
            st.caption(soil.SOIL_CAPTION)
        st.subheader("Fertilizer advice")
        st.table(pd.DataFrame(st.session_state.rows))
        if st.session_state.get("price_rows"):
            st.subheader("Approximate price of your crop")
            st.table(pd.DataFrame(st.session_state.price_rows))
            st.caption(st.session_state.get("price_caption", ""))
        st.caption(st.session_state.get("weather_note", ""))
        if st.session_state.get("unit_note"):
            st.caption(st.session_state.unit_note)
        st.caption("Wrong place? Type the correct location below and the advice will update.")
        if st.session_state.get("advice_note"):
            st.caption(st.session_state.advice_note)
        st.caption("This advice is indicative. Please confirm with your local agriculture office.")

if st.button("Start again"):
    st.session_state.clear()
    st.rerun()
