# Treasury & Revenue

Monitor the organization's cash position, investment portfolio, debt service obligations, and tax revenue collection.

## Overview

Connects to `I_CashAccount`, `I_Investment`, `I_DebtService`, and `I_TaxRevenue` in SAP HANA Cloud.

---

## Tabs

### Overview
- **KPI cards** — Total cash reserves, total investments, annual debt service, tax revenue YTD, total revenue YTD
- **Alerts** — Debt payments due within 30 days (red), investments maturing within 90 days (amber)
- **Cash by account type** — Pie chart (Operating / Reserve / Capital / Grant)
- **Portfolio summary** — Investment mix and debt service summary

### Cash Position
All cash accounts with current balances:

| Column | Description |
|---|---|
| Account Name | Bank/investment account name |
| Account Type | OPERATING / RESERVE / CAPITAL / GRANT |
| Institution | Bank or custodian |
| Balance | Current balance |
| Interest Rate | Applicable yield (if applicable) |
| Fund Utilization | % of fund capacity used |

A progress bar shows fund utilization for each account.

### Investments
Investment portfolio details:

| Column | Description |
|---|---|
| Investment | Description |
| Type | TREASURY / MUNICIPAL / CORPORATE / MONEY_MARKET / CD |
| Face Value | Par/face amount |
| Current Value | Market value |
| Yield % | Current yield |
| Maturity Date | When the investment matures |
| Days to Maturity | Countdown (red if <90 days) |

!!! warning "Maturing investments"
    Investments maturing within 90 days are flagged for reinvestment decision. Review with your investment advisor.

### Debt Service
All outstanding debt obligations and their payment schedules:

| Column | Description |
|---|---|
| Debt Name | Bond series or loan name |
| Type | GO Bond / Revenue Bond / Bank Loan / Lease |
| Principal Balance | Outstanding principal |
| Interest Rate | Coupon/interest rate |
| Next Payment | Amount and due date |
| Annual Service | Total annual P&I obligation |

### Tax Revenue
Tax collection performance by tax type vs budget:

- Property Tax · Sales Tax · Utility Tax · Hotel/Motel Tax · Business License Tax
- Bar chart: collected vs budgeted by type
- Line chart: monthly collection trend for the fiscal year

---

## Sierra AI Examples

- *"What is our current cash position across all accounts?"*
- *"Which investments are maturing in the next 90 days?"*
- *"Show me our debt service schedule and upcoming payments."*
- *"How is tax revenue tracking vs budget by type?"*
