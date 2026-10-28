"""Approximate crop prices for the farmer.

Two sources, both shown when available:

1. SUPPORT PRICE (MSP / FRP) - the government's announced price. A fixed table below,
   checked against news reports of the Cabinet decisions (see the notes next to it).
   Always works, even offline.

2. MANDI PRICE - the latest wholesale (modal) price from Agmarknet, via the free
   data.gov.in API. Needs a free key in .env:  DATA_GOV_API_KEY=...
   Get it at https://data.gov.in (create an account, open "My Account", copy the key).
   If there is no key, no internet, or no record for the crop, the screen simply
   shows the support price alone.

All prices are in rupees per QUINTAL (1 quintal = 100 kg).
"""
import datetime
import os
import statistics
import time

import requests

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# ----------------------------------------------------------------- 1. support prices
# crop -> (rupees per quintal, what the number is)
#
# Rabi crops use the 2027-28 marketing season MSP (announced October 2026), because
# rabi sowing is happening now.  Kharif crops use the 2026-27 MSP (announced 13 May 2026),
# the latest announced for those crops.  Sugarcane is the central FRP.
# Update this table when the government announces new prices.
SUPPORT_PRICES = {
    "wheat":     (2610, "MSP, rabi season 2027-28"),
    "mustard":   (6613, "MSP, rabi season 2027-28"),
    "chickpea":  (5958, "MSP, rabi season 2027-28"),
    "masoor":    (7390, "MSP, rabi season 2027-28"),
    "rice":      (2441, "MSP for common paddy, kharif season 2026-27"),
    "maize":     (2410, "MSP, kharif season 2026-27"),
    "cotton":    (8267, "MSP for medium-staple cotton, kharif season 2026-27"),
    "moong":     (8780, "MSP, kharif season 2026-27"),
    "arhar":     (8450, "MSP, kharif season 2026-27"),
    "urad":      (8200, "MSP, kharif season 2026-27"),
    "groundnut": (7517, "MSP, kharif season 2026-27"),
    "sunflower": (8343, "MSP, kharif season 2026-27"),
    "bajra":     (2900, "MSP, kharif season 2026-27"),
    "jowar":     (4023, "MSP for hybrid jowar, kharif season 2026-27"),
    "sugarcane": (365,  "central FRP for the 2026-27 sugar season; the state price can be higher"),
}
# Crops with no government support price (potato, onion, peas, fruit...) only get
# the live mandi price.

# ----------------------------------------------------------------- 2. mandi prices
MANDI_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
CACHE_SECONDS = 3600
STALE_DAYS = 14

# Names the Agmarknet dataset uses for each crop (tried in order). The dataset matches
# these spellings exactly, so if a crop never returns a price, run check_prices.py to
# see the exact names used in your state and fix them here.
MANDI_NAMES = {
    "wheat":     ["Wheat"],
    "rice":      ["Paddy(Dhan)(Common)", "Paddy(Dhan)(Basmati)"],
    "maize":     ["Maize"],
    "cotton":    ["Cotton"],
    "potato":    ["Potato"],
    "mustard":   ["Mustard"],
    "moong":     ["Green Gram (Moong)(Whole)"],
    "sunflower": ["Sunflower"],
    "bajra":     ["Bajra(Pearl Millet/Cumbu)"],
    "jowar":     ["Jowar(Sorghum)"],
    "peas":      ["Peas(Dry)", "Peas Wet"],
    "onion":     ["Onion"],
    "kinnow":    ["Kinnow"],
    "chickpea":  ["Bengal Gram(Gram)(Whole)"],
    "arhar":     ["Arhar (Tur/Red Gram)(Whole)"],
    "masoor":    ["Lentil (Masur)(Whole)"],
    "urad":      ["Black Gram (Urd Beans)(Whole)"],
    "groundnut": ["Groundnut"],
    "mango":     ["Mango"],
}

_cache = {}


def _api_key():
    return os.environ.get("DATA_GOV_API_KEY", "").strip()


