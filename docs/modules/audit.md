# Audit Readiness

Track audit findings by severity, monitor evidence completeness, and prepare Single Audit packages.

## Overview

Connects to `I_AuditFinding` in SAP HANA Cloud. Designed to support both internal audit and external Single Audit (A-133/Uniform Guidance) requirements.

---

## Tabs

### Finding Summary
KPIs and distribution of all audit findings:

- Total findings, open findings, resolved findings, material findings, significant findings
- Severity distribution pie chart (MATERIAL / SIGNIFICANT / MINOR)
- Finding age distribution (how long findings have been open)

### Finding Register
Full audit finding log:

| Column | Description |
|---|---|
| Finding # | Unique finding identifier |
| Grant | Associated grant (if federal) |
| Type | COMPLIANCE / INTERNAL_CONTROL / QUESTIONED_COST |
| Severity | MATERIAL / SIGNIFICANT / MINOR |
| Description | Finding narrative |
| Management Response | Agreed corrective action |
| Due Date | Remediation deadline |
| Status | OPEN / IN_PROGRESS / RESOLVED / REPEAT |

!!! danger "Material findings"
    Material findings in federal programs must be reported in the Schedule of Findings and Questioned Costs (SФQС). Repeat material findings can trigger heightened scrutiny and additional audit procedures.

### Evidence Completeness
Document and evidence checklist by grant:

- Required documents: Audit trail, grant agreement, SF-269/SF-425, effort certifications, subrecipient monitoring
- Completeness % per grant
- Missing items highlighted in red

### Export Package
Generate a ready-to-submit Single Audit package:

- Exports all findings in standardized format
- Includes management response and corrective action plan
- Compatible with Federal Audit Clearinghouse (FAC) submission

---

## Sierra AI Examples

- *"How many open audit findings do we have and what is their severity?"*
- *"Which grants have material findings?"*
- *"What is the evidence completeness rate by grant?"*
- *"Are any corrective actions past their due date?"*
