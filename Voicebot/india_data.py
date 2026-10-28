"""Names of districts, crops and land units for Punjab and Uttar Pradesh.
Pure data + small matching helpers. No API calls here."""
import difflib
import re

# ------------------------------------------------------------------ districts
DISTRICTS = {
    "Punjab": [
        "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka",
        "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana",
        "Malerkotla", "Mansa", "Moga", "Sri Muktsar Sahib", "Pathankot", "Patiala",
        "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur",
        "Shahid Bhagat Singh Nagar", "Tarn Taran",
    ],
    "Uttar Pradesh": [
        "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya",
        "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki",
        "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli",
        "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad",
        "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur",
        "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj",
        "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kushinagar",
        "Lakhimpur Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri",
        "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit",
        "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal",
        "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar",
        "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi",
    ],
}

# Other spellings / old names / common short names -> official district name
DISTRICT_ALIASES = {
    "firozpur": "Ferozepur", "ferozpur": "Ferozepur", "firozepur": "Ferozepur",
    "muktsar": "Sri Muktsar Sahib", "sri muktsar": "Sri Muktsar Sahib",
    "mohali": "Sahibzada Ajit Singh Nagar", "sas nagar": "Sahibzada Ajit Singh Nagar",
    "ajitgarh": "Sahibzada Ajit Singh Nagar",
    "ropar": "Rupnagar", "roopnagar": "Rupnagar",
    "nawanshahr": "Shahid Bhagat Singh Nagar", "nawan shahr": "Shahid Bhagat Singh Nagar",
    "sbs nagar": "Shahid Bhagat Singh Nagar",
    "taran taran": "Tarn Taran", "tarntaran": "Tarn Taran",
    "fatehgarh": "Fatehgarh Sahib", "sirhind": "Fatehgarh Sahib",
    "malerkotla": "Malerkotla", "maler kotla": "Malerkotla",
    "allahabad": "Prayagraj", "faizabad": "Ayodhya",
    "noida": "Gautam Buddha Nagar", "greater noida": "Gautam Buddha Nagar",
    "kanpur": "Kanpur Nagar", "kheri": "Lakhimpur Kheri", "lakhimpur": "Lakhimpur Kheri",
    "rae bareli": "Raebareli", "rai bareilly": "Raebareli", "raibareli": "Raebareli",
    "sant ravidas nagar": "Bhadohi", "badohi": "Bhadohi",
    "badaun": "Budaun", "bulandshahar": "Bulandshahr", "bulandsahar": "Bulandshahr",
    "muzzafarnagar": "Muzaffarnagar", "muzaffar nagar": "Muzaffarnagar",
    "siddharth nagar": "Siddharthnagar", "shrawasti": "Shravasti",
    "kushi nagar": "Kushinagar", "mahamaya nagar": "Hathras",
    "ghaziabad": "Ghaziabad", "gazipur": "Ghazipur", "gorakhapur": "Gorakhpur",
    "benares": "Varanasi", "banaras": "Varanasi", "kashi": "Varanasi",
    "jhansi": "Jhansi", "ambedkarnagar": "Ambedkar Nagar",
    "sambhal": "Sambhal", "bhim nagar": "Sambhal",
}

# Name the Open-Meteo place search understands better than the official name
GEOCODE_NAME = {
    "Sri Muktsar Sahib": "Muktsar",
    "Sahibzada Ajit Singh Nagar": "Mohali",
    "Shahid Bhagat Singh Nagar": "Nawanshahr",
    "Gautam Buddha Nagar": "Noida",
    "Kanpur Nagar": "Kanpur",
    "Lakhimpur Kheri": "Lakhimpur",
    "Raebareli": "Rae Bareli",
    "Sant Kabir Nagar": "Khalilabad",
}

PREFERRED_STATES = ["Punjab", "Uttar Pradesh"]

