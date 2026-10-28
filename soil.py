"""Soil and weather of the farmer's area, for the screen and the spoken answer.

Soil comes from ISRIC SoilGrids (free, no key): a world map of soil properties made by
computer models, about 250 m per pixel. It is an ESTIMATE for the area, not a
measurement of the farmer's own field, so the screen always says a soil test gives the
exact answer.

Weather and topsoil temperature / moisture come from the Open-Meteo forecast that
bot_logic.get_weather() already fetches.
"""
import time

import requests

SOILGRIDS_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query"
PROPERTIES = ["phh2o", "soc", "clay", "sand", "silt", "nitrogen"]
DEPTH = "5-15cm"
TIMEOUT = 10            # seconds per try; the service can be slow
TRIES = 2
CACHE_SECONDS = 24 * 3600

# SoilGrids stores whole numbers; divide by d_factor to get normal units.
# (The reply also carries d_factor; these are the fallbacks.)
#   phh2o: pH x10   soc: dg/kg -> g/kg   clay/sand/silt: g/kg -> %   nitrogen: cg/kg -> g/kg
DEFAULT_DFACTOR = {"phh2o": 10, "soc": 10, "clay": 10, "sand": 10, "silt": 10, "nitrogen": 100}

_cache = {}


# ----------------------------------------------------------------- simple labels
def ph_level(ph):
    if ph is None:
        return None
    if ph < 5.5:
        return "acidic"
    if ph < 6.5:
        return "slightly acidic"
    if ph < 7.5:
        return "neutral"
    if ph < 8.5:
        return "slightly alkaline"
    return "strongly alkaline"


def carbon_level(soc_g_per_kg):
    """Organic carbon: below 0.5% (5 g/kg) is called low in Indian soil testing."""
    if soc_g_per_kg is None:
        return None
    if soc_g_per_kg < 5:
        return "low"
    if soc_g_per_kg < 7.5:
        return "medium"
    return "high"


def moisture_level(m3_per_m3):
    """Topsoil water from the forecast model (not a field sensor)."""
    if m3_per_m3 is None:
        return None
    if m3_per_m3 < 0.15:
        return "dry"
    if m3_per_m3 < 0.35:
        return "moderate"
    return "wet"


def texture_class(sand, silt, clay):
    """Soil type from sand, silt and clay percentages (USDA texture triangle)."""
    if None in (sand, silt, clay):
        return None
    if silt + 1.5 * clay < 15:
        return "sand"
    if silt + 1.5 * clay >= 15 and silt + 2 * clay < 30:
        return "loamy sand"
    if (7 <= clay < 20 and sand > 52 and silt + 2 * clay >= 30) or \
       (clay < 7 and silt < 50 and silt + 2 * clay >= 30):
        return "sandy loam"
    if 7 <= clay < 27 and 28 <= silt < 50 and sand <= 52:
        return "loam"
    if (silt >= 50 and 12 <= clay < 27) or (50 <= silt < 80 and clay < 12):
        return "silt loam"
    if silt >= 80 and clay < 12:
        return "silt"
    if 20 <= clay < 35 and silt < 28 and sand > 45:
        return "sandy clay loam"
    if 27 <= clay < 40 and 20 < sand <= 45:
        return "clay loam"
    if 27 <= clay < 40 and sand <= 20:
        return "silty clay loam"
    if clay >= 35 and sand > 45:
        return "sandy clay"
    if clay >= 40 and silt >= 40:
        return "silty clay"
    if clay >= 40:
        return "clay"
    return "loam"


# ----------------------------------------------------------------- SoilGrids
def _read_layers(payload):
    """{'phh2o': 7.8, 'soc': 6.1, ...} from a SoilGrids reply; missing values are None."""
    values = {}
    for layer in (payload.get("properties") or {}).get("layers") or []:
        name = layer.get("name")
        try:
            raw = layer["depths"][0]["values"]["mean"]
        except Exception:
            raw = None
        if name is None or raw is None:
            values[name] = None
            continue
        factor = (layer.get("unit_measure") or {}).get("d_factor") or DEFAULT_DFACTOR.get(name, 1)
        values[name] = raw / factor
    return values


def get_soil(lat, lon):
    """Soil of the area, or None if the service is down or has no data here."""
    if lat is None or lon is None:
        return None
    key = (round(float(lat), 2), round(float(lon), 2))
    hit = _cache.get(key)
    if hit and time.time() - hit[0] < CACHE_SECONDS:
        return hit[1]

    result = None
    for attempt in range(TRIES):
        try:
            resp = requests.get(
                SOILGRIDS_URL,
                params={"lon": lon, "lat": lat, "property": PROPERTIES,
                        "depth": DEPTH, "value": "mean"},
                headers={"accept": "application/json"},
                timeout=TIMEOUT,
            )
            resp.raise_for_status()
            v = _read_layers(resp.json())
            sand, silt, clay = v.get("sand"), v.get("silt"), v.get("clay")
            if v.get("phh2o") is not None or None not in (sand, silt, clay):
                result = {
                    "ph": None if v.get("phh2o") is None else round(v["phh2o"], 1),
                    "organic_carbon": None if v.get("soc") is None else round(v["soc"], 1),
                    "nitrogen": None if v.get("nitrogen") is None else round(v["nitrogen"], 2),
                    "sand": None if sand is None else round(sand),
                    "silt": None if silt is None else round(silt),
                    "clay": None if clay is None else round(clay),
                }
                result["texture"] = texture_class(sand, silt, clay)
                result["ph_level"] = ph_level(result["ph"])
                result["carbon_level"] = carbon_level(result["organic_carbon"])
            break                                   # got an answer (even an empty one)
        except Exception:
            if attempt < TRIES - 1:
                time.sleep(1)
    _cache[key] = (time.time(), result)
    return result


