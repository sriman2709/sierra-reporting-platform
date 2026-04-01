"""
test_connection.py
Verifies OAuth token fetch + Datasphere API access
for sierradigitalinc.us10.hcs.cloud.sap
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

CLIENT_ID     = os.getenv("DSP_CLIENT_ID")
CLIENT_SECRET = os.getenv("DSP_CLIENT_SECRET")
TOKEN_URL     = os.getenv("DSP_TOKEN_URL")
BASE_URL      = os.getenv("DSP_BASE_URL")

print("=" * 60)
print("Sierra Digital — Datasphere Connection Test")
print("=" * 60)
print(f"  Tenant : sierradigitalinc.us10.hcs.cloud.sap")
print(f"  Region : US10")

# ── Step 1: Fetch OAuth Token ─────────────────────────────────
print("\n[1] Fetching OAuth token...")
try:
    r = requests.post(
        TOKEN_URL,
        data={"grant_type": "client_credentials"},
        auth=(CLIENT_ID, CLIENT_SECRET),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=15,
    )
    r.raise_for_status()
    token = r.json()["access_token"]
    expires = r.json().get("expires_in", "?")
    print(f"  Token fetched successfully (expires in {expires}s)")
except Exception as e:
    print(f"  FAILED: {e}")
    exit(1)

headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}

# ── Step 2: Test Datasphere API ───────────────────────────────
print("\n[2] Testing Datasphere API endpoints...")
endpoints = [
    ("/api/v1/dwc/catalog/assets",          "Asset catalog"),
    ("/api/v1/dwc/catalog/spaces",          "Spaces list"),
    ("/api/v1/dwc/users/me",                "Current user info"),
    ("/api/v1/dwc/system/configuration",    "System config"),
]

for path, label in endpoints:
    try:
        r = requests.get(f"{BASE_URL}{path}", headers=headers, timeout=10)
        if r.status_code == 200:
            data = r.json()
            count = len(data.get("value", data if isinstance(data, list) else []))
            print(f"  OK  [{r.status_code}] {label} — {count} items")
        else:
            print(f"  --  [{r.status_code}] {label}")
    except Exception as e:
        print(f"  ERR {label}: {e}")

print("\n" + "=" * 60)
print("Connection test complete.")
print("Next step: Create a Space in Datasphere (Step 4 in guide)")
print("=" * 60)
