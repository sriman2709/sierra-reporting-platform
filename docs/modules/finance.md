# Finance Controller

Budget vs actuals by department, period close readiness, journal entry exceptions, and interfund activity monitoring.

## Overview

Connects to `I_BudgetLine`, `I_Document`, and related financial tables.

---

## Tabs

### Budget vs Actuals
Department-level budget performance for the current fiscal year:

| Column | Description |
|---|---|
| Department | Organizational unit |
| Revised Budget | Approved appropriation (may differ from original after amendments) |
| Actuals YTD | Posted expenditures to date |
| Variance | Revised Budget − Actuals YTD |
| Variance % | Variance ÷ Revised Budget × 100 |
| Status | OVER_BUDGET / WARNING / ON_TRACK |

The bar chart overlays budget vs actuals for visual comparison across all departments.

### Close Readiness
Period-end close checklist showing the completion status of each close step:

- Journal entry posting complete
- Interfund transfer reconciliation
- Encumbrance carry-forward review
- Bank reconciliation
- Grant billing and drawdown
- Fixed asset depreciation posting

Each step shows: status (COMPLETE / IN_PROGRESS / PENDING), responsible party, and due date.

### Journal Exceptions
Unusual or flagged journal entries for review:

- Large round-number entries (potential manual posting errors)
- Entries outside normal business hours
- Entries reversing within 30 days
- Entries with no supporting document reference

### Interfund Activity
Summary of transfers between funds — amount, transferring fund, receiving fund, purpose, and approval status.

---

## Sierra AI Examples

- *"Which departments are over budget this fiscal year?"*
- *"What is the budget variance by department?"*
- *"Is the organization ready for period close?"*
- *"Show me any journal entry exceptions from the last 30 days."*
