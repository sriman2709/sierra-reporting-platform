# Executive Command Center

Cross-domain KPIs, risk alerts, KPI benchmarks, and budget vs actuals — all in one view for senior leadership.

## Overview

The Executive Command Center aggregates key indicators from all 14 modules into a single executive dashboard. It pulls from `I_ExecutiveAlert`, `I_KPIBenchmark`, and cross-domain KPI queries.

---

## Tabs

### Command Center
The main situational awareness view:

- **Domain Tiles** — One tile per operational domain (Finance, Grants, Procurement, Operations, HR, Fleet) showing live status with alert count badges
- **Cross-domain KPIs** — Active grants, total cash, budget utilization %, open high alerts, active employees, active capital projects
- Domains with open HIGH alerts are highlighted in red

### Risk & Alerts
All active alerts across all domains in one consolidated view:

| Column | Description |
|---|---|
| Domain | Which module generated the alert |
| Severity | HIGH / MEDIUM / LOW |
| Title | Short alert description |
| Detail | Full alert context |
| Assigned To | Responsible party |
| Status | OPEN / ACKNOWLEDGED / RESOLVED |

!!! tip "Alert triage"
    HIGH alerts require same-day executive awareness. Use the Risk & Alerts tab as your daily morning briefing view. Acknowledge alerts once reviewed to track that they have been seen.

### KPI Benchmarks
Performance against internal targets and peer-jurisdiction averages:

| Column | Description |
|---|---|
| Domain | Source module |
| KPI | Metric name |
| Current | Actual current value |
| Target | Internal goal |
| Peer Avg | Benchmark from comparable organizations |
| Trend | Improving ↑ / Stable → / Declining ↓ |
| Progress Bar | Visual current vs target |

### Budget vs Actual
Consolidated budget performance across all departments and funds:

- Departments sorted by variance (most unfavorable first)
- Filters by fund type (General / Special Revenue / Capital / Enterprise)

---

## Sierra AI Examples

- *"What are our biggest risks across all domains this week?"*
- *"Show me which KPIs are below target vs peer benchmarks."*
- *"Which departments are most over budget?"*
- *"Summarize the executive situational report for today."*