# ----------------------------------------------------------------- the field report
def build_field_report(weather, soil):
    """Everything we know about the weather and soil of the area, or None."""
    report = {}
    if weather:
        report.update({
            "place": weather.get("place"),
            "temp_now": weather.get("temp_now"),
            "today_low": weather.get("temp_today_min"),
            "today_high": weather.get("temp_today_max"),
            "rain_chance": weather.get("rain_chance"),
            "rain_mm": weather.get("rain_mm"),
            "wind_max": weather.get("wind_max"),
            "soil_temp": weather.get("soil_temp"),
            "soil_moisture": weather.get("soil_moisture"),
            "moisture_level": moisture_level(weather.get("soil_moisture")),
        })
    if soil:
        report.update({
            "soil_type": soil.get("texture"),
            "ph": soil.get("ph"),
            "ph_level": soil.get("ph_level"),
            "carbon_level": soil.get("carbon_level"),
            "organic_carbon": soil.get("organic_carbon"),
        })
    report = {k: v for k, v in report.items() if v is not None}
    return report or None


def field_rows(report):
    """Rows for the on-screen table (English)."""
    if not report:
        return []
    r = report
    rows = []

    def add(item, value):
        rows.append({"Item": item, "Value": value})

    if "temp_now" in r:
        add("Temperature now", f"{r['temp_now']:.0f} °C")
    if "today_low" in r and "today_high" in r:
        add("Today's low / high", f"{r['today_low']:.0f} / {r['today_high']:.0f} °C")
    if "rain_chance" in r:
        add("Chance of rain (next 2 days)", f"{r['rain_chance']:.0f} %")
    if "rain_mm" in r:
        add("Rain expected (next 2 days)", f"{r['rain_mm']} mm")
    if "soil_temp" in r:
        add("Soil temperature (topsoil)", f"{r['soil_temp']:.0f} °C")
    if "moisture_level" in r:
        add("Soil moisture (topsoil)", r["moisture_level"])
    if "soil_type" in r:
        add("Soil type in your area", r["soil_type"])
    if "ph" in r:
        add("Soil pH in your area", f"{r['ph']} ({r.get('ph_level', '')})".replace(" ()", ""))
    if "carbon_level" in r:
        add("Soil organic carbon", r["carbon_level"])
    return rows


def field_facts(report):
    """Small, clear facts handed to the writer so the voice can say them."""
    if not report:
        return None
    r = report
    facts = {
        "temperature_now_c": None if "temp_now" not in r else round(r["temp_now"]),
        "today_low_c": None if "today_low" not in r else round(r["today_low"]),
        "today_high_c": None if "today_high" not in r else round(r["today_high"]),
        "chance_of_rain_percent": None if "rain_chance" not in r else round(r["rain_chance"]),
        "topsoil_moisture": r.get("moisture_level"),
        "soil_type": r.get("soil_type"),
        "soil_ph": r.get("ph"),
        "soil_ph_level": r.get("ph_level"),
        "soil_organic_carbon": r.get("carbon_level"),
    }
    return {k: v for k, v in facts.items() if v is not None}


def soil_tips(report):
    """Short, general tips from the soil of the area. They do not change the amounts."""
    if not report:
        return []
    tips = []
    if report.get("soil_type") in ("sand", "loamy sand", "sandy loam"):
        tips.append("Sandy soil loses nitrogen quickly, so keep urea in small split doses.")
    if report.get("soil_type") in ("clay", "silty clay", "sandy clay"):
        tips.append("Heavy clay soil drains slowly, so avoid applying urea just before heavy rain.")
    if report.get("carbon_level") == "low":
        tips.append("Soil carbon is low in this area: farmyard manure or compost will help.")
    if report.get("ph_level") == "strongly alkaline":
        tips.append("Soil in this area may be strongly alkaline: get a soil test before adding extra fertilizer.")
    elif report.get("ph_level") == "acidic":
        tips.append("Soil in this area may be acidic: get a soil test and ask your local office about lime.")
    return tips


SOIL_CAPTION = ("Weather is a forecast for your place. Soil type and pH are estimates for your area "
                "(about 250 m map, ISRIC SoilGrids), not a test of your own field. "
                "A soil test gives the exact values.")
