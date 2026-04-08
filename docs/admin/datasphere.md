# Datasphere & HANA Cloud Guide

This guide is for the Datasphere / HANA team (Kavi and team) covering what has been built in the application layer and what work remains in Datasphere.

---

## Connection Details

| Parameter | Value |
|---|---|
| **Datasphere Tenant** | `sierradigitalinc.us10.hcs.cloud.sap` |
| **Space** | `PUBLIC_SECTOR` |
| **Schema** | `PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER` |
| **Driver** | `hdb` (Node.js) |
| **Port** | 443 (HTTPS encrypted) |

The application connects to HANA Cloud **directly** using the `hdb` Node.js driver — not via OData or the Datasphere public API.

---

## Tables Seeded by the Application

All tables follow the `I_*` naming convention (interface/fact tables). These were created by seed scripts and are the source of truth for the application.

### Phase 1–3 Tables

| Table | Description | Key Columns |
|---|---|---|
| `I_GrantMaster` | Grant awards | grant_number, award_status, total_award_amount, grantor_agency, expiry_date |
| `I_Fund` | Fund accounting | fund_name, fund_type, fiscal_year (varchar '2024'), balance, budget, expenditures_ytd |
| `I_BudgetLine` | Budget by dept/fund | fiscal_year (varchar 'FY2026'), department, revised_budget, actuals |
| `I_SubawardRecipient` | Subrecipient monitoring | org_name, risk_rating, findings_count |
| `I_OutcomeMetric` | Program metrics | program_name, metric_name, target_value |
| `I_OutcomeActual` | Actuals per metric | fiscal_period, actual_value |
| `I_AuditFinding` | Audit findings | finding_number, severity, status, grant_number |
| `I_PurchaseOrder` | Purchase orders | po_number, vendor_id, amount, status |
| `I_Invoice` | AP invoices | invoice_number, amount, invoice_status, due_date |
| `I_Vendor` | Vendor master | vendor_name, risk_score, debarment_status |
| `I_Contract` | Contracts | contract_number, contract_type, total_value, end_date |
| `I_CapitalProject` | CIP projects | project_name, total_budget, spent_to_date, project_status |
| `I_ProjectMilestone` | Project milestones | milestone_name, status, due_date |
| `I_ChangeOrder` | Change orders | co_number, amount, reason, status |
| `I_Asset` | Asset register | asset_name, category, condition_rating, status |
| `I_WorkOrder` | Maintenance WOs | wo_type, priority, status, asset_id |
| `I_PMPlan` | PM schedules | frequency, status, next_due_date |
| `I_FailureEvent` | Asset failures | failure_mode, downtime_hours, repair_cost |
| `I_InventoryItem` | Stock items | item_code, current_stock, reorder_point, status |
| `I_StockTransaction` | Stock movements | transaction_type, quantity, reference |
| `I_Warehouse` | Warehouse locations | warehouse_name, utilization_pct |
| `I_Employee` | Employee roster | emp_status, department, annual_salary |
| `I_Position` | Position control | budgeted_fte, filled_fte, department |
| `I_PayrollAllocation` | Payroll by fund | fund_id, amount, fte_count |
| `I_Vehicle` | Fleet vehicles | vehicle_type, status, mileage, condition_score |
| `I_FuelTransaction` | Fuel usage | fuel_type, gallons, cost, vehicle_id |
| `I_VehicleInspection` | Inspections | inspection_type, status, due_date |
| `I_CostCenter` | Cost centers | cost_center_name, department |
| `I_Document` | Financial documents | document_type, fiscal_year, amount |

### Phase 4 Tables (Treasury & Executive)

| Table | Description | Key Columns |
|---|---|---|
| `I_CashAccount` | Bank/investment accounts | account_type, balance, institution |
| `I_Investment` | Investment portfolio | investment_type, face_value, maturity_date |
| `I_DebtService` | Debt obligations | debt_type, principal_balance, next_payment_date, next_payment_amount |
| `I_TaxRevenue` | Tax collections | tax_type, fiscal_year (INTEGER), fiscal_month, amount_collected, amount_budgeted |
| `I_ExecutiveAlert` | Cross-domain alerts | domain, severity, title, status |
| `I_KPIBenchmark` | KPI benchmarks | domain, kpi_name, current_value, target_value, peer_avg |

---

## Critical Column Name Notes

!!! danger "Case-sensitive column names"
    HANA column names are double-quoted and case-sensitive. Using the wrong casing causes `invalid column name` errors.

