SETUP (do once)
1. Copy .env.example to a new file named .env and put your Groq key after GROQ_API_KEY=
2. For the best Hindi/Punjabi voice, get a Sarvam key (https://dashboard.sarvam.ai) and add to .env:
       SARVAM_API_KEY=your_key
   Optional: SARVAM_SPEAKER=shubh   VOICE_GENDER=female   (VOICE_GENDER is for the fallback voice)
   The same key also powers speech-to-text (Sarvam Saaras, best for Hindi/Punjabi); Groq Whisper is the backup.
   Optional: SARVAM_STT_MODE=transcribe  (default is codemix, which keeps English words like 'acre' in English)
   Without a Sarvam key the app uses Microsoft voices (edge-tts), then gTTS.
   Live market (mandi) prices: get a free key at https://data.gov.in (create an account, open
   "My Account", copy the API key) and add to .env:
       DATA_GOV_API_KEY=your_key
   Without it the bot still shows the government support price (MSP).
   Test the connection with:   python check_prices.py
3. In the terminal, inside this folder:   pip install -r requirements.txt
4. Run:   streamlit run app.py
5. A browser tab opens. Allow microphone access when asked.

BEFORE THE HACKATHON
- Compare a few districts in fertilizers.json against the current PAU guide and fill the pending crops.
- Support prices (MSP/FRP) are in prices.py: update them when the government announces new ones.
- Run  python check_prices.py  and fix any crop that shows 'no price'.
- Run  python check_soil.py  to test the soil-of-your-area service (free, no key, can be slow).
