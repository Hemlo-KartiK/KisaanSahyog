import {
  BUYER_TABS,
  FARMER_TABS,
  LANGUAGES,
  type BuyerTab,
  type FarmerTab,
  type Language,
  type NavKey,
  type Role,
  type WeatherStatus,
} from "./constants.js";

export interface Dictionary {
  app: {
    name: string;
    tagline: string;
  };
  nav: Record<NavKey, string>;
  greetings: {
    morning: string;
    afternoon: string;
    evening: string;
    welcome: string;
    welcomeBack: string;
  };
  roles: Record<Role, string>;
  weather: Record<WeatherStatus, string>;
  screens: Record<NavKey | "voice", string>;
  common: {
    language: string;
    changeLanguage: string;
    role: string;
    switchRole: string;
    twoGMode: string;
    dataSaver: string;
    online: string;
    offline: string;
    enabled: string;
    disabled: string;
    close: string;
    voiceAssistant: string;
    activeTab: string;
    screenSlot: string;
    loading: string;
    retry: string;
  };
  auth: {
    welcome: string;
    subtitle: string;
    farmerLogin: string;
    farmerDesc: string;
    buyerLogin: string;
    buyerDesc: string;
    demoFarmerBtn: string;
    demoBuyerBtn: string;
    logout: string;
    phonePlaceholder: string;
    continue: string;
  };
  disclaimers: {
    kvkTitle: string;
    kvkShort: string;
    kvkFull: string;
    price: string;
    weather: string;
  };
  scaffold: {
    badge: string;
    title: string;
    body: string;
    workspaceTitle: string;
    workspaceBody: string;
    stackTitle: string;
    stackBody: string;
    stateTitle: string;
    stitchTitle: string;
    stitchBody: string;
    voiceBody: string;
  };
}

const en: Dictionary = {
  app: {
    name: "KisaanSahyog",
    tagline: "Smarter farming, stronger harvests.",
  },
  nav: {
    advisory: "Advisory",
    soil: "Soil",
    sell: "Sell",
    market: "Market",
    requirements: "Requirements",
    saved: "Saved",
    account: "Account",
  },
  greetings: {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    welcome: "Welcome",
    welcomeBack: "Welcome back",
  },
  roles: {
    farmer: "Farmer",
    buyer: "Buyer",
  },
  weather: {
    clear: "Clear sky",
    partlyCloudy: "Partly cloudy",
    cloudy: "Cloudy",
    lightRain: "Light rain",
    heavyRain: "Heavy rain",
    thunderstorm: "Thunderstorm",
    fog: "Fog",
    hot: "Hot",
    cold: "Cold",
    humid: "Humid",
    windy: "Windy",
  },
  screens: {
    advisory: "Crop advisory",
    soil: "Soil health",
    sell: "Sell your harvest",
    market: "Mandi market",
    requirements: "My requirements",
    saved: "Saved crops",
    account: "My account",
    voice: "Voice assistant",
  },
  common: {
    language: "Language",
    changeLanguage: "Change language",
    role: "Role",
    switchRole: "Switch role",
    twoGMode: "2G mode",
    dataSaver: "Data saver",
    online: "Online",
    offline: "Offline",
    enabled: "On",
    disabled: "Off",
    close: "Close",
    voiceAssistant: "Voice assistant",
    activeTab: "Active tab",
    screenSlot: "Screen slot",
    loading: "Loading",
    retry: "Try again",
  },
  auth: {
    welcome: "Welcome to KisaanSahyog",
    subtitle: "Select your role to continue",
    farmerLogin: "Farmer Login (Farmer Portal)",
    farmerDesc: "Crop advisory, weather, soil health and direct selling",
    buyerLogin: "Buyer / Trader Login (Buyer Portal)",
    buyerDesc: "Bulk crop procurement, post demands and 0% brokerage",
    demoFarmerBtn: "Enter as Ramesh Kumar (Sitapur)",
    demoBuyerBtn: "Enter as Agarwal Traders (Kanpur)",
    logout: "Logout",
    phonePlaceholder: "Enter mobile number",
    continue: "Continue",
  },
  disclaimers: {
    kvkTitle: "KVK advisory notice",
    kvkShort:
      "General guidance only. Confirm doses and local recommendations with your nearest Krishi Vigyan Kendra (KVK) before acting.",
    kvkFull:
      "KisaanSahyog shares general agronomic information for planning. It does not replace a soil test, a field visit, or advice from your local Krishi Vigyan Kendra (KVK) or a licensed agronomist. Confirm variety choice, pesticide dose, waiting period, and irrigation timing with your KVK before use. Always follow the product label and local regulations.",
    price:
      "Mandi prices are indicative and may change during the trading day. Confirm the final rate with your local mandi or buyer before selling.",
    weather:
      "Weather data is indicative. Use local warnings and field conditions when making irrigation or spraying decisions.",
  },
  scaffold: {
    badge: "Phase 1 scaffold ready",
    title: "Your KisaanSahyog workspace is live",
    body: "Navigation, bilingual copy, role switching, 2G state, and the screen registry are wired. Stitch screens can now be dropped into apps/web/src/screens.",
    workspaceTitle: "Monorepo online",
    workspaceBody:
      "Web, API, shared contracts, skill engine, data, and docs build from one npm workspace.",
    stackTitle: "Configured stack",
    stackBody: "Vite, React, TypeScript, Tailwind CSS, Zustand, Express, and Vitest.",
    stateTitle: "Live app state",
    stitchTitle: "Stitch drop zone",
    stitchBody:
      "Place page-level Stitch screens in apps/web/src/screens and reusable cards, buttons, and gauges in components/stitch.",
    voiceBody:
      "The voice assistant entry point is ready. Speech capture and advisory responses arrive in the advisory phase.",
  },
};