# ---------------------------------------------------------------------- crops
# canonical English name -> other names (Hinglish, Hindi, Punjabi)
_ALL_CROPS = {
    # cereals
    "wheat": ["gehu", "gehun", "gehoon", "gaihu", "kanak", "गेहूं", "गेहूँ", "ਕਣਕ"],
    "rice": ["dhan", "chawal", "paddy", "jhona", "parmal", "basmati", "धान", "चावल", "ਝੋਨਾ", "ਬਾਸਮਤੀ"],
    "maize": ["makka", "makki", "corn", "bhutta", "मक्का", "मक्की", "ਮੱਕੀ"],
    "bajra": ["pearl millet", "bajri", "बाजरा", "ਬਾਜਰਾ"],
    "jowar": ["sorghum", "jwar", "ज्वार", "ਜਵਾਰ"],
    "barley": ["jau", "jou", "जौ", "ਜੌਂ"],
    "oats": ["jai", "javi", "जई", "ਜਵੀ"],
    "ragi": ["mandua", "finger millet", "रागी", "मंडुआ"],
    "kodo": ["kodon", "कोदो"],
    "sawan": ["sanwa", "barnyard millet", "सांवा"],
    # oilseeds
    "mustard": ["sarson", "sarso", "rai", "सरसों", "ਸਰ੍ਹੋਂ"],
    "toria": ["lahi", "तोरिया", "ਤੋਰੀਆ"],
    "taramira": ["taramira", "तारामीरा", "ਤਾਰਾਮੀਰਾ"],
    "gobhi sarson": ["gobhi sarson", "canola", "ਗੋਭੀ ਸਰ੍ਹੋਂ"],
    "sunflower": ["surajmukhi", "suraj mukhi", "सूरजमुखी", "ਸੂਰਜਮੁਖੀ"],
    "groundnut": ["moongfali", "mungfali", "peanut", "मूंगफली", "ਮੂੰਗਫਲੀ"],
    "soybean": ["soyabean", "soya", "सोयाबीन", "ਸੋਇਆਬੀਨ"],
    "sesame": ["til", "तिल", "ਤਿਲ"],
    "linseed": ["alsi", "flax", "अलसी", "ਅਲਸੀ"],
    # pulses
    "moong": ["mung", "green gram", "moongi", "मूंग", "ਮੂੰਗੀ"],
    "urad": ["mash", "black gram", "उड़द", "ਮਾਂਹ"],
    "arhar": ["tur", "toor", "pigeon pea", "अरहर", "तूर", "ਅਰਹਰ"],
    "masoor": ["lentil", "masur", "मसूर", "ਮਸਰ"],
    "chickpea": ["chana", "gram", "channa", "चना", "ਛੋਲੇ"],
    "peas": ["matar", "mattar", "मटर", "ਮਟਰ"],
    "cowpea": ["lobia", "chawli", "लोबिया", "ਲੋਬੀਆ"],
    # cash crops and fibre
    "cotton": ["kapas", "narma", "kapaas", "कपास", "नरमा", "ਕਪਾਹ", "ਨਰਮਾ"],
    "sugarcane": ["ganna", "gannaa", "गन्ना", "ਗੰਨਾ"],
    "sunhemp": ["sanai", "dhaincha", "सनई", "ਸਣ"],
    "mentha": ["mint oil", "japanese mint", "मेंथा"],
    "tobacco": ["tambaku", "तंबाकू"],
    # vegetables
    "potato": ["aloo", "aalu", "आलू", "ਆਲੂ"],
    "onion": ["pyaz", "pyaaz", "प्याज", "ਪਿਆਜ਼"],
    "tomato": ["tamatar", "टमाटर", "ਟਮਾਟਰ"],
    "cauliflower": ["phool gobhi", "phulgobhi", "gobhi", "फूलगोभी", "ਫੁੱਲ ਗੋਭੀ"],
    "cabbage": ["patta gobhi", "band gobhi", "पत्तागोभी", "ਬੰਦ ਗੋਭੀ"],
    "brinjal": ["baingan", "eggplant", "बैंगन", "ਬੈਂਗਣ"],
    "okra": ["bhindi", "lady finger", "ladyfinger", "भिंडी", "ਭਿੰਡੀ"],
    "chilli": ["mirch", "mirchi", "chili", "मिर्च", "ਮਿਰਚ"],
    "garlic": ["lahsun", "lasan", "लहसुन", "ਲਸਣ"],
    "carrot": ["gajar", "गाजर", "ਗਾਜਰ"],
    "radish": ["mooli", "muli", "मूली", "ਮੂਲੀ"],
    "turnip": ["shalgam", "शलगम", "ਸ਼ਲਗਮ"],
    "spinach": ["palak", "पालक", "ਪਾਲਕ"],
    "fenugreek": ["methi", "मेथी", "ਮੇਥੀ"],
    "bottle gourd": ["lauki", "ghiya", "dudhi", "लौकी", "ਲੌਕੀ", "ਘੀਆ"],
    "bitter gourd": ["karela", "करेला", "ਕਰੇਲਾ"],
    "ridge gourd": ["tori", "turai", "तोरी", "तुरई"],
    "cucumber": ["kheera", "khira", "खीरा", "ਖੀਰਾ"],
    "pumpkin": ["kaddu", "sitaphal", "कद्दू", "ਕੱਦੂ"],
    "watermelon": ["tarbooz", "tarbuz", "तरबूज", "ਤਰਬੂਜ਼"],
    "muskmelon": ["kharbooza", "kharbuja", "खरबूजा", "ਖਰਬੂਜ਼ਾ"],
    "colocasia": ["arbi", "arvi", "अरबी", "ਅਰਬੀ"],
    "sweet potato": ["shakarkandi", "शकरकंद", "ਸ਼ਕਰਕੰਦੀ"],
    "coriander": ["dhaniya", "dhania", "धनिया", "ਧਨੀਆ"],
    "turmeric": ["haldi", "हल्दी", "ਹਲਦੀ"],
    "ginger": ["adrak", "अदरक", "ਅਦਰਕ"],
    "mushroom": ["khumb", "मशरूम", "ਖੁੰਬ"],
    # fodder
    "berseem": ["barseem", "bersim", "बरसीम", "ਬਰਸੀਮ"],
    "lucerne": ["alfalfa", "rijka", "रिजका", "ਲੂਸਣ"],
    "fodder maize": ["chari", "green fodder", "चारा", "ਚਾਰਾ"],
    "napier grass": ["napier", "हाथी घास"],
    # fruits
    "kinnow": ["kinu", "kinno", "mandarin", "किन्नू", "ਕਿੰਨੂ"],
    "guava": ["amrood", "amrud", "अमरूद", "ਅਮਰੂਦ"],
    "mango": ["aam", "आम", "ਅੰਬ"],
    "pear": ["nashpati", "नाशपाती", "ਨਾਸ਼ਪਾਤੀ"],
    "peach": ["aadu", "adu", "आड़ू", "ਆੜੂ"],
    "litchi": ["lichi", "leechi", "लीची", "ਲੀਚੀ"],
    "grapes": ["angoor", "anggur", "अंगूर", "ਅੰਗੂਰ"],
    "ber": ["jujube", "बेर", "ਬੇਰ"],
    "banana": ["kela", "केला", "ਕੇਲਾ"],
    "papaya": ["papita", "पपीता", "ਪਪੀਤਾ"],
    "amla": ["aonla", "indian gooseberry", "आंवला", "आँवला", "ਆਂਵਲਾ"],
    "pomegranate": ["anar", "अनार", "ਅਨਾਰ"],
    "orange": ["santra", "malta", "संतरा", "ਸੰਤਰਾ"],
    "lemon": ["nimbu", "nimboo", "नींबू", "ਨਿੰਬੂ"],
    "strawberry": ["strawberi", "स्ट्रॉबेरी"],
    "marigold": ["genda", "गेंदा", "ਗੇਂਦਾ"],
}

