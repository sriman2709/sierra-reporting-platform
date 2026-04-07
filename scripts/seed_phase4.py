#!/usr/bin/env python3
"""
seed_phase4.py  –  Phase 4 demo data: Treasury & Executive
Creates and populates:
  I_CashAccount   I_Investment    I_DebtService   I_TaxRevenue
  I_ExecutiveAlert  I_KPIBenchmark
Run: python scripts/seed_phase4.py
"""

import hdbcli.dbapi as hdb
import os, sys
from dotenv import load_dotenv
from datetime import date, timedelta
import random

load_dotenv()

HOST   = os.environ["HANA_HOST"]
PORT   = int(os.environ.get("HANA_PORT", 443))
USER   = os.environ["HANA_USER"]
PASSWD = os.environ["HANA_PASSWORD"]
SCHEMA = "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"

print(f"Connecting to {HOST}:{PORT} as {USER}…")
conn = hdb.connect(address=HOST, port=PORT, user=USER, password=PASSWD,
                   encrypt=True, sslValidateCertificate=False)
cur = conn.cursor()

def ex(sql, params=None):
    try:
        cur.execute(sql, params or [])
    except Exception as e:
        print(f"  ⚠  {e}")

def run(label, sql):
    print(f"  → {label}")
    ex(sql)

S = f'"{SCHEMA}"'

# ─────────────────────────────────────────────────────────────────────────────
# 1. I_CashAccount
# ─────────────────────────────────────────────────────────────────────────────
print("\n[1/6] I_CashAccount")
ex(f'DROP TABLE {S}."I_CashAccount" CASCADE')
ex(f"""
CREATE TABLE {S}."I_CashAccount" (
  "account_id"          NVARCHAR(20)  PRIMARY KEY,
  "account_name"        NVARCHAR(100) NOT NULL,
  "account_type"        NVARCHAR(20)  NOT NULL,
  "fund_id"             NVARCHAR(20),
  "balance"             DECIMAL(18,2) NOT NULL,
  "as_of_date"          DATE          NOT NULL,
  "bank_name"           NVARCHAR(80)  NOT NULL,
  "account_number_last4" NVARCHAR(4)  NOT NULL
)
""")

cash_accounts = [
    ("CA-001", "General Fund Operating",      "OPERATING",  "GF-001",  18_450_000, date(2026,3,31), "First National Bank",   "4821"),
    ("CA-002", "Public Safety Operations",    "OPERATING",  "PS-002",   5_230_000, date(2026,3,31), "First National Bank",   "3917"),
    ("CA-003", "Capital Improvement Reserve", "RESERVE",    "CIP-003",  12_750_000, date(2026,3,31), "State Treasury Dept",   "6643"),
    ("CA-004", "Emergency Reserve Fund",      "RESERVE",    "ER-004",   8_100_000, date(2026,3,31), "State Treasury Dept",   "5512"),
    ("CA-005", "CDBG Grant Restricted",       "RESTRICTED", "GR-005",   2_340_000, date(2026,3,31), "Community Bank",        "7890"),
    ("CA-006", "ARPA Federal Restricted",     "RESTRICTED", "GR-006",   6_880_000, date(2026,3,31), "Community Bank",        "2234"),
    ("CA-007", "Debt Service Reserve",        "RESERVE",    "DS-007",   4_500_000, date(2026,3,31), "Municipal Trust Co",    "8801"),
    ("CA-008", "Water Utility Operating",     "OPERATING",  "UT-008",   3_125_000, date(2026,3,31), "First National Bank",   "1156"),
    ("CA-009", "Transportation Fund",         "OPERATING",  "TR-009",   2_670_000, date(2026,3,31), "Regional Savings Bank", "9923"),
    ("CA-010", "Investment Pool Account",     "INVESTMENT", None,       22_000_000, date(2026,3,31), "State Investment Pool", "0044"),
]
for r in cash_accounts:
    ex(f"""INSERT INTO {S}."I_CashAccount" VALUES(?,?,?,?,?,?,?,?)""", list(r))
print(f"     Inserted {len(cash_accounts)} cash accounts")

# ─────────────────────────────────────────────────────────────────────────────
# 2. I_Investment
# ─────────────────────────────────────────────────────────────────────────────
print("\n[2/6] I_Investment")
ex(f'DROP TABLE {S}."I_Investment" CASCADE')
ex(f"""
CREATE TABLE {S}."I_Investment" (
  "investment_id"   NVARCHAR(20) PRIMARY KEY,
  "investment_type" NVARCHAR(20) NOT NULL,
  "issuer"          NVARCHAR(100) NOT NULL,
  "par_value"       DECIMAL(18,2) NOT NULL,
  "current_value"   DECIMAL(18,2) NOT NULL,
  "purchase_date"   DATE NOT NULL,
  "maturity_date"   DATE NOT NULL,
  "yield_rate"      DECIMAL(6,4)  NOT NULL,
  "rating"          NVARCHAR(10),
  "status"          NVARCHAR(15)  NOT NULL
)
""")