const hi: Dictionary = {
  app: {
    name: "किसान सहयोग",
    tagline: "बेहतर खेती, मजबूत फसल।",
  },
  nav: {
    advisory: "सलाह",
    soil: "मिट्टी",
    sell: "बेचें",
    market: "बाज़ार",
    requirements: "ज़रूरतें",
    saved: "सहेजे गए",
    account: "खाता",
  },
  greetings: {
    morning: "सुप्रभात",
    afternoon: "नमस्ते",
    evening: "शुभ संध्या",
    welcome: "स्वागत है",
    welcomeBack: "फिर से स्वागत है",
  },
  roles: {
    farmer: "किसान",
    buyer: "व्यापारी",
  },
  weather: {
    clear: "साफ़ आसमान",
    partlyCloudy: "कुछ बादल",
    cloudy: "बादल छाए हैं",
    lightRain: "हल्की बारिश",
    heavyRain: "भारी बारिश",
    thunderstorm: "आंधी-तूफ़ान",
    fog: "कोहरा",
    hot: "गर्मी",
    cold: "ठंड",
    humid: "उमस",
    windy: "तेज़ हवा",
  },
  screens: {
    advisory: "फसल सलाह",
    soil: "मिट्टी स्वास्थ्य",
    sell: "फसल बेचें",
    market: "मंडी बाज़ार",
    requirements: "मेरी ज़रूरतें",
    saved: "सहेजी फसलें",
    account: "मेरा खाता",
    voice: "आवाज़ सहायक",
  },
  common: {
    language: "भाषा",
    changeLanguage: "भाषा बदलें",
    role: "भूमिका",
    switchRole: "भूमिका बदलें",
    twoGMode: "2G मोड",
    dataSaver: "डेटा सेवर",
    online: "ऑनलाइन",
    offline: "ऑफ़लाइन",
    enabled: "चालू",
    disabled: "बंद",
    close: "बंद करें",
    voiceAssistant: "आवाज़ सहायक",
    activeTab: "सक्रिय टैब",
    screenSlot: "स्क्रीन स्लॉट",
    loading: "लोड हो रहा है",
    retry: "फिर कोशिश करें",
  },
  auth: {
    welcome: "किसान सहयोग में आपका स्वागत है",
    subtitle: "कृपया अपनी भूमिका चुनकर लॉगिन करें",
    farmerLogin: "किसान लॉगिन (Farmer Portal)",
    farmerDesc: "फसल सलाह, मौसम, मृदा जांच और सीधी बिक्री",
    buyerLogin: "खरीदार / व्यापारी लॉगिन (Buyer Portal)",
    buyerDesc: "थोक फसल खरीद, मांग पोस्टिंग और 0% ब्रोकरेज",
    demoFarmerBtn: "रमेश कुमार (सीतापुर) के रूप में प्रवेश करें",
    demoBuyerBtn: "अग्रवाल ट्रेडर्स (कानपुर) के रूप में प्रवेश करें",
    logout: "लॉगआउट (Logout)",
    phonePlaceholder: "मोबाइल नंबर दर्ज करें",
    continue: "आगे बढ़ें",
  },
  disclaimers: {
    kvkTitle: "KVK सलाह सूचना",
    kvkShort:
      "यह केवल सामान्य जानकारी है। कुछ भी लागू करने से पहले अपने नज़दीकी कृषि विज्ञान केंद्र (KVK) से मात्रा और स्थानीय सलाह की पुष्टि करें।",
    kvkFull:
      "किसान सहयोग योजना के लिए सामान्य कृषि जानकारी देता है। यह मिट्टी परीक्षण, खेत के निरीक्षण, या अपने स्थानीय कृषि विज्ञान केंद्र (KVK) अथवा लाइसेंस प्राप्त कृषि विशेषज्ञ की सलाह का विकल्प नहीं है। किस्म, कीटनाशक की मात्रा, प्रतीक्षा अवधि और सिंचाई का समय तय करने से पहले KVK से पुष्टि करें। हमेशा उत्पाद लेबल और स्थानीय नियमों का पालन करें।",
    price:
      "मंडी भाव सांकेतिक हैं और व्यापार के दौरान बदल सकते हैं। बेचने से पहले अपनी स्थानीय मंडी या खरीदार से अंतिम दाम की पुष्टि करें।",
    weather:
      "मौसम डेटा सांकेतिक है। सिंचाई या छिड़काव का फैसला लेते समय स्थानीय चेतावनी और खेत की स्थिति को ध्यान में रखें।",
  },
  scaffold: {
    badge: "चरण 1 का ढांचा तैयार",
    title: "आपका किसान सहयोग वर्कस्पेस तैयार है",
    body: "नेविगेशन, द्विभाषी सामग्री, भूमिका बदलना, 2G स्थिति और स्क्रीन रजिस्ट्री जुड़ चुके हैं। अब Stitch स्क्रीन को apps/web/src/screens में जोड़ा जा सकता है।",
    workspaceTitle: "मोनोरेपो चालू है",
    workspaceBody:
      "वेब, API, साझा टाइप, स्किल इंजन, डेटा और दस्तावेज़ एक ही npm वर्कस्पेस से बनते हैं।",
    stackTitle: "तैयार टेक स्टैक",
    stackBody: "Vite, React, TypeScript, Tailwind CSS, Zustand, Express और Vitest.",
    stateTitle: "लाइव ऐप स्थिति",
    stitchTitle: "Stitch स्क्रीन क्षेत्र",
    stitchBody:
      "पेज-स्तर की Stitch स्क्रीन apps/web/src/screens में और कार्ड, बटन व गेज components/stitch में रखें।",
    voiceBody:
      "आवाज़ सहायक का प्रवेश बिंदु तैयार है। आवाज़ पहचान और सलाह का जवाब सलाह चरण में जुड़ेगा।",
  },
};

