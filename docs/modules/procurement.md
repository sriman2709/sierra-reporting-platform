# Procurement & AP

Monitor contracts, accounts payable, vendor risk, and the procurement pipeline across the organization.

## Overview

Connects to `I_Contract`, `I_PurchaseOrder`, `I_Invoice`, and `I_Vendor` in SAP HANA Cloud.

---

## Tabs

### Dashboard
- Contract count, active contracts, expiring ≤90 days, AP overdue value, vendor count, high-risk vendor count
- Contract expiry timeline chart
- AP aging buckets (Current / 30–60 days / 60–90 days / 90+ days)

### Contracts
Full contract register:

| Column | Description |
|---|---|
| Contract # | Unique identifier |
| Vendor | Contracted party |
| Contract Type | SERVICE / GOODS / CONSTRUCTION / CONSULTING |
| Value | Total contract value |
| Start / End Date | Contract period |
| Utilization % | Invoiced ÷ Contract value |
| Status | ACTIVE / EXPIRING / EXPIRED / PENDING |

!!! warning "Expiring contracts"
    Contracts expiring within 90 days are highlighted in amber. Contracts expiring within 30 days are highlighted in red. Renewal actions should be initiated at least 60 days before expiry.

### AP Aging
Invoice-level accounts payable aging:

- **Current** — Not yet due
- **30–60 days** — Past due 30–60 days
- **60–90 days** — Past due 60–90 days (escalation recommended)
- **90+ days** — Critical overdue (vendor relationship risk)

Sortable by department, vendor, or due date.

### Vendor Risk
Vendor risk scoring based on debarment status, financial stability, compliance history:

- **Risk Score** — 0 (low) to 100 (high)
- **Debarment Status** — CLEAR / WATCHLIST / DEBARRED
- **Tier** — PREFERRED / APPROVED / CONDITIONAL / HIGH_RISK

!!! danger "Debarred vendors"
    Payments to debarred vendors are prohibited under federal regulations. The system flags any invoice from a debarred vendor immediately.

### Procurement Pipeline
Open purchase orders and their approval status:

- PO number, department, vendor, amount, status (DRAFT / SUBMITTED / APPROVED / RECEIVED)
- Days in pipeline (time since PO creation)

---

## Sierra AI Examples

- *"Which contracts are expiring in the next 60 days?"*
- *"Which vendors have the highest risk scores?"*
- *"What is our AP aging situation — how much is 90+ days overdue?"*
- *"Which departments have the most open purchase orders?"*
- *"Are any of our active vendors on the debarment watchlist?"*
