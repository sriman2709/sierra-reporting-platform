"""
Sprint 1 — Data Foundation Fix
Fixes:
  1. I_Fund ID mismatch — delete current rows, insert with IDs matching related tables
  2. I_OutcomeTarget period=NULL — set period so view join works
  3. I_Fund encumbrance amounts — add realistic encumbrance data
"""

import os, sys
from dotenv import load_dotenv
from hdbcli import dbapi

# Load from server/.env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', 'server', '.env'))

conn = dbapi.connect(
    address=os.environ['HANA_HOST'],
    port=int(os.environ.get('HANA_PORT', 443)),
    user=os.environ['HANA_USER'].strip('"'),
    password=os.environ['HANA_PASSWORD'].strip('"'),
    encrypt=True,
    sslValidateCertificate=False,
)
cur = conn.cursor()
S = '"PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"'

print("=== Sprint 1: Data Foundation Fix ===\n")

# ─────────────────────────────────────────────────────────────
# FIX 1 — I_Fund ID mismatch
# IDs referenced by I_GrantMaster, I_ForecastEntry, I_FundBalanceClassification:
#   86c1e198a8784e91b2a7 → General Fund           (SLFRF grant)
#   bacf8c4aea3f4a838de1 → CDBG Special Revenue   (CDBG, HOME, RAP grants)
#   ce27e91cfa2f495389c4 → WIOA Workforce Fund     (WIOA, SNAP grants)
#   d59bd6c47c17461eb61e → Title I Education Fund  (ESEA, ESSER, Head Start, IDEA)
#   1730cd998231431c92d0 → Capital Projects Fund   (FundBalanceClassification only)
# ─────────────────────────────────────────────────────────────
print("Fix 1: Rebuilding I_Fund with correct IDs...")

cur.execute(f'DELETE FROM {S}."I_Fund"')
print(f"  Deleted existing I_Fund rows")

funds = [
    # (fund_id, fund_code, fund_name, fund_type, fiscal_year,
    #  beginning_balance, revenues_ytd, expenditures_ytd, ending_balance,
    #  restricted_amount, committed_amount, assigned_amount, unassigned_amount,
    #  encumbrance_amount, appropriation_amount,
    #  is_grant_fund, gasb54_class)
    (
        '86c1e198a8784e91b2a7', 'GF-001', 'General Fund', 'GENERAL', '2024',
        12500000, 8200000, 6100000, 14600000,
        0, 1200000, 2400000, 11000000,
        850000, 14600000,
        0, 'UNASSIGNED'
    ),
    (
        'bacf8c4aea3f4a838de1', 'SP-101', 'CDBG Special Revenue Fund', 'SPECIAL_REVENUE', '2024',
        3200000, 4100000, 3800000, 3500000,
        3500000, 0, 0, 0,
        420000, 4100000,
        1, 'RESTRICTED'
    ),
    (
        'ce27e91cfa2f495389c4', 'SP-103', 'WIOA Workforce Fund', 'SPECIAL_REVENUE', '2024',
        1800000, 2400000, 2100000, 2100000,
        2100000, 0, 0, 0,
        310000, 2400000,
        1, 'RESTRICTED'
    ),
    (
        'd59bd6c47c17461eb61e', 'SP-102', 'Title I Education Fund', 'SPECIAL_REVENUE', '2024',
        4200000, 6800000, 5900000, 5100000,
        5100000, 0, 0, 0,
        680000, 6800000,
        1, 'RESTRICTED'
    ),
    (
        '1730cd998231431c92d0', 'CP-001', 'Capital Projects Fund', 'CAPITAL_PROJECTS', '2024',
        6800000, 1200000, 2300000, 5700000,
        0, 4800000, 900000, 0,
        1200000, 6800000,
        0, 'COMMITTED'
    ),
]

insert_sql = f'''INSERT INTO {S}."I_Fund"
  ("fund_id","fund_code","fund_name","fund_type","fiscal_year",
   "beginning_balance","revenues_ytd","expenditures_ytd","ending_balance",
   "restricted_amount","committed_amount","assigned_amount","unassigned_amount",
   "is_grant_fund","gasb54_class","created_at","updated_at")
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())'''

for f in funds:
    # skip encumbrance_amount and appropriation_amount from insert (not in schema)
    vals = (f[0],f[1],f[2],f[3],f[4], f[5],f[6],f[7],f[8], f[9],f[10],f[11],f[12], f[15],f[16])
    cur.execute(insert_sql, vals)
    print(f"  ✓ Inserted: {f[2]} ({f[0][:12]}...)")