const pa: Dictionary = {
  app: {
    name: "ਕਿਸਾਨ ਸਹਿਯੋਗ",
    tagline: "ਬਿਹਤਰ ਖੇਤੀ, ਮਜ਼ਬੂਤ ਫਸਲਾਂ।",
  },
  nav: {
    advisory: "ਸਲਾਹ",
    soil: "ਮਿੱਟੀ",
    sell: "ਵੇਚੋ",
    market: "ਮੰਡੀ",
    requirements: "ਮੰਗਾਂ",
    saved: "ਸੰਭਾਲੇ",
    account: "ਖਾਤਾ",
  },
  greetings: {
    morning: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਸੁਪ੍ਰਭਾਤ",
    afternoon: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ",
    evening: "ਸ਼ੁਭ ਸਾਂਝ",
    welcome: "ਜੀ ਆਇਆਂ ਨੂੰ",
    welcomeBack: "ਮੁੜ ਜੀ ਆਇਆਂ ਨੂੰ",
  },
  roles: {
    farmer: "ਕਿਸਾਨ",
    buyer: "ਖਰੀਦਦਾਰ",
  },
  weather: {
    clear: "ਸਾਫ ਆਸਮਾਨ",
    partlyCloudy: "ਕੁਝ ਬੱਦਲ",
    cloudy: "ਬੱਦਲਾਯੁਕਤ",
    lightRain: "ਹਲਕੀ ਵਰਖਾ",
    heavyRain: "ਭਾਰੀ ਵਰਖਾ",
    thunderstorm: "ਗਰਜ-ਚਮਕ ਨਾਲ ਵਰਖਾ",
    fog: "ਧੁੰਦ",
    hot: "ਗਰਮੀ",
    cold: "ਠੰਡ",
    humid: "ਨਮੀ",
    windy: "ਤੇਜ਼ ਹਵਾ",
  },
  screens: {
    advisory: "ਫਸਲ ਸਲਾਹ",
    soil: "ਮਿੱਟੀ ਸਿਹਤ",
    sell: "ਫਸਲ ਵੇਚੋ",
    market: "ਮੰਡੀ ਬਾਜ਼ਾਰ",
    requirements: "ਮੇਰੀਆਂ ਮੰਗਾਂ",
    saved: "ਸੰਭਾਲੀਆਂ ਫਸਲਾਂ",
    account: "ਮੇਰਾ ਖਾਤਾ",
    voice: "ਆਵਾਜ਼ ਸਹਾਇਕ",
  },
  common: {
    language: "ਭਾਸ਼ਾ",
    changeLanguage: "ਭਾਸ਼ਾ ਬਦਲੋ",
    role: "ਭੂਮਿਕਾ",
    switchRole: "ਭੂਮਿਕਾ ਬਦਲੋ",
    twoGMode: "2G ਮੋਡ",
    dataSaver: "ਡਾਟਾ ਸੇਵਰ",
    online: "ਆਨਲਾਈਨ",
    offline: "ਆਫ਼ਲਾਈਨ",
    enabled: "ਚਾਲੂ",
    disabled: "ਬੰਦ",
    close: "ਬੰਦ ਕਰੋ",
    voiceAssistant: "ਆਵਾਜ਼ ਸਹਾਇਕ",
    activeTab: "ਸਰਗਰਮ ਟੈਬ",
    screenSlot: "ਸਕ੍ਰੀਨ ਸਲਾਟ",
    loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ",
    retry: "ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
  },
  auth: {
    welcome: "ਕਿਸਾਨ ਸਹਿਯੋਗ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ",
    subtitle: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਭੂਮਿਕਾ ਚੁਣ ਕੇ ਲਾਗਇਨ ਕਰੋ",
    farmerLogin: "ਕਿਸਾਨ ਲਾਗਇਨ (ਕਿਸਾਨ ਪੋਰਟਲ)",
    farmerDesc: "ਫਸਲ ਸਲਾਹ, ਮੌਸਮ, ਮਿੱਟੀ ਜਾਂਚ ਅਤੇ ਸਿੱਧੀ ਵਿਕਰੀ",
    buyerLogin: "ਖਰੀਦਦਾਰ / ਵਪਾਰੀ ਲਾਗਇਨ (ਖਰੀਦਦਾਰ ਪੋਰਟਲ)",
    buyerDesc: "ਥੋਕ ਫਸਲ ਖਰੀਦ, ਮੰਗ ਪੋਸਟਿੰਗ ਅਤੇ 0% ਕਮਿਸ਼ਨ",
    demoFarmerBtn: "ਰਮੇਸ਼ ਕੁਮਾਰ (ਸੀਤਾਪੁਰ) ਵਜੋਂ ਦਾਖਲ ਹੋਵੋ",
    demoBuyerBtn: "ਅਗਰਵਾਲ ਟ੍ਰੇਡਰਸ (ਕਾਨਪੁਰ) ਵਜੋਂ ਦਾਖਲ ਹੋਵੋ",
    logout: "ਲਾਗ ਆਉਟ",
    phonePlaceholder: "ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ",
    continue: "ਅੱਗੇ ਵਧੋ",
  },
  disclaimers: {
    kvkTitle: "KVK ਸਲਾਹ ਨੋਟਿਸ",
    kvkShort:
      "ਕੇਵਲ ਆਮ ਜਾਣਕਾਰੀ ਲਈ। ਕੋਈ ਵੀ ਉਪਾਅ ਲਾਗੂ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਆਪਣੇ ਨਜ਼ਦੀਕੀ KVK ਨਾਲ ਪੁਸ਼ਟੀ ਕਰੋ।",
    kvkFull:
      "ਕਿਸਾਨ ਸਹਿਯੋਗ ਆਮ ਖੇਤੀਬਾੜੀ ਜਾਣਕਾਰੀ ਪੇਸ਼ ਕਰਦਾ ਹੈ। ਇਹ ਮਿੱਟੀ ਜਾਂਚ ਜਾਂ KVK ਸਲਾਹ ਦਾ ਬਦਲ ਨਹੀਂ ਹੈ। ਕਿਸਮ, ਖਾਦ/ਕੀਟਨਾਸ਼ਕ ਦੀ ਮਾਤਰਾ ਅਤੇ ਪੱਛਤਾਵਾਂ ਦੀ ਪੁਸ਼ਟੀ ਪਹਿਲਾਂ KVK ਨਾਲ ਕਰੋ।",
    price:
      "ਮੰਡੀ ਦਰਾਂ ਸੰਕੇਤਕ ਹਨ ਅਤੇ ਬਦਲ ਸਕਦੀਆਂ ਹਨ। ਵੇਚਣ ਤੋਂ ਪਹਿਲਾਂ ਅੰਤਿਮ ਦਰ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ।",
    weather:
      "ਮੌਸਮ ਡਾਟਾ ਸੰਕੇਤਕ ਹੈ। ਸਿੰਚਾਈ ਜਾਂ ਛਿੜਕਾਵ ਫੈਸਲੇ ਲਈ ਖੇਤ ਦੀ ਸਥਿਤੀ ਧਿਆਨ ਵਿੱਚ ਰੱਖੋ।",
  },
  scaffold: {
    badge: "ਚਰਨ 1 ਦਾ ਢਾਂਚਾ ਤਿਆਰ",
    title: "ਤੁਹਾਡਾ ਕਿਸਾਨ ਸਹਿਯੋਗ ਵਰਕਸਪੇਸ ਤਿਆਰ ਹੈ",
    body: "ਨੈਵੀਗੇਸ਼ਨ, ਬਹੁਭਾਸ਼ੀ ਸਮੱਗਰੀ ਅਤੇ ਸਥਿਤੀ ਜੁੜ ਚੁੱਕੀ ਹੈ।",
    workspaceTitle: "ਮੋਨੋਰੇਪੋ ਚਾਲੂ ਹੈ",
    workspaceBody: "ਸਾਰੇ ਮੋਡੀਊਲ ਇੱਕੇ ਵਰਕਸਪੇਸ ਤੋਂ ਬਣਦੇ ਹਨ।",
    stackTitle: "ਟੈਕ ਸਟੈਕ",
    stackBody: "Vite, React, TypeScript, Tailwind CSS, Zustand, Express ਅਤੇ Vitest.",
    stateTitle: "ਲਾਈਵ ਐਪ ਸਥਿਤੀ",
    stitchTitle: "Stitch ਸਕ੍ਰੀਨ ਜ਼ੋਨ",
    stitchBody: "Stitch ਸਕ੍ਰੀਨਾਂ apps/web/src/screens ਵਿੱਚ ਜੋੜੋ।",
    voiceBody: "ਆਵਾਜ਼ ਸਹਾਇਕ ਦਾ ਐਂਟਰੀ ਪੁਆਇੰਟ ਤਿਆਰ ਹੈ।",
  },
};

