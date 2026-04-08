# Sierra SLED Enterprise Intelligence Platform

**Sierra SLED** is a full public-sector operating intelligence platform connecting real-time SAP HANA Cloud data to an intuitive web interface. It covers the complete SLED (State, Local, Education, Defense) operating model across **14 modules**, **4 AI agents**, and a **citizen-facing public transparency portal**.

---

## Live Platform

| | |
|---|---|
| **Application URL** | [public-sector-reporting.azurewebsites.net](https://public-sector-reporting.azurewebsites.net) |
| **Public Transparency Portal** | [/transparency](https://public-sector-reporting.azurewebsites.net/transparency) |
| **GitHub Repository** | [sriman2709/sierra-reporting-platform](https://github.com/sriman2709/sierra-reporting-platform) |
| **Database** | SAP HANA Cloud via Datasphere · Schema `PUBLIC_SECTOR` |

---

## What's In The Platform

=== "Financial Management"
    | Module | What it does |
    |---|---|
    | [Grants Management](modules/grants.md) | Grant lifecycle, compliance posture, burn rate, subrecipient risk |
    | [Fund Accounting](modules/funds.md) | Available-to-spend, encumbrances, GASB-54 fund classifications |
    | [Finance Controller](modules/finance.md) | Budget vs actuals by department, period close readiness |
    | [Procurement & AP](modules/procurement.md) | Contracts, AP aging, vendor risk, debarment monitoring |
    | [Treasury & Revenue](modules/treasury.md) | Cash position, investments, debt service, tax revenue |
    | [Financial Forecast](modules/forecast.md) | What-if scenarios, sensitivity analysis, variance dashboard |

=== "Program & Compliance"
    | Module | What it does |
    |---|---|
    | [Subaward & Compliance](modules/subawards.md) | Subrecipient monitoring, corrective actions, CFR Part 200 |
    | [Outcome Metrics](modules/outcomes.md) | Program effectiveness, cost-per-outcome, grant–outcome linkage |
    | [Audit Readiness](modules/audit.md) | Single Audit findings, evidence completeness, export package |

=== "Enterprise Operations"
    | Module | What it does |
    |---|---|
    | [Capital Projects & CIP](modules/capital-projects.md) | Project health, milestones, change orders, CIP funding |
    | [Assets & Maintenance](modules/assets.md) | Asset condition, work orders, PM compliance, failure analysis |
    | [Inventory & Warehouse](modules/inventory.md) | Stock levels, alerts, reorder needs, warehouse turnover |

=== "Workforce & Fleet"
    | Module | What it does |
    |---|---|
    | [HR & Workforce](modules/hr.md) | Headcount, position control, vacancy rate, payroll by fund |
    | [Fleet Management](modules/fleet.md) | Vehicle health, fuel, inspections, fleet cost by department |

---

## Sierra AI Capabilities

| Capability | Description |
|---|---|
| [Sierra Intelligence](ai/sierra-intelligence.md) | Conversational AI analyst with live access to all 14 modules simultaneously. Ask any question in plain English. |
| [Agent Hub](ai/agent-hub.md) | 4 autonomous agents that pre-fetch domain data and produce structured risk reports with prioritized action lists. |

---

## Phase Completion Status

```
Phase 1 · Core Modules         ✅  Grants, Funds, Subawards, Outcomes, Audit, Forecast
Phase 2 · Enterprise Expansion ✅  Procurement, Finance, Capital Projects, Assets, Inventory
Phase 3 · Workforce & Fleet    ✅  HR & Workforce, Fleet Management
Phase 4 · Treasury & Executive ✅  Treasury & Revenue, Executive Command Center
Phase 5 · Public Transparency  ✅  Citizen-facing portal at /transparency (no login required)
Phase 6 · Agentic AI           ✅  4 autonomous domain agents + Agent Hub
```

---

## Quick Start

1. Navigate to [public-sector-reporting.azurewebsites.net](https://public-sector-reporting.azurewebsites.net)
2. Log in with your credentials (see [Getting Started](getting-started.md))
3. Use the sidebar to navigate to any module
4. Or ask [Sierra Intelligence](ai/sierra-intelligence.md) a question in plain English

!!! tip "No login required for the public portal"
    Citizens and stakeholders can access spending transparency data at [/transparency](https://public-sector-reporting.azurewebsites.net/transparency) without creating an account.
