# Capital Projects & CIP

Track capital project health, milestones, change orders, and Capital Improvement Plan (CIP) funding sources.

## Overview

Connects to `I_CapitalProject`, `I_ProjectMilestone`, `I_ChangeOrder`, and CIP funding data.

---

## Tabs

### Dashboard
- Active projects, total CIP budget, spend to date, % complete, at-risk count, delayed count
- Project health distribution (ON_TRACK / AT_RISK / DELAYED / COMPLETED)
- Budget vs spend by project (bar chart)

### Project Register

| Column | Description |
|---|---|
| Project ID / Name | Project identifier |
| Department | Managing department |
| Total Budget | Approved project budget |
| Spent to Date | Actual expenditures |
| % Complete | Physical completion estimate |
| Scheduled End | Original planned completion |
| Status | ON_TRACK / AT_RISK / DELAYED / COMPLETED |
| Project Manager | Responsible staff |

!!! danger "AT_RISK and DELAYED projects"
    Projects marked AT_RISK have cost or schedule concerns. DELAYED projects have passed their scheduled completion date. Both require executive attention and corrective action plans.

### Milestones
Key project milestones and their completion status:

- Design complete, permits obtained, groundbreaking, construction phases, substantial completion, close-out
- Status: COMPLETED / IN_PROGRESS / UPCOMING / OVERDUE
- Days ahead/behind schedule per milestone

### Change Orders
All approved and pending change orders:

| Column | Description |
|---|---|
| CO # | Change order number |
| Project | Associated project |
| Amount | Change order value (+ or −) |
| Reason | Scope change / Site condition / Design error / Owner request |
| Status | PENDING / APPROVED / REJECTED |
| Cumulative Impact | Total change orders as % of original budget |

!!! warning "Change order accumulation"
    When cumulative change orders exceed 10% of original budget, a formal budget amendment is typically required.

### CIP Funding
Funding source breakdown for the Capital Improvement Plan:

- General Obligation Bonds / Revenue Bonds / Federal Grants / State Aid / Pay-As-You-Go / Developer Contributions
- Funding gap analysis: projects without secured funding
- Multi-year CIP spending plan

---

## Sierra AI Examples

- *"Which capital projects are delayed or at risk?"*
- *"Show me change orders for all active projects."*
- *"What is total CIP spend vs budget by department?"*
- *"Which projects have milestones overdue?"*
- *"What percentage of the CIP is grant-funded?"*