today = date.today()
investments = [
    ("INV-001", "TBILL",        "US Treasury",                  3_000_000, 3_008_400,  date(2025,10,1),  today+timedelta(days=45),  0.0531, "AAA",  "ACTIVE"),
    ("INV-002", "TBILL",        "US Treasury",                  2_500_000, 2_507_500,  date(2025,11,15), today+timedelta(days=72),  0.0525, "AAA",  "ACTIVE"),
    ("INV-003", "BOND",         "State of California",          5_000_000, 5_125_000,  date(2023,6,1),   today+timedelta(days=450), 0.0425, "AA+",  "ACTIVE"),
    ("INV-004", "BOND",         "City of San Francisco GO",     2_000_000, 1_985_000,  date(2022,9,15),  today+timedelta(days=820), 0.0380, "AA",   "ACTIVE"),
    ("INV-005", "MONEY_MARKET", "Federated Investors",          4_000_000, 4_018_200,  date(2026,1,1),   today+timedelta(days=180), 0.0512, "AAA",  "ACTIVE"),
    ("INV-006", "MONEY_MARKET", "Vanguard Prime MMF",           3_500_000, 3_514_700,  date(2026,2,1),   today+timedelta(days=150), 0.0508, "AAA",  "ACTIVE"),
    ("INV-007", "CD",           "First National Bank",          1_000_000, 1_011_000,  date(2025,9,1),   today+timedelta(days=60),  0.0465, "AA-",  "ACTIVE"),
    ("INV-008", "CD",           "Regional Savings Bank",        1_500_000, 1_518_750,  date(2025,7,15),  today+timedelta(days=100), 0.0450, "A+",   "ACTIVE"),
    ("INV-009", "AGENCY",       "Federal Home Loan Bank",       3_000_000, 3_042_000,  date(2024,3,1),   today+timedelta(days=600), 0.0395, "AAA",  "ACTIVE"),
    ("INV-010", "BOND",         "Sacramento Unified SD Bond",   1_500_000, 1_467_000,  date(2021,11,1),  today+timedelta(days=1200),0.0315, "AA",   "ACTIVE"),
    ("INV-011", "TBILL",        "US Treasury",                  2_000_000, 2_012_000,  date(2025,8,1),   today-timedelta(days=15),  0.0518, "AAA",  "MATURED"),
    ("INV-012", "CD",           "Community Bank",                 500_000,   512_500,  date(2024,6,1),   today+timedelta(days=320), 0.0442, "A",    "ACTIVE"),
]
for r in investments:
    ex(f"""INSERT INTO {S}."I_Investment" VALUES(?,?,?,?,?,?,?,?,?,?)""", list(r))
print(f"     Inserted {len(investments)} investments")

# ─────────────────────────────────────────────────────────────────────────────
# 3. I_DebtService
# ─────────────────────────────────────────────────────────────────────────────
print("\n[3/6] I_DebtService")
ex(f'DROP TABLE {S}."I_DebtService" CASCADE')
ex(f"""
CREATE TABLE {S}."I_DebtService" (
  "debt_id"              NVARCHAR(20)  PRIMARY KEY,
  "bond_description"     NVARCHAR(150) NOT NULL,
  "bond_type"            NVARCHAR(20)  NOT NULL,
  "original_principal"   DECIMAL(18,2) NOT NULL,
  "outstanding_balance"  DECIMAL(18,2) NOT NULL,
  "interest_rate"        DECIMAL(6,4)  NOT NULL,
  "next_payment_date"    DATE          NOT NULL,
  "annual_payment"       DECIMAL(18,2) NOT NULL,
  "maturity_year"        SMALLINT      NOT NULL
)
""")

