# Outcome Metrics

Measure program effectiveness, cost-per-outcome, and grant–outcome linkage across all public programs.

## Overview

Connects to `I_OutcomeMetric` and `I_OutcomeActual` in SAP HANA Cloud.

---

## Tabs

### Dashboard
- Total metrics, on-track count, at-risk count, off-track count, average effectiveness score
- Effectiveness score distribution (bar chart per program)
- On-track vs at-risk vs off-track pie chart

### Program Effectiveness
Effectiveness scores (0–100) per program:

| Column | Description |
|---|---|
| Program | Program name |
| Effectiveness Score | 0–100 composite |
| On-Track Metrics | Count of metrics meeting or exceeding target |
| At-Risk Metrics | Count of metrics near but below target |
| Off-Track Metrics | Count of metrics significantly below target |
| Cost per Unit | Actual cost per outcome unit |
| Peer Average | Benchmark from comparable jurisdictions |
| Efficiency | Peer Avg ÷ Actual (>1 = more efficient than peers) |

### Metric Trend
Time-series performance for all outcome metrics across fiscal periods:

- Select a program or metric to see its trend line
- Compare actuals vs targets over time
- Identify improving vs declining programs

### Cost-Effectiveness
Cost per outcome unit vs peer benchmark:

- Programs below peer average cost are highlighted as EFFICIENT
- Programs significantly above peer cost are flagged for review

### Grant Linkage
Maps outcome metrics to their funding grants:

- Which grants fund which programs
- Whether grant-funded programs are meeting their performance targets
- Required for federal performance reporting (e.g., GPRA, SAM.gov)

---

## Sierra AI Examples

- *"Which programs are most cost-effective compared to peer benchmarks?"*
- *"Show me outcome trend data for all programs over time."*
- *"Which grant-funded programs are not meeting their performance targets?"*
- *"What is the cost per outcome unit by program?"*
