"""Test the soil connection:   python check_soil.py
Prints the soil estimate for a few places in Punjab and Uttar Pradesh.
The soil service is free and sometimes slow, so it can take up to 20 seconds per place."""
import soil

PLACES = {"Ludhiana": (30.90, 75.85), "Amritsar": (31.63, 74.87), "Lucknow": (26.85, 80.95)}
for name, (lat, lon) in PLACES.items():
    print(f"\n{name}:")
    print(soil.get_soil(lat, lon) or "  no soil data (service down or no data here)")