debt_records = [
    ("DS-001", "2018 General Obligation Bonds — Streets & Roads",    "GO_BOND",      25_000_000, 18_750_000, 0.0375, today+timedelta(days=25),  1_562_500, 2033),
    ("DS-002", "2020 GO Bonds — Public Safety Facility",            "GO_BOND",      15_000_000, 13_500_000, 0.0325, today+timedelta(days=55),  1_012_500, 2035),
    ("DS-003", "2019 Revenue Bonds — Water Treatment Plant",        "REVENUE_BOND", 30_000_000, 22_800_000, 0.0410, today+timedelta(days=82),  1_966_800, 2034),
    ("DS-004", "2021 Revenue Bonds — Convention Center",            "REVENUE_BOND", 20_000_000, 18_400_000, 0.0355, today+timedelta(days=110), 1_476_200, 2036),
    ("DS-005", "2022 COP — Fleet & Equipment Replacement",          "COP",           8_000_000,  6_400_000, 0.0285, today+timedelta(days=140),   614_400, 2032),
    ("DS-006", "2016 GO Refunding Bonds",                           "GO_BOND",      10_000_000,  4_500_000, 0.0290, today+timedelta(days=175),   472_500, 2028),
    ("DS-007", "2023 Lease Revenue Bonds — Library Renovation",     "LEASE",         5_000_000,  4_750_000, 0.0420, today+timedelta(days=200),   399_000, 2038),
    ("DS-008", "2017 Revenue Bonds — Stormwater Infrastructure",    "REVENUE_BOND", 12_000_000,  7_200_000, 0.0365, today+timedelta(days=250),   810_000, 2030),
]
for r in debt_records:
    ex(f"""INSERT INTO {S}."I_DebtService" VALUES(?,?,?,?,?,?,?,?,?)""", list(r))
print(f"     Inserted {len(debt_records)} debt service records")

# ─────────────────────────────────────────────────────────────────────────────
# 4. I_TaxRevenue
# ─────────────────────────────────────────────────────────────────────────────
print("\n[4/6] I_TaxRevenue")
ex(f'DROP TABLE {S}."I_TaxRevenue" CASCADE')
ex(f"""
CREATE TABLE {S}."I_TaxRevenue" (
  "record_id"        NVARCHAR(30) PRIMARY KEY,
  "tax_type"         NVARCHAR(30) NOT NULL,
  "fiscal_month"     SMALLINT     NOT NULL,
  "fiscal_year"      SMALLINT     NOT NULL,
  "period_label"     NVARCHAR(20) NOT NULL,
  "amount_collected" DECIMAL(14,2) NOT NULL,
  "amount_budgeted"  DECIMAL(14,2) NOT NULL
)
""")

tax_types = [
    ("PROPERTY_TAX",    [1_850_000, 1_820_000, 1_890_000, 1_760_000, 1_830_000, 1_900_000,
                         1_870_000, 1_810_000, 1_955_000, 1_780_000, 1_840_000, 1_920_000],
                        [1_800_000] * 12),
    ("SALES_TAX",       [2_100_000, 2_050_000, 2_230_000, 1_980_000, 2_150_000, 2_400_000,
                         2_200_000, 2_310_000, 2_050_000, 1_960_000, 2_180_000, 2_550_000],
                        [2_000_000] * 12),
    ("UTILITY_TAX",     [  720_000,   695_000,   710_000,   680_000,   705_000,   730_000,
                            715_000,   698_000,   722_000,   690_000,   708_000,   735_000],
                        [  700_000] * 12),
    ("BUSINESS_LICENSE",[  280_000,   295_000,   310_000,   270_000,   285_000,   300_000,
                            288_000,   292_000,   305_000,   275_000,   280_000,   315_000],
                        [  290_000] * 12),
    ("TRANSIENT_OCC_TAX",[  195_000,  185_000,   210_000,   240_000,   290_000,   380_000,
                             420_000,  445_000,   380_000,   310_000,   220_000,   195_000],
                        [  280_000] * 12),
]

months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
current_year  = date.today().year
current_month = date.today().month

rows = []
for yr in [current_year - 1, current_year]:
    for m in range(1, 13):
        if yr == current_year and m > current_month:
            break
        label = f"{months[m-1]} {yr}"
        for tt, collected_list, budgeted_list in tax_types:
            rid = f"{tt[:8]}-{yr}-{m:02d}"
            coll = collected_list[m - 1]
            budg = budgeted_list[m - 1]
            rows.append((rid, tt, m, yr, label, coll, budg))

for r in rows:
    ex(f"""INSERT INTO {S}."I_TaxRevenue" VALUES(?,?,?,?,?,?,?)""", list(r))
print(f"     Inserted {len(rows)} tax revenue records ({len(tax_types)} tax types × months)")

