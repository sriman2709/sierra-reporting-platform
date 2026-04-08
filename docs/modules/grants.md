# Grants Management

Manage the full grant lifecycle from award to close-out — compliance posture, burn rate monitoring, subrecipient oversight, and allowability tracking.

## Overview

The Grants module connects to the `I_GrantMaster` table in SAP HANA Cloud and surfaces key grant management intelligence across five tabs.

---

## Tabs

### Portfolio Overview
A high-level view of the grants portfolio:

- **KPI cards** — Total grants, total award value, active grants, grants expiring in ≤90 days, compliance score, at-risk count
- **Grant status distribution** — pie chart of ACTIVE / EXPIRING / CLOSED / PENDING grants
- **Burn rate chart** — bar chart showing spend % vs time elapsed % for each grant. Grants that are over-burning (spending faster than time elapses) are highlighted in red.
- **Grant pipeline table** — all grants with award amount, balance remaining, expiry date, and status badge

### Compliance Posture
Compliance scores (0–100) for every grant:

- Score is computed from: document completeness, approval count, evidence count, open findings, and high findings
- **Risk tiers**: STRONG (80+) · ADEQUATE (60–79) · NEEDS_IMPROVEMENT (40–59) · AT_RISK (<40)
- Click any grant to drill into its compliance details

### Subrecipient Risk
Monitoring status for all subrecipient organizations:

- **Risk ratings**: HIGH · MEDIUM · LOW
- Columns: organization name, total awarded, risk rating, findings count, last report date, follow-up required
- HIGH-risk subrecipients are highlighted in red and should be prioritized for monitoring visits

### Allowability Rules
A reference table of cost categories and their allowability under **2 CFR Part 200**:

- ALLOWABLE / NOT_ALLOWABLE / CONDITIONAL
- Conditions and notes for each category
- Use this tab to validate expenditure classifications before submission

### Audit Findings
Cross-reference with the Audit module — findings linked to specific grants, organized by severity (MATERIAL / SIGNIFICANT / MINOR).

---

## Key Metrics Explained

| Metric | Definition |
|---|---|
| **Burn Rate** | (Amount spent / Total award) ÷ (Days elapsed / Total grant period). >1.0 = over-burning |
| **Compliance Score** | Weighted score 0–100. Deductions for open findings, missing documents, unapproved expenditures |
| **At Risk** | Grants with compliance score <40 OR burn rate >1.2 OR expiring within 30 days |

---

## Common Actions

- **Export** — Download grant list as CSV for reporting
- **Filter by status** — Use the status tabs to isolate ACTIVE / EXPIRING / AT_RISK grants
- **Ask Sierra AI** — Click to Sierra Intelligence with the grant context pre-loaded

---

## Sierra AI Examples

Try asking Sierra Intelligence:

- *"Which grants are over-burning their budget this quarter?"*
- *"Show me the compliance posture for all federal grants."*
- *"Which grants are expiring in the next 60 days and haven't been renewed?"*
- *"Which subrecipients are high risk and what are their findings?"*
