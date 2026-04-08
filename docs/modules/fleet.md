# Fleet Management

Monitor vehicle health, fuel consumption, inspection compliance, and fleet operating cost by department.

## Overview

Connects to `I_Vehicle`, `I_FuelTransaction`, and `I_VehicleInspection`.

---

## Tabs

### Dashboard
- Total vehicles, active %, out-of-service count, overdue inspections, total fuel cost YTD, average MPG
- Vehicle status distribution (ACTIVE / MAINTENANCE / OUT_OF_SERVICE)
- Fleet cost by department (bar chart)

### Vehicle Register
Full fleet inventory:

| Column | Description |
|---|---|
| Vehicle ID | Asset tag or plate number |
| Make / Model / Year | Vehicle identification |
| Type | SEDAN / SUV / TRUCK / UTILITY / HEAVY_EQUIPMENT |
| Department | Assigned department |
| Status | ACTIVE / MAINTENANCE / OUT_OF_SERVICE |
| Mileage | Current odometer reading |
| Condition Score | 1 (Poor) – 5 (Excellent) |
| Last Service | Date of last maintenance |

!!! warning "Out-of-service vehicles"
    OUT_OF_SERVICE vehicles are unavailable for departmental use. If a department's fleet OOS rate exceeds 15%, service delivery may be impacted.

### Fuel Consumption
Fuel usage records by vehicle and department:

| Column | Description |
|---|---|
| Vehicle | Fleet ID |
| Fuel Type | GASOLINE / DIESEL / ELECTRIC |
| Gallons / kWh | Quantity consumed |
| Cost | Transaction cost |
| MPG / MPGe | Efficiency |
| Date | Transaction date |
| Department | Charged department |

Department-level fuel cost chart identifies highest-consuming departments.

### Inspection Compliance
Vehicle inspection schedule and compliance:

- Inspection type: ANNUAL_SAFETY / EMISSIONS / DOT / PREVENTIVE
- Status: CURRENT / DUE_SOON / OVERDUE
- OVERDUE inspections are flagged in red — vehicles with overdue safety inspections should be removed from service

### Fleet Cost by Department
Summary of total fleet operating costs (fuel + maintenance + depreciation) by department for budget analysis.

---

## Sierra AI Examples

- *"Which vehicles are out of service right now?"*
- *"Which vehicles have overdue inspections?"*
- *"What is fleet fuel consumption and cost by department this year?"*
- *"Which vehicle types have the best MPG efficiency?"*
- *"What is total fleet operating cost vs budget?"*