const mr: Dictionary = {
  app: {
    name: "किसान सहयोग",
    tagline: "उत्तम शेती, मजबूत पिके.",
  },
  nav: {
    advisory: "सल्ला",
    soil: "माती",
    sell: "विक्री",
    market: "बाजार",
    requirements: "मागण्या",
    saved: "जतन केलेले",
    account: "खाते",
  },
  greetings: {
    morning: "सुप्रभात",
    afternoon: "नमस्कार",
    evening: "शुभ संध्याकाळ",
    welcome: "स्वागत आहे",
    welcomeBack: "पुन्हा स्वागत आहे",
  },
  roles: {
    farmer: "शेतकरी",
    buyer: "खरेदीदार",
  },
  weather: {
    clear: "निरभ्र आकाश",
    partlyCloudy: "अंशतः ढगाळ",
    cloudy: "ढगाळ",
    lightRain: "हलका पाऊस",
    heavyRain: "मुसळधार पाऊस",
    thunderstorm: "गडगडाटीसह पाऊस",
    fog: "धुके",
    hot: "उन्हाळा",
    cold: "थंडी",
    humid: "दमट",
    windy: "वादळी",
  },
  screens: {
    advisory: "पीक सल्ला",
    soil: "माती आरोग्य",
    sell: "पीक विक्री",
    market: "बाजार भाव",
    requirements: "माझ्या मागण्या",
    saved: "जतन केलेली पिके",
    account: "माझे खाते",
    voice: "आवाज सहाय्यक",
  },
  common: {
    language: "भाषा",
    changeLanguage: "भाषा बदला",
    role: "भूमिका",
    switchRole: "भूमिका बदला",
    twoGMode: "2G मोड",
    dataSaver: "डेटा सेव्हर",
    online: "ऑनलाइन",
    offline: "ऑफलाइन",
    enabled: "सुरू",
    disabled: "बंद",
    close: "बंद करा",
    voiceAssistant: "आवाज सहाय्यक",
    activeTab: "सक्रिय टॅब",
    screenSlot: "स्क्रीन स्लॉट",
    loading: "लोड होत आहे",
    retry: "पुन्हा प्रयत्न करा",
  },
  auth: {
    welcome: "किसान सहयोगमध्ये आपले स्वागत आहे",
    subtitle: "कृपया आपली भूमिका निवडून लॉगिन करा",
    farmerLogin: "शेतकरी लॉगिन (शेतकरी पोर्टल)",
    farmerDesc: "पीक सल्ला, हवामान, माती तपासणी आणि थेट विक्री",
    buyerLogin: "खरेदीदार / व्यापारी लॉगिन (खरेदीदार पोर्टल)",
    buyerDesc: "थोक पीक खरेदी, मागणी पोस्ट आणि 0% दलाली",
    demoFarmerBtn: "रमेश कुमार (सीतापूर) म्हणून प्रवेश करा",
    demoBuyerBtn: "अगरवाल ट्रेडर्स (कानपूर) म्हणून प्रवेश करा",
    logout: "लॉगआउट",
    phonePlaceholder: "मोबाईल क्रमांक टाका",
    continue: "पुढे जा",
  },
  disclaimers: {
    kvkTitle: "केव्हीके सल्ला सूचना",
    kvkShort: "फक्त सामान्य माहिती. वापरण्यापूर्वी केव्हीकेशी खात्री करा.",
    kvkFull:
      "किसान सहयोग सामान्य कृषी माहिती देते. ही माती परीक्षण किंवा केव्हीके सल्ल्याचा पर्याय नाही. खत/कीटकनाशक मात्रा आधी केव्हीकेशी तपासून घ्या.",
    price:
      "बाजारभाव अंदाजे आहेत आणि बदलू शकतात. विक्रीपूर्वी अंतिम दर तपासा.",
    weather:
      "हवामान डेटा अंदाजे आहे. सिंचन/फवारणीसाठी स्थानिक सूचना लक्षात घ्या.",
  },
  scaffold: {
    badge: "टप्पा 1 तयार",
    title: "तुमचा किसान सहयोग वर्कस्पेस तयार आहे",
    body: "नेव्हिगेशन आणि द्विभाषी सामग्री तयार आहे.",
    workspaceTitle: "मोनोरेपो चालू",
    workspaceBody: "सर्व मॉड्यूल एका वर्कस्पेसमधून तयार होतात.",
    stackTitle: "टेक स्टॅक",
    stackBody: "Vite, React, TypeScript, Tailwind CSS, Zustand, Express आणि Vitest.",
    stateTitle: "लाइव्ह अॅप स्थिती",
    stitchTitle: "Stitch स्क्रीन झोन",
    stitchBody: "Stitch स्क्रीन apps/web/src/screens मध्ये जोडा.",
    voiceBody: "आवाज सहाय्यक तयार आहे.",
  },
};

export const dictionaries: Record<Language, Dictionary> = { hi, en, pa, mr };

export function getDictionary(language: Language): Dictionary {
  return dictionaries[language];
}

export function isLanguage(value: string): value is Language {
  return LANGUAGES.some((language) => language === value);
}

export function getNavigationKeys(role: Role): readonly NavKey[] {
  return role === "farmer" ? FARMER_TABS : BUYER_TABS;
}

export function isFarmerTab(tab: NavKey): tab is FarmerTab {
  return FARMER_TABS.some((farmerTab) => farmerTab === tab);
}

export function isBuyerTab(tab: NavKey): tab is BuyerTab {
  return BUYER_TABS.some((buyerTab) => buyerTab === tab);
}
