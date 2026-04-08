# HR & Workforce

Monitor headcount, position control, vacancy rates, payroll allocation by fund, and workforce turnover.

## Overview

Connects to `I_Employee`, `I_Position`, `I_PayrollAllocation`, and related tables.

---

## Tabs

### Dashboard
- Active employees, total FTE, vacancy rate, grant-funded FTEs, total payroll YTD, turnover rate
- Headcount by department (bar chart)
- Employment status distribution (ACTIVE / ON_LEAVE / TERMINATED)

### Employee Roster
Full employee register:

| Column | Description |
|---|---|
| Employee ID / Name | Staff identifier |
| Department | Assigned department |
| Position Title | Job classification |
| Employment Type | FULL_TIME / PART_TIME / CONTRACT |
| Status | ACTIVE / ON_LEAVE / TERMINATED |
| Hire Date | Date of hire |
| Annual Salary | Base compensation |
| Grant Funded | Whether salary is charged to a grant |

### Position Control
Budgeted position roster vs filled positions:

| Column | Description |
|---|---|
| Position Title | Classification |
| Budgeted FTE | Authorized full-time equivalents |
| Filled FTE | Currently filled |
| Vacant FTE | Gap (Budgeted − Filled) |
| Vacancy Rate % | Vacant ÷ Budgeted × 100 |
| Department | Owning department |

!!! note "Position control"
    Vacancy rates above 15% in critical departments may indicate service delivery risk. Positions funded by grants must be filled to maintain drawdown rates.

### Payroll Fund Allocation
How payroll costs are distributed across funds:

- Shows split of salary costs: General Fund / Grant Funds / Enterprise Funds / Special Revenue
- Identifies grant-funded FTE count and total grant payroll cost
- Critical for grant reporting: payroll charged to grants must align with position effort certifications

### Workforce Summary
Department-level workforce analytics:

- Average salary by department
- Turnover rate (separations ÷ average headcount × 100)
- Tenure distribution
- Gender and classification mix

---

## Sierra AI Examples

- *"What is our current vacancy rate and how many positions are unfilled?"*
- *"Show me payroll cost allocation by fund."*
- *"Which departments have the highest turnover rates?"*
- *"How many FTEs are grant-funded and which grants are they charged to?"*
- *"What is the total payroll cost by department for this fiscal year?"*
