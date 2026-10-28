"""Run this once to test the live market price connection:

    python check_prices.py            (uses Punjab)
    python check_prices.py "Uttar Pradesh"

It prints the crops the market-price service returns for the state, and the price
the bot would show for each of your crops. If a crop shows 'no price', copy the exact
name from the first list into MANDI_NAMES in prices.py.
"""
import sys

import prices

state = sys.argv[1] if len(sys.argv) > 1 else "Punjab"
key = prices._api_key()
if not key:
    print("No DATA_GOV_API_KEY in .env. Get a free key at https://data.gov.in "
          "(My Account page) and add it to .env, then run this again.")
    sys.exit()

print(f"--- Commodity names found in {state} (first 200 records) ---")
try:
    resp = prices.requests.get(
        prices.MANDI_URL,
        params={"api-key": key, "format": "json", "limit": "200", "filters[state]": state},
        timeout=15,
    )
    print("HTTP status:", resp.status_code)
    records = resp.json().get("records") or []
    print(sorted({r.get("commodity", "?") for r in records}) or "no records returned")
except Exception as e:
    print("Could not reach the service:", e)

print(f"\n--- Price the bot would show ({state}) ---")
for crop in prices.MANDI_NAMES:
    info = prices.mandi_price(crop, None, state)
    if info:
        print(f"{crop:10s} Rs {info['modal']:>6,} per quintal  ({info['where']}, {info['date']})")
    else:
        print(f"{crop:10s} no price")
