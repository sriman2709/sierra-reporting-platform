# Subaward & Compliance

Monitor subrecipient risk, track corrective actions, and validate cost allowability under federal regulations.

## Overview

Connects to `I_SubawardRecipient` and related compliance tables. Manages the pass-through entity's monitoring obligations under 2 CFR Part 200 Subpart D.

---

## Tabs

### Subrecipient Monitor
All subrecipient organizations and their monitoring status:

| Column | Description |
|---|---|
| Organization | Subrecipient name |
| Total Awarded | Total subaward value |
| Risk Rating | HIGH / MEDIUM / LOW |
| Findings | Count of open monitoring findings |
| Last Report | Date of most recent progress report |
| Report Status | SUBMITTED / OVERDUE / PENDING |
| Follow-Up | Whether corrective action is required |

!!! danger "High-risk subrecipients"
    HIGH-risk subrecipients require enhanced monitoring including on-site visits, increased reporting frequency, and pre-approval of expenditures.

### Corrective Actions
Tracking of required remediation for monitoring findings:

- Finding description, required action, assigned responsible party, due date, status
- Findings not remediated within the required timeframe must be escalated

### Allowability Rules
2 CFR Part 200 cost allowability reference:

| Category | Status | Notes |
|---|---|---|
| Direct Labor | ALLOWABLE | Must align with effort certifications |
| Fringe Benefits | ALLOWABLE | At rate approved in indirect cost agreement |
| Indirect Costs | CONDITIONAL | Requires approved IDC rate |
| Entertainment | NOT_ALLOWABLE | Unless specific program exception applies |
| Lobbying | NOT_ALLOWABLE | Federal prohibition |
| Equipment >$5,000 | CONDITIONAL | Requires prior approval |

---

## Sierra AI Examples

- *"Which subrecipients are high risk?"*
- *"Which subrecipients have overdue progress reports?"*
- *"Are any of our subrecipient findings past their correction deadline?"*
- *"Is indirect cost allocation to grants allowable?"*
