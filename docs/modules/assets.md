# Assets & Plant Maintenance

Track asset condition, manage work orders, monitor preventive maintenance compliance, and analyze failure events.

## Overview

Connects to `I_Asset`, `I_WorkOrder`, `I_PMPlan`, and `I_FailureEvent`.

---

## Tabs

### Dashboard
- Asset count by condition rating, open work orders by type, PM compliance %, critical asset count
- Asset condition distribution (1=Critical · 2=Poor · 3=Fair · 4=Good · 5=Excellent)
- Work order backlog by priority

### Asset Register
Full asset inventory:

| Column | Description |
|---|---|
| Asset ID / Name | Asset identifier |
| Category | HVAC / Electrical / Plumbing / Structural / Vehicle / Equipment |
| Department | Owning department |
| Condition | 1 (Critical) – 5 (Excellent) |
| Last Inspection | Date of last inspection |
| Replacement Value | Estimated replacement cost |
| Status | ACTIVE / MAINTENANCE / DECOMMISSIONED |

Assets with condition ≤2 are highlighted in red as requiring immediate attention.

### Work Orders
All maintenance work orders:

| Column | Description |
|---|---|
| WO # | Work order number |
| Asset | Asset being maintained |
| Type | EMERGENCY / CORRECTIVE / PREVENTIVE |
| Priority | CRITICAL / HIGH / MEDIUM / LOW |
| Status | OPEN / IN_PROGRESS / COMPLETED / CANCELLED |
| Created / Due | Timeline |
| Assigned To | Technician or team |

!!! danger "Emergency work orders"
    EMERGENCY type work orders represent active failures or safety hazards. These should be dispatched within 2 hours of creation.

### PM Compliance
Preventive Maintenance plan completion rates:

- PM schedule: MONTHLY / QUARTERLY / SEMI_ANNUAL / ANNUAL
- Completion status: COMPLETED / OVERDUE / UPCOMING
- Compliance % by asset category and department
- Overdue PMs are highlighted in red

### Failure Analysis
Historical failure event log:

- Failure mode, affected asset, downtime hours, repair cost, root cause category
- Trend analysis: failures by month and by category
- MTBF (Mean Time Between Failures) calculation per asset class

---

## Sierra AI Examples

- *"Which assets have a critical condition rating?"*
- *"How many emergency work orders are open right now?"*
- *"What is our PM compliance rate by department?"*
- *"Which asset category has the most failures this year?"*
- *"Show me total maintenance cost by department."*