| Table | Correct Column | NOT This |
|---|---|---|
| `I_BudgetLine` | `fiscal_year` = `'FY2026'` (varchar) | `YEAR(CURRENT_DATE)` |
| `I_TaxRevenue` | `fiscal_year` = integer | `'FY2026'` |
| `I_Fund` | `fiscal_year` = `'2024'` (plain string) | `'FY2024'` |
| `I_GrantMaster` | `award_status` | `grant_status` |
| `I_Invoice` | `amount` + `invoice_status` | `invoice_amount` / `payment_status` |
| `I_CapitalProject` | `spent_to_date` | `actual_cost` |
| `I_Employee` | `emp_status != 'TERMINATED'` | `employment_status = 'ACTIVE'` |
| `I_InventoryItem` | `current_stock` | `quantity_on_hand` |
| `I_BudgetLine` | `actuals` / `revised_budget` | `actual_amount` / `budget_amount` |
| `I_BudgetLine` | GROUP BY `department` | `cost_center` |

---

## Work Remaining in Datasphere (Kavi Team Tasks)

### 1. Create Analytical Dataset Views (`V_*`)
Build views on top of `I_*` tables optimized for BI consumption:

```sql
-- Example: V_GrantPortfolio
CREATE VIEW "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."V_GrantPortfolio" AS
SELECT
  g."grant_number",
  g."grant_name",
  g."total_award_amount",
  g."amount_drawn",
  g."award_status",
  g."expiry_date",
  DAYS_BETWEEN(CURRENT_DATE, g."expiry_date") AS days_to_expiry,
  (g."amount_drawn" / NULLIF(g."total_award_amount", 0)) * 100 AS burn_pct
FROM "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_GrantMaster" g;
```

Priority views needed:
- `V_GrantPortfolio` — grants with calculated burn rate and days to expiry
- `V_FundAvailability` — funds with available-to-spend calculation
- `V_BudgetVariance` — department-level budget vs actuals with variance %
- `V_AssetHealth` — assets with condition scores and work order counts
- `V_FleetStatus` — vehicles with inspection compliance and OOS counts
- `V_InventoryAlerts` — items below reorder point
- `V_ExecutiveDashboard` — cross-domain KPI rollup view

### 2. Add Calculated Columns
Computed fields that support BI stories:

- `I_GrantMaster`: `burn_rate_pct`, `days_to_expiry`, `compliance_risk_tier`
- `I_Investment`: `days_to_maturity` (using `DAYS_BETWEEN`)
- `I_DebtService`: `days_to_next_payment`
- `I_CapitalProject`: `budget_utilization_pct`, `schedule_variance_days`
- `I_Asset`: `age_years`, `maintenance_cost_ytd`

### 3. Datasphere Analytic Model for SAC
Create an Analytic Model in Datasphere pointing to the `V_*` views, enabling SAP Analytics Cloud (SAC) story consumption:

- Connect SAC to Datasphere via Live Connection
- Build SAC stories for: Executive Overview, Grants Dashboard, Capital Projects, Fleet Dashboard
- Enable drill-through from SAC to this application for transaction detail

### 4. Data Access Controls (DAC)
Implement row-level security in Datasphere:

- Department-based filtering (user only sees their department's data)
- Fund-type restrictions (enterprise users can only see enterprise funds)
- Grant-based access (grants manager only sees their assigned grants)

### 5. Scheduled Data Refresh
If any source data is replicated rather than live:

- Configure Datasphere replication flows from source systems
- Set refresh cadence (real-time / hourly / nightly)
- Monitor replication health via Datasphere monitoring dashboard

### 6. Datasphere Space Expansion
Additional tables to add to the PUBLIC_SECTOR space if needed:

- Payroll system integration (for more granular payroll data)
- Budget system integration (for multi-year budget planning data)
- Fixed asset system (for depreciation schedules)
- 311 service request data (for outcome metrics integration)

---

## Testing Datasphere Changes

After making Datasphere changes, test via the application's regression scripts:

```bash
BASE_URL=https://public-sector-reporting.azurewebsites.net \
  bash scripts/regression_phase5.sh
```

Or call specific endpoints directly:
```bash
curl -H "Authorization: Bearer <token>" \
  https://public-sector-reporting.azurewebsites.net/api/grants/kpis
```

Any HANA column errors will surface as `{"error": "invalid column name: X"}` in the API response.