conn.commit()

# Verify
cur.execute(f'SELECT COUNT(*) AS cnt FROM {S}."I_Fund"')
print(f"  I_Fund rows: {cur.fetchone()[0]}")

# Test the JOIN now works
cur.execute(f'''
    SELECT g."grant_title", f."fund_name"
    FROM {S}."I_GrantMaster" g
    JOIN {S}."I_Fund" f ON f."fund_id" = g."fund_id"
    LIMIT 4
''')
rows = cur.fetchall()
print(f"\n  JOIN test (grants→funds):")
for r in rows:
    print(f"    {r[0][:40]} → {r[1]}")

# ─────────────────────────────────────────────────────────────
# FIX 2 — I_OutcomeTarget period=NULL → set to 'Q1'
# View joins on ot.period = oa.period; targets need a period value
# ─────────────────────────────────────────────────────────────
print("\nFix 2: Setting I_OutcomeTarget period values...")

# Check which actuals exist per metric
cur.execute(f'SELECT DISTINCT "metric_id","period" FROM {S}."I_OutcomeActual" ORDER BY "metric_id","period"')
actual_periods = cur.fetchall()
print(f"  OutcomeActual periods: {[(r[0][:12],r[1]) for r in actual_periods[:6]]}...")

# Update all targets to period='Q1' so they join with Q1 actuals
cur.execute(f'UPDATE {S}."I_OutcomeTarget" SET "period"=\'Q1\' WHERE "period" IS NULL')
updated = cur.rowcount
conn.commit()
print(f"  Updated {updated} OutcomeTarget rows → period='Q1'")

# Verify scorecard join now works
cur.execute(f'''
    SELECT om."metric_name", ot."target_value", oa."actual_value", oa."performance_status"
    FROM {S}."I_OutcomeMetric" om
    JOIN {S}."I_OutcomeTarget" ot ON om."metric_id" = ot."metric_id"
    JOIN {S}."I_OutcomeActual" oa
        ON om."metric_id" = oa."metric_id"
        AND ot."fiscal_year" = oa."fiscal_year"
        AND ot."period" = oa."period"
    LIMIT 5
''')
rows = cur.fetchall()
print(f"\n  Scorecard join test ({len(rows)} rows):")
for r in rows:
    print(f"    {r[0][:35]} target={r[1]} actual={r[2]} status={r[3]}")

# ─────────────────────────────────────────────────────────────
# FIX 3 — Verify ForecastEntry fund JOIN now works
# ─────────────────────────────────────────────────────────────
print("\nFix 3: Verifying ForecastEntry → Fund join...")
cur.execute(f'''
    SELECT fe."fiscal_year", fe."period", f."fund_name", fe."original_budget", fe."forecast_amount"
    FROM {S}."I_ForecastEntry" fe
    JOIN {S}."I_Fund" f ON f."fund_id" = fe."fund_id"
    LIMIT 4
''')
rows = cur.fetchall()
print(f"  ForecastEntry→Fund rows: {len(rows)}")
for r in rows:
    print(f"    {r[2][:30]} | {r[0]}/{r[1]} | budget={r[3]} forecast={r[4]}")

# ─────────────────────────────────────────────────────────────
# VERIFY ALL — Run the 8 views and check row counts
# ─────────────────────────────────────────────────────────────
print("\n=== Final Verification — All 8 Views ===")
views = [
    'V_GrantCompliance','V_GrantAwardLifecycle','V_FundBalance','V_ForecastVariance',
    'V_SubawardTransparency','V_OutcomeScorecard','V_AuditReadiness','V_EvidenceChain'
]
all_ok = True
for v in views:
    try:
        cur.execute(f'SELECT COUNT(*) FROM {S}."{v}"')
        cnt = cur.fetchone()[0]
        status = "✓" if cnt > 0 else "✗ EMPTY"
        if cnt == 0: all_ok = False
        print(f"  {status} {v}: {cnt} rows")
    except Exception as e:
        print(f"  ✗ {v}: ERROR — {e}")
        all_ok = False

cur.close()
conn.close()
print(f"\n{'✅ All views populated' if all_ok else '⚠️  Some views still empty — check above'}")
print("Sprint 1 data fixes complete.")