# The 15 most grown crops in each state (chosen from general knowledge of the major
# crops; please confirm against state agriculture statistics before publishing).
STATE_CROPS = {
    "Punjab": ["wheat", "rice", "maize", "cotton", "sugarcane", "potato", "mustard", "moong",
               "sunflower", "bajra", "jowar", "berseem", "peas", "onion", "kinnow"],
    "Uttar Pradesh": ["wheat", "rice", "sugarcane", "maize", "potato", "mustard", "chickpea",
                      "arhar", "masoor", "peas", "urad", "moong", "bajra", "groundnut", "mango"],
}
FOCUS_CROPS = list(dict.fromkeys(c for crops in STATE_CROPS.values() for c in crops))
CROPS = {c: _ALL_CROPS[c] for c in FOCUS_CROPS}

# ---------------------------------------------------------------- land units
# How many acres one unit is.
ACRES_PER_UNIT = {
    "acre": 1.0,
    "killa": 1.0,           # Punjab: 1 killa = 1 acre
    "ghumaon": 1.0,         # Punjab/Haryana: 1 ghumaon = 1 acre
    "kanal": 0.125,         # 8 kanal = 1 acre
    "marla": 1 / 160,       # 20 marla = 1 kanal
    "sarsai": 1 / 1440,     # 9 sarsai = 1 marla
    "murabba": 25.0,        # 25 acres
    "hectare": 2.47105,
    "gaj": 1 / 4840,        # square yard
    "decimal": 0.01,        # also called dismil
}
# Bigha is NOT the same everywhere. These are common values; confirm locally.
BIGHA_ACRES = {"Punjab": 0.2, "Uttar Pradesh": 0.625}
BIGHA_DEFAULT_STATE = "Punjab"
BIGHA_FAMILY = {"bigha": 1.0, "biswa": 1 / 20, "biswansi": 1 / 400}   # share of one bigha