def _fetch_records(state, commodity, key):
    params = {
        "api-key": key,
        "format": "json",
        "limit": "200",
        "filters[state]": state,
        "filters[commodity]": commodity,
    }
    resp = requests.get(MANDI_URL, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json().get("records") or []


def _parse(records):
    """Keep records with a usable date and price: [(date, district, market, min, max, modal)]."""
    clean = []
    for r in records:
        try:
            when = datetime.datetime.strptime(str(r["arrival_date"]).strip(), "%d/%m/%Y").date()
            modal = float(r["modal_price"])
            low = float(r.get("min_price") or modal)
            high = float(r.get("max_price") or modal)
        except Exception:
            continue
        if modal <= 0:
            continue
        clean.append((when, str(r.get("district", "")).strip().lower(),
                      str(r.get("market", "")).strip(), low, high, modal))
    return clean


def _summarise(clean, district, state):
    """Latest day's prices. Prefer the farmer's own district; else the whole state."""
    latest = max(row[0] for row in clean)
    today = [row for row in clean if row[0] == latest]
    mine = [row for row in today if district and row[1] == str(district).strip().lower()]
    rows, where = (mine, f"{district} mandi") if mine else (today, f"{state} mandis (middle value)")
    return {
        "modal": round(statistics.median(r[5] for r in rows)),
        "min": round(min(r[3] for r in rows)),
        "max": round(max(r[4] for r in rows)),
        "date": latest.strftime("%d %b %Y"),
        "where": where,
        "markets": len(rows),
        "stale": (datetime.date.today() - latest).days > STALE_DAYS,
    }


def mandi_price(crop, district=None, state=None):
    """Latest market price, or None if unavailable for any reason."""
    key = _api_key()
    names = MANDI_NAMES.get(str(crop).lower())
    if not key or not names or not state:
        return None
    cache_key = (crop, district, state)
    hit = _cache.get(cache_key)
    if hit and time.time() - hit[0] < CACHE_SECONDS:
        return hit[1]
    result = None
    try:
        for name in names:
            clean = _parse(_fetch_records(state, name, key))
            if clean:
                result = _summarise(clean, district, state)
                break
    except Exception:
        result = None
    _cache[cache_key] = (time.time(), result)
    return result


# ----------------------------------------------------------------- put it together
def get_price_info(crop, district=None, state=None):
    """{'support': {...} or None, 'mandi': {...} or None, 'rows': [...], 'caption': '...'}"""
    crop = str(crop).lower()
    support = None
    if crop in SUPPORT_PRICES:
        value, label = SUPPORT_PRICES[crop]
        support = {"per_quintal": value, "label": label}
    mandi = mandi_price(crop, district, state)

    rows = []
    if mandi:
        rows.append({
            "Price": f"Market price ({mandi['where']})",
            "Rs per quintal": f"{mandi['modal']:,}",
            "About Rs per kg": f"{mandi['modal'] / 100:.1f}",
            "Details": f"Usually between Rs {mandi['min']:,} and Rs {mandi['max']:,}; "
                       f"as on {mandi['date']}",
        })
    if support:
        rows.append({
            "Price": "Government support price",
            "Rs per quintal": f"{support['per_quintal']:,}",
            "About Rs per kg": f"{support['per_quintal'] / 100:.1f}",
            "Details": support["label"],
        })

    caption = ""
    if rows:
        caption = ("Prices are approximate and change daily and from one mandi to another. "
                   "1 quintal = 100 kg.")
        if mandi and mandi["stale"]:
            caption += " The latest market record is more than 2 weeks old."
        if _api_key() and mandi is None and crop in MANDI_NAMES:
            caption += " A current market price could not be found right now."
    return {"support": support, "mandi": mandi, "rows": rows, "caption": caption}


def price_facts(info):
    """Small summary handed to the writer, so the spoken answer can mention the price."""
    facts = {}
    if info.get("mandi"):
        facts["market_price_rs_per_quintal"] = info["mandi"]["modal"]
    if info.get("support"):
        facts["support_price_rs_per_quintal"] = info["support"]["per_quintal"]
    return facts
