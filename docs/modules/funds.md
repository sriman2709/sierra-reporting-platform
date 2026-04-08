# Fund Accounting

Track fund balances, available-to-spend, encumbrances, and GASB-54 fund classifications across the full fund portfolio.

## Overview

The Fund Accounting module connects to `I_Fund` and `I_BudgetLine` in SAP HANA Cloud and provides visibility into the financial health of every fund.

---

## Tabs

### Portfolio Overview
- **KPI cards** — Total funds, total balance, total restricted, unassigned balance, encumbrances, available-to-spend, over-budget fund count
- **Fund health chart** — bar chart of budget vs expenditure vs available for all funds
- **Status distribution** — pie chart (OVER_BUDGET · CRITICAL · WARNING · ON_TRACK)

### Available-to-Spend
Detailed available balance for every fund:

| Column | Description |
|---|---|
| Fund Name | Fund identifier |
| Budget | Total appropriated budget |
| Expenditures YTD | Actuals spent year-to-date |
| Encumbrances | Committed but not yet paid |
| Available | Budget − Expenditures − Encumbrances |
| Burn % | Expenditures ÷ Budget |
| Status | OVER_BUDGET / CRITICAL (<10% remaining) / WARNING (<20%) / ON_TRACK |

### GASB-54 Classifications
Funds organized by GASB Statement 54 category:

- **Nonspendable** — Inventories, prepaid items, long-term receivables
- **Restricted** — Externally imposed constraints (grants, bond proceeds)
- **Committed** — Board/council resolution required to change
- **Assigned** — Intent to use for specific purpose
- **Unassigned** — Residual balance (General Fund only)

### Budget vs Actuals Trend
Month-by-month actuals vs revised budget per department — line chart showing spending velocity through the fiscal year.

---

## Key Metrics Explained

| Metric | Definition |
|---|---|
| **Available-to-Spend** | Budget − YTD Expenditures − Encumbrances |
| **Burn %** | YTD Expenditures ÷ Budget × 100 |
| **OVER_BUDGET** | Expenditures exceed the approved budget |
| **CRITICAL** | Less than 10% of budget remaining |

---

## Sierra AI Examples

- *"Which funds are over budget or critically low?"*
- *"What is the total available-to-spend across all restricted funds?"*
- *"Show me budget vs actuals by department for the current fiscal year."*
- *"Which funds have the highest encumbrance ratios?"*