UNIT_ALIASES = {
    "acre": ["acres", "ekad", "ekar", "एकड़", "एकड", "ਏਕੜ"],
    "killa": ["kila", "killas", "किल्ला", "किला", "ਕਿੱਲਾ", "ਕਿੱਲੇ"],
    "ghumaon": ["ghumao", "ghumaan", "घुमाओं", "घुमाऊं", "ਘੁਮਾਂ"],
    "kanal": ["kanals", "कनाल", "ਕਨਾਲ"],
    "marla": ["marle", "मरला", "ਮਰਲਾ", "ਮਰਲੇ"],
    "sarsai": ["sarsahi", "सरसाई", "ਸਰਸਾਈ"],
    "murabba": ["murabbe", "squares", "मुरब्बा", "ਮੁਰੱਬਾ"],
    "hectare": ["hectares", "ha", "hektar", "हेक्टेयर", "ਹੈਕਟੇਅਰ"],
    "gaj": ["sq yard", "sq yards", "square yard", "square yards", "गज", "वर्ग गज", "ਗਜ਼"],
    "decimal": ["dismil", "dismal", "डिसमिल", "डेसीमल"],
    "bigha": ["bighas", "beegha", "बीघा", "बीघे", "ਬੀਘਾ"],
    "biswa": ["biswas", "bisva", "बिस्वा", "ਬਿਸਵਾ"],
    "biswansi": ["biswansee", "बिस्वांसी"],
}
ALL_UNITS = list(ACRES_PER_UNIT) + list(BIGHA_FAMILY)


# ------------------------------------------------------------------- helpers
def _clean(text):
    text = str(text or "").strip().lower()
    text = re.sub(r"[.()]", " ", text)
    return re.sub(r"\s+", " ", text).strip()

def _build_lookup(mapping):
    lookup = {}
    for canonical, names in mapping.items():
        lookup[_clean(canonical)] = canonical
        for n in names:
            lookup[_clean(n)] = canonical
    return lookup

_DISTRICT_STATE = {d: s for s, ds in DISTRICTS.items() for d in ds}
_DISTRICT_LOOKUP = {_clean(d): d for d in _DISTRICT_STATE}
_DISTRICT_LOOKUP.update({_clean(k): v for k, v in DISTRICT_ALIASES.items()})
_CROP_LOOKUP = _build_lookup(CROPS)
_UNIT_LOOKUP = _build_lookup(UNIT_ALIASES)
_UNIT_LOOKUP.update({u: u for u in ALL_UNITS})

def _snap(text, lookup, cutoff):
    key = _clean(text)
    if key in lookup:
        return lookup[key]
    close = difflib.get_close_matches(key, list(lookup), n=1, cutoff=cutoff)
    return lookup[close[0]] if close else None

def normalize_location(location):
    """Returns (name, state). If the place is a known district of Punjab or UP,
    the official spelling and the state are returned; otherwise (original, None)."""
    if not location:
        return location, None
    text = str(location)
    for part in re.split(r"[,/]", text):
        part = re.sub(r"\b(district|zila|jila|city)\b", "", _clean(part)).strip()
        if len(part) < 3:
            continue
        found = _snap(part, _DISTRICT_LOOKUP, 0.82)
        if found:
            return found, _DISTRICT_STATE[found]
    return text.strip(), None

def normalize_crop(crop):
    """'gehoon' -> 'wheat'. Unknown names are returned lower-cased."""
    if not crop:
        return crop
    found = _snap(crop, _CROP_LOOKUP, 0.8)
    return found or str(crop).strip().lower()

def is_known_crop(crop):
    return _clean(crop) in _CROP_LOOKUP

def normalize_unit(unit):
    """'killa', 'बीघा' ... -> canonical unit, or None if not recognised."""
    if not unit:
        return None
    return _snap(unit, _UNIT_LOOKUP, 0.85)

def acres_per_unit(unit, state=None):
    """Acres in one unit. Bigha-family units depend on the state."""
    unit = normalize_unit(unit)
    if unit is None:
        return None
    if unit in BIGHA_FAMILY:
        bigha = BIGHA_ACRES.get(state, BIGHA_ACRES[BIGHA_DEFAULT_STATE])
        return bigha * BIGHA_FAMILY[unit]
    return ACRES_PER_UNIT[unit]
