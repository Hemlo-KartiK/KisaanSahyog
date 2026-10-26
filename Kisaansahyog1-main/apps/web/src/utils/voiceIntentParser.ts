// ============================================================================
// Phase 8: Multilingual Voice Assistant & Voice-to-Action Engine
// Client-side rule-based NLP intent parser for Indian agricultural terminology
// ============================================================================

export type VoiceIntentType =
  | 'INTENT_SELL_CROP'
  | 'INTENT_WEATHER_IRRIGATION'
  | 'INTENT_FERTILIZER_SOIL'
  | 'INTENT_MANDI_RATES'
  | 'INTENT_UNKNOWN';

export interface ParsedVoiceIntent {
  intent: VoiceIntentType;
  targetTab?: 'sell' | 'advisory' | 'soil' | 'market';
  extractedCrop?: string;
  extractedCropHi?: string;
  ttsResponse: string;
  ttsResponseEn: string;
  confidence: number;
}

export function parseVoiceIntent(
  rawTranscript: string,
  lang: string = 'hi',
): ParsedVoiceIntent {
  const text = (rawTranscript || '').trim().toLowerCase();
  const isEnglish = lang === 'en';

  if (!text) {
    return {
      intent: 'INTENT_UNKNOWN',
      ttsResponse: isEnglish
        ? 'Sorry, no speech was detected. Please speak again.'
        : 'क्षमा करें, कोई आवाज सुनाई नहीं दी। कृपया दोबारा बोलें।',
      ttsResponseEn: 'Sorry, no speech was detected. Please speak again.',
      confidence: 0,
    };
  }

  // 1. INTENT_SELL_CROP
  const sellKeywords = [
    'बेचना',
    'बेचनी',
    'बेचूं',
    'बेच',
    'लिस्ट',
    'बिक्री',
    'sell',
    'selling',
    'list crop',
    'put on sale',
    'listing',
  ];

  const hasSellKeyword = sellKeywords.some((kw) => text.includes(kw));

  // Extract crop mention
  let extractedCrop: string | undefined;
  let extractedCropHi: string | undefined;

  if (text.includes('गेहूं') || text.includes('wheat') || text.includes('gehu')) {
    extractedCrop = 'Wheat';
    extractedCropHi = 'गेहूं';
  } else if (
    text.includes('सरसों') ||
    text.includes('mustard') ||
    text.includes('sarso')
  ) {
    extractedCrop = 'Mustard';
    extractedCropHi = 'सरसों';
  } else if (
    text.includes('चना') ||
    text.includes('chana') ||
    text.includes('gram') ||
    text.includes('chickpea')
  ) {
    extractedCrop = 'Chana';
    extractedCropHi = 'चना';
  } else if (
    text.includes('बासमती') ||
    text.includes('धान') ||
    text.includes('चावल') ||
    text.includes('basmati') ||
    text.includes('paddy')
  ) {
    extractedCrop = 'Basmati';
    extractedCropHi = 'बासमती धान';
  }

  if (hasSellKeyword || (extractedCrop && (text.includes('क्विंटल') || text.includes('quintal')))) {
    const cropMention = extractedCropHi
      ? `${extractedCropHi} की बिक्री स्क्रीन खोल दी गई है।`
      : 'फसल बिक्री स्क्रीन खोल दी गई है।';

    const ttsResponse = `${cropMention} कृपया मात्रा और अपेक्षित दर दर्ज करें।`;
    const ttsResponseEn = `Crop selling screen opened for ${extractedCrop || 'your crop'}. Please enter the quantity and asking rate.`;

    return {
      intent: 'INTENT_SELL_CROP',
      targetTab: 'sell',
      extractedCrop,
      extractedCropHi,
      ttsResponse: isEnglish ? ttsResponseEn : ttsResponse,
      ttsResponseEn,
      confidence: 0.95,
    };
  }

  // 2. INTENT_WEATHER_IRRIGATION
  const weatherKeywords = [
    'मौसम',
    'बारिश',
    'पानी',
    'सिंचाई',
    'वर्षा',
    'तापमान',
    'बादल',
    'बरसात',
    'weather',
    'rain',
    'irrigation',
    'temperature',
    'forecast',
    'climate',
  ];

  if (weatherKeywords.some((kw) => text.includes(kw))) {
    const ttsResponse =
      'सीतापुर में आज तापमान 24 डिग्री और आसमान साफ है। अगले 48 घंटे में भारी वर्षा का कोई अनुमान नहीं है।';
    const ttsResponseEn =
      'In Sitapur today, temperature is 24 degrees with clear sky. No heavy rainfall is forecasted for the next 48 hours.';

    return {
      intent: 'INTENT_WEATHER_IRRIGATION',
      targetTab: 'advisory',
      ttsResponse: isEnglish ? ttsResponseEn : ttsResponse,
      ttsResponseEn,
      confidence: 0.92,
    };
  }

  // 3. INTENT_FERTILIZER_SOIL
  const fertilizerKeywords = [
    'खाद',
    'यूरिया',
    'डीएपी',
    'मिट्टी',
    'खुराक',
    'उर्वरक',
    'पोटाश',
    'जिंक',
    'एनपीके',
    'तत्व',
    'fertilizer',
    'soil',
    'urea',
    'dap',
    'dosage',
    'prescription',
    'npk',
    'potash',
  ];

  if (fertilizerKeywords.some((kw) => text.includes(kw))) {
    const ttsResponse =
      'आपके 3 एकड़ खेत के लिए ICAR मानक के अनुसार कुल ढाई बोरी DAP और 4 बोरी यूरिया की आवश्यकता है।';
    const ttsResponseEn =
      'According to ICAR standards for your 3-acre field, a total of 2.5 bags of DAP and 4 bags of Urea are required.';

    return {
      intent: 'INTENT_FERTILIZER_SOIL',
      targetTab: 'soil',
      ttsResponse: isEnglish ? ttsResponseEn : ttsResponse,
      ttsResponseEn,
      confidence: 0.94,
    };
  }

  // 4. INTENT_MANDI_RATES
  const mandiKeywords = [
    'भाव',
    'मंडी',
    'रेट',
    'दाम',
    'कीमत',
    'बाजार',
    'mandi',
    'rate',
    'price',
    'rates',
    'market',
    'bhav',
  ];

  if (mandiKeywords.some((kw) => text.includes(kw))) {
    const ttsResponse =
      'सीतापुर मंडी में आज गेहूं का औसत भाव ₹2,400 और सरसों ₹5,350 प्रति क्विंटल चल रहा है।';
    const ttsResponseEn =
      'In Sitapur mandi today, the modal rate for Wheat is ₹2,400 and Mustard is ₹5,350 per quintal.';

    return {
      intent: 'INTENT_MANDI_RATES',
      targetTab: 'market',
      ttsResponse: isEnglish ? ttsResponseEn : ttsResponse,
      ttsResponseEn,
      confidence: 0.91,
    };
  }

  // 5. INTENT_UNKNOWN
  const ttsResponse =
    'क्षमा करें, मैं समझ नहीं पाया। आप फसल बेचने, मौसम, खाद या मंडी भाव के बारे में पूछ सकते हैं।';
  const ttsResponseEn =
    'Sorry, I did not understand that. You can ask about selling crops, weather, fertilizer doses, or mandi prices.';

  return {
    intent: 'INTENT_UNKNOWN',
    ttsResponse: isEnglish ? ttsResponseEn : ttsResponse,
    ttsResponseEn,
    confidence: 0.3,
  };
}