# ─────────────────────────────────────────────────────────────────────────────
# 5. I_ExecutiveAlert
# ─────────────────────────────────────────────────────────────────────────────
print("\n[5/6] I_ExecutiveAlert")
ex(f'DROP TABLE {S}."I_ExecutiveAlert" CASCADE')
ex(f"""
CREATE TABLE {S}."I_ExecutiveAlert" (
  "alert_id"     NVARCHAR(20)  PRIMARY KEY,
  "domain"       NVARCHAR(30)  NOT NULL,
  "severity"     NVARCHAR(10)  NOT NULL,
  "title"        NVARCHAR(150) NOT NULL,
  "description"  NVARCHAR(500) NOT NULL,
  "created_date" DATE          NOT NULL,
  "status"       NVARCHAR(20)  NOT NULL,
  "assigned_to"  NVARCHAR(80)
)
""")

alerts = [
    ("ALT-001", "GRANTS",      "HIGH",   "Grant Burn Rate Below Threshold",
     "ARPA Economic Recovery grant at 34% spend with 5 months remaining. Risk of reversion if pace not increased.",
     date(2026,3,28), "OPEN",         "Grants Director"),
    ("ALT-002", "PROCUREMENT",  "HIGH",   "3 Invoices Pending > 60 Days",
     "Three vendor invoices (total $148,500) exceed 60-day payment terms. Penalty interest accruing under contract terms.",
     date(2026,3,25), "ACKNOWLEDGED", "AP Manager"),
    ("ALT-003", "FLEET",        "HIGH",   "Fire Department Vehicle OOS — Capacity Risk",
     "Unit FL-0042 out of service since Mar 18. No backup unit available. Fire coverage reduced in District 3.",
     date(2026,3,18), "OPEN",         "Fleet Director"),
    ("ALT-004", "TREASURY",     "MEDIUM", "Debt Payment Due in 25 Days",
     "2018 GO Bonds semi-annual payment of $781,250 due Apr 30. Confirm fund availability with Finance.",
     date(2026,4,1),  "OPEN",         "Treasurer"),
    ("ALT-005", "ASSETS",       "MEDIUM", "HVAC Preventive Maintenance Overdue — City Hall",
     "City Hall HVAC PM last performed Oct 2025. Scheduled for Feb 2026 — now 45 days overdue.",
     date(2026,3,20), "ACKNOWLEDGED", "Facilities Manager"),
    ("ALT-006", "HR",           "MEDIUM", "7 Vacant Positions in Critical Roles",
     "Engineering (3), IT (2), and Finance (2) positions unfilled >90 days. Workload strain reported.",
     date(2026,3,15), "OPEN",         "HR Director"),
    ("ALT-007", "INVENTORY",    "MEDIUM", "Public Works Materials Below Reorder Point",
     "Asphalt, aggregate, and pipe fittings below reorder threshold. Spring construction season approaching.",
     date(2026,3,29), "OPEN",         "Warehouse Manager"),
    ("ALT-008", "CAPITAL",      "MEDIUM", "Downtown Plaza Project 12% Over Budget",
     "Project CP-0031 actual spend $2.85M vs $2.54M approved budget. Change order review required.",
     date(2026,3,22), "ACKNOWLEDGED", "Capital Projects Dir"),
    ("ALT-009", "FINANCE",      "LOW",    "Q3 Budget Variance Report Due",
     "Q3 FY2026 budget variance analysis due to City Council April 15. Draft preparation underway.",
     date(2026,4,2),  "OPEN",         "Finance Director"),
    ("ALT-010", "GRANTS",       "LOW",    "Annual Performance Report Deadline",
     "HUD CDBG annual performance report due June 30. Data collection to begin May 1.",
     date(2026,3,30), "OPEN",         "Grants Analyst"),
    ("ALT-011", "TREASURY",     "LOW",    "3 T-Bills Maturing — Reinvestment Decision Needed",
     "US Treasury Bills INV-001 and INV-002 maturing within 45-72 days. Investment policy review required.",
     date(2026,4,1),  "OPEN",         "Treasurer"),
    ("ALT-012", "PROCUREMENT",  "LOW",    "2 Contracts Expiring Within 90 Days",
     "Janitorial services and landscaping contracts expire June 30. Renewal or re-bid required by May 1.",
     date(2026,3,24), "ACKNOWLEDGED", "Procurement Manager"),
]
for r in alerts:
    ex(f"""INSERT INTO {S}."I_ExecutiveAlert" VALUES(?,?,?,?,?,?,?,?)""", list(r))
print(f"     Inserted {len(alerts)} executive alerts")

# ─────────────────────────────────────────────────────────────────────────────
# 6. I_KPIBenchmark
# ─────────────────────────────────────────────────────────────────────────────
print("\n[6/6] I_KPIBenchmark")
ex(f'DROP TABLE {S}."I_KPIBenchmark" CASCADE')
ex(f"""
CREATE TABLE {S}."I_KPIBenchmark" (
  "benchmark_id"  NVARCHAR(20) PRIMARY KEY,
  "domain"        NVARCHAR(30) NOT NULL,
  "kpi_name"      NVARCHAR(80) NOT NULL,
  "current_value" DECIMAL(14,4) NOT NULL,
  "target_value"  DECIMAL(14,4) NOT NULL,
  "peer_avg"      DECIMAL(14,4) NOT NULL,
  "unit"          NVARCHAR(20)  NOT NULL,
  "trend"         NVARCHAR(10)  NOT NULL,
  "period"        NVARCHAR(20)  NOT NULL
)
""")

benchmarks = [
    # Grants
    ("BM-001", "GRANTS",      "Grant Spend Rate",             87.4,  95.0,  82.1, "pct",     "UP",     "Q1 FY2026"),
    ("BM-002", "GRANTS",      "Compliance Rate",              96.2,  98.0,  94.5, "pct",     "STABLE", "Q1 FY2026"),
    ("BM-003", "GRANTS",      "Report Submission On-Time",    91.7,  100.0, 88.0, "pct",     "UP",     "Q1 FY2026"),
    # Finance
    ("BM-004", "FINANCE",     "Budget Utilisation Rate",      72.8,  85.0,  75.3, "pct",     "UP",     "YTD FY2026"),
    ("BM-005", "FINANCE",     "Days Cash on Hand",           142.0, 120.0, 105.0, "days",    "UP",     "Mar 2026"),
    ("BM-006", "FINANCE",     "Debt Coverage Ratio",           2.4,   2.0,   1.8, "ratio",   "STABLE", "FY2026"),
    # Treasury
    ("BM-007", "TREASURY",    "Investment Yield (Avg)",        4.8,   4.5,   4.2, "pct",     "UP",     "Q1 FY2026"),
    ("BM-008", "TREASURY",    "Tax Collection Rate",          97.3,  98.0,  95.6, "pct",     "UP",     "FY2026 YTD"),
    ("BM-009", "TREASURY",    "Debt-to-Revenue Ratio",        18.4,  20.0,  22.5, "pct",     "DOWN",   "FY2026"),
    # HR
    ("BM-010", "HR",          "Employee Turnover Rate",        8.2,   7.0,   9.5, "pct",     "DOWN",   "FY2026 YTD"),
    ("BM-011", "HR",          "Vacancy Fill Time (Days)",     52.0,  45.0,  58.0, "days",    "DOWN",   "Q1 FY2026"),
    ("BM-012", "HR",          "Training Hours Per Employee",  18.5,  24.0,  16.8, "hours",   "UP",     "FY2026 YTD"),
    # Fleet
    ("BM-013", "FLEET",       "Fleet Availability Rate",      88.5,  92.0,  87.0, "pct",     "DOWN",   "Q1 FY2026"),
    ("BM-014", "FLEET",       "Cost Per Mile",                 0.58,  0.55,  0.62, "USD",    "UP",     "Q1 FY2026"),
    # Assets
    ("BM-015", "ASSETS",      "PM Completion Rate",           78.4,  90.0,  81.2, "pct",     "DOWN",   "Q1 FY2026"),
    ("BM-016", "ASSETS",      "Mean Time to Repair (Hrs)",    14.2,  12.0,  16.5, "hours",   "DOWN",   "Q1 FY2026"),
    # Procurement
    ("BM-017", "PROCUREMENT", "Invoice Processing Time (Days)", 4.8,  3.0,   5.5, "days",   "DOWN",   "Q1 FY2026"),
    ("BM-018", "PROCUREMENT", "Competitive Bid Rate",         72.3,  80.0,  69.8, "pct",     "UP",     "FY2026 YTD"),
    # Inventory
    ("BM-019", "INVENTORY",   "Inventory Turnover Rate",       6.2,   8.0,   5.8, "turns",   "UP",     "FY2026 YTD"),
    ("BM-020", "INVENTORY",   "Stockout Incidents",            3.0,   0.0,   4.5, "count",   "DOWN",   "Q1 FY2026"),
]
for r in benchmarks:
    ex(f"""INSERT INTO {S}."I_KPIBenchmark" VALUES(?,?,?,?,?,?,?,?,?)""", list(r))
print(f"     Inserted {len(benchmarks)} KPI benchmarks")

# ─────────────────────────────────────────────────────────────────────────────
conn.commit()
cur.close()
conn.close()
print("\n✅  Phase 4 seed complete — 6 tables populated")
print("    I_CashAccount, I_Investment, I_DebtService, I_TaxRevenue")
print("    I_ExecutiveAlert, I_KPIBenchmark")
