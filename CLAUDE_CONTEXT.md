# Sierra SLED Enterprise Intelligence Platform — Claude Context & Memory

> **Last updated:** April 7, 2026
> **Status:** All 6 phases complete and live
> **Purpose:** Continuity document for Claude sessions — read this first when resuming work

---

## 1. Platform Overview

**Sierra SLED** is a full public-sector operating intelligence platform connecting React/Node.js to SAP HANA Cloud via Datasphere. It covers the complete SLED (State, Local, Education, Defense) operating model across 6 phases and 14 domains.

- **Live URL:** `https://public-sector-reporting.azurewebsites.net`
- **GitHub:** `https://github.com/sriman2709/sierra-reporting-platform`
- **Local path:** `/Users/srimannarayanan/projects/sierra-reporting-platform`
- **Azure resource group:** `grants-management-rg`
- **Azure app name:** `public-sector-reporting`

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, React Router v6, Recharts |
| Backend | Node.js 18 ESM, Express 4 |
| Database | SAP HANA Cloud via Datasphere (`hdb` driver) |
| AI | OpenAI API (`gpt-4o-mini`) — referred to as "Sierra AI" in the UI |
| Auth | JWT (HS256), RBAC via `server/middleware/auth.js` |
| Hosting | Azure App Service (Central US) — `grants-management-rg` |
| CI/CD | GitHub Actions + manual `az webapp deploy` lean-zip |
| Datasphere | Tenant: `sierradigitalinc.us10.hcs.cloud.sap`, Space: `PUBLIC_SECTOR` |

---

## 3. HANA Connection Details

```js
// server/connectors/hana.js
// Schema constant:
export const SCHEMA = 'PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER';
// All tables: I_* prefix (interface/fact tables)
// All views:  V_* prefix
// Column names: double-quoted, lowercase with underscores — case-sensitive
```

**Connection env vars** (set in Azure App Settings):
- `HANA_HOST`, `HANA_PORT`, `HANA_USER`, `HANA_PASSWORD`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `SEED_SECRET` = `sierra-phase4-seed-446357eb76ed22e8`

**HANA IP restriction:** The HANA Cloud instance only allows specific IPs. Local machine cannot connect directly. Seeding is done via the protected `POST /api/treasury/seed` endpoint (called from Azure after deployment).

---

## 4. HANA Tables (seeded)

All created via `server/modules/treasury/treasury.seed.js` (POST `/api/treasury/seed`):

| Table | Key Columns |
|---|---|
| `I_CashAccount` | account_name, account_type, balance, institution |
| `I_Investment` | investment_name, investment_type, face_value, maturity_date |
| `I_DebtService` | debt_name, debt_type, principal_balance, next_payment_date, next_payment_amount |
| `I_TaxRevenue` | tax_type, fiscal_year (INTEGER), fiscal_month, amount_collected, amount_budgeted, period_label |
| `I_ExecutiveAlert` | alert_id, domain, severity (HIGH/MEDIUM/LOW), title, description, status, assigned_to |
| `I_KPIBenchmark` | benchmark_id, domain, kpi_name, current_value, target_value, peer_avg, unit, trend, period |

**Earlier tables** (from Phases 1–3 seeds):
`I_GrantMaster`, `I_Fund`, `I_SubawardRecipient`, `I_OutcomeMetric`, `I_OutcomeActual`, `I_AuditFinding`, `I_BudgetLine`, `I_PurchaseOrder`, `I_Invoice`, `I_Vendor`, `I_CapitalProject`, `I_ProjectMilestone`, `I_ChangeOrder`, `I_Asset`, `I_WorkOrder`, `I_PMPlan`, `I_FailureEvent`, `I_InventoryItem`, `I_StockTransaction`, `I_Warehouse`, `I_Employee`, `I_Position`, `I_PayrollAllocation`, `I_Vehicle`, `I_FuelTransaction`, `I_VehicleInspection`, `I_CostCenter`, `I_Document`, `I_Contract`

**Key column name quirks (HANA is case-sensitive):**
- `I_BudgetLine`: fiscal_year stored as `'FY2026'` (varchar) — use `CONCAT('FY', TO_VARCHAR(YEAR(CURRENT_DATE)))`
- `I_TaxRevenue`: fiscal_year stored as integer — use `YEAR(CURRENT_DATE)`
- `I_Fund`: fiscal_year stored as plain `'2024'` string — use `MAX("fiscal_year")`
- `I_GrantMaster`: use `award_status` (not `grant_status`)
- `I_Invoice`: use `amount` + `invoice_status` (not `invoice_amount` / `payment_status`)
- `I_CapitalProject`: use `spent_to_date` (not `actual_cost`)
- `I_Employee`: use `emp_status != 'TERMINATED'` (not `employment_status = 'ACTIVE'`)
- `I_InventoryItem`: use `current_stock` (not `quantity_on_hand`)
- `I_BudgetLine`: use `actuals` / `revised_budget` (not `actual_amount` / `budget_amount`)
- `I_BudgetLine`: group by `department` (not `cost_center`)

---

## 5. Module Architecture Pattern

Every domain module follows the same 3-file pattern:

```
server/modules/<domain>/
  <domain>.routes.js    — Express routes, uses authenticate + authorize('<domain>')
  <domain>.service.js   — Calls query() from hana.js
  <domain>.queries.js   — HANA SQL strings using SCHEMA constant
```

**Auth middleware** (`server/middleware/auth.js`):
```js
const ROLES = {
  finance_analyst: ['grants','funds','forecast','audit','procurement','finance','capital','assets','inventory','hr','fleet','treasury'],
  grants_manager:  ['grants','subawards','audit','procurement'],
  program_manager: ['outcomes','grants'],
  executive:       ['grants','funds','subawards','outcomes','audit','forecast','procurement','finance','capital','assets','inventory','hr','fleet','treasury','executive'],
  auditor:         ['audit','grants','subawards','procurement','finance','capital','assets','inventory','hr','fleet'],
  public_user:     ['grants'],
};
```

**Test credentials:** username: `admin`, password: `Admin@123`

---

## 6. All Phases — Complete Status

### Phase 1 · Core Modules ✅ LIVE
| Module | Route | Frontend Page |
|---|---|---|
| Grants Management | `/api/grants` | `Grants.jsx` |
| Fund Accounting | `/api/funds` | `Funds.jsx` |
| Subaward & Compliance | `/api/subawards` | `Subawards.jsx` |
| Outcome Metrics | `/api/outcomes` | `Outcomes.jsx` |
| Audit Readiness | `/api/audit` | `Audit.jsx` |
| Financial Forecast | `/api/forecast` | `Forecast.jsx` |

### Phase 2 · Enterprise Expansion ✅ LIVE
| Module | Route | Frontend Page |
|---|---|---|
| Procurement & AP | `/api/procurement` | `Procurement.jsx` |
| Finance Controller | `/api/finance` | `Finance.jsx` |
| Capital Projects & CIP | `/api/capital` | `CapitalProjects.jsx` |
| Assets & Maintenance | `/api/assets` | `Assets.jsx` |
| Inventory & Warehouse | `/api/inventory` | `Inventory.jsx` |

### Phase 3 · Workforce & Fleet ✅ LIVE
| Module | Route | Frontend Page |
|---|---|---|
| HR & Workforce | `/api/hr` | `HR.jsx` |
| Fleet Management | `/api/fleet` | `Fleet.jsx` |

### Phase 4 · Treasury & Executive ✅ LIVE
| Module | Route | Frontend Page |
|---|---|---|
| Treasury & Revenue | `/api/treasury` | `Treasury.jsx` |
| Executive Command Center | `/api/executive` | `ExecutiveCenter.jsx` |
| Seed endpoint | `POST /api/treasury/seed` | — |

Seed is protected by `x-seed-secret: sierra-phase4-seed-446357eb76ed22e8` header.

### Phase 5 · Public Transparency Portal ✅ LIVE
- **No authentication required** — public citizen-facing portal
- Route prefix: `/api/public/*`
- Frontend: `Transparency.jsx` — standalone layout (no AppShell)
- Public URL: `https://public-sector-reporting.azurewebsites.net/transparency`

| Endpoint | Data |
|---|---|
| `GET /api/public/kpis` | 8 headline citizen KPIs |
| `GET /api/public/grants` | Active/expiring/closed grants |
| `GET /api/public/spending` | Spending by fund |
| `GET /api/public/cafr` | CAFR summary by fund type |
| `GET /api/public/tax` | Tax revenue vs budget |
| `GET /api/public/tax-trend` | Monthly tax trend |
| `GET /api/public/outcomes` | Public program outcomes |
| `GET /api/public/grants-by-agency` | Grants by funding agency |
| `GET /api/public/contracts` | Active contracts |

### Phase 6 · Agentic AI ✅ LIVE
- **4 autonomous agents** — pre-fetch all domain data in parallel, single Sierra AI synthesis call
- Frontend: `AgentHub.jsx`
- Route prefix: `/api/agents/*`

| Agent | Endpoint | Data Sources |
|---|---|---|
| Grants Intelligence | `POST /api/agents/grants/run` | 9 grants/funds/outcomes sources |
| Procurement Intelligence | `POST /api/agents/procurement/run` | 9 procurement/finance/inventory sources |
| Operations Intelligence | `POST /api/agents/operations/run` | 16 assets/fleet/capital/inventory sources |
| Executive AI Briefing | `POST /api/agents/executive/run` | 24 cross-domain sources |

**AgentReport schema:**
```json
{
  "agent": "grants",
  "agent_name": "Grants Intelligence Agent",
  "run_at": "ISO timestamp",
  "elapsed_ms": 19000,
  "summary": "...",
  "risk_level": "HIGH|MEDIUM|LOW",
  "headline_metrics": [{ "label": "...", "value": "...", "status": "ok|warn|alert" }],
  "risks": [{ "severity": "HIGH|MEDIUM|LOW", "title": "...", "detail": "...", "domain": "..." }],
  "actions": [{ "priority": 1, "action": "...", "rationale": "...", "deadline": "Immediate|This Week|This Month|This Quarter" }],
  "sections": [{ "title": "...", "content": "..." }]
}
```

**Catalog:** `GET /api/agents/catalog` — returns all 4 agent metadata (no run triggered)

---

## 7. Sierra Intelligence AI Chat

- **Route:** `POST /api/ai/query`
- **Frontend:** `AIChat.jsx`
- **Model:** `gpt-4o-mini` (referred to as "Sierra AI" — no OpenAI/GPT branding in UI)
- **46 tools** defined in `server/modules/ai/ai.tools.js`
- **TOOL_EXECUTORS** map tool names → direct service method calls (no HTTP)
- Flow: question → Sierra AI picks tools → parallel execution → Sierra AI synthesises → `{ answer, chart }`
- Response format: `{ answer: string, chart: { type, title, data, xKey, yKeys } }`

---

## 8. Frontend Structure

```
client/src/
  App.jsx          — Router, RequireAuth wrapper, PAGE_TITLES
  AppShell.jsx     — Sidebar nav (NAV array), top bar, Outlet
  auth.js          — JWT helpers: login(), logout(), getUser(), isLoggedIn()
  pages/
    Login.jsx
    Dashboard.jsx
    Grants.jsx / Funds.jsx / Subawards.jsx / Outcomes.jsx / Audit.jsx / Forecast.jsx
    Procurement.jsx / Finance.jsx / CapitalProjects.jsx / Assets.jsx
    Inventory.jsx / HR.jsx / Fleet.jsx
    Treasury.jsx / ExecutiveCenter.jsx
    Transparency.jsx     ← PUBLIC, no auth, no AppShell
    AgentHub.jsx         ← Phase 6 agents
    AIChat.jsx           ← Sierra Intelligence chat
    Roadmap.jsx          ← All phases marked LIVE
    SACGuide.jsx
```

**Route configuration (App.jsx):**
- `/transparency` is OUTSIDE `<RequireAuth>` — public route
- All other app routes are inside `<RequireAuth>` which checks `isLoggedIn()` and redirects to `/login`

---

## 9. Deployment Procedure

**Lean-zip deploy (preferred — fast, ~330KB):**
```bash
# Build frontend
cd client && PATH="/opt/homebrew/Cellar/node/25.8.1_1/bin:$PATH" npm run build

# Create lean zip (no node_modules)
cd /Users/srimannarayanan/projects/sierra-reporting-platform
zip -r /tmp/sierra-deploy.zip server client/dist package.json package-lock.json \
  -x "*/node_modules/*" -q

# Deploy to Azure
PATH="/opt/homebrew/bin:$PATH" az webapp deploy \
  --resource-group grants-management-rg \
  --name public-sector-reporting \
  --src-path /tmp/sierra-deploy.zip \
  --type zip --async false
```

**npm path on this machine:** `/opt/homebrew/Cellar/node/25.8.1_1/bin`
**az CLI path on this machine:** `/opt/homebrew/bin/az`

**GitHub push:**
```bash
git add <files>
git commit -m "Sprint N: description"
git push origin main
```

---

## 10. Regression Scripts

| Script | What it tests |
|---|---|
| `scripts/regression_phase4.sh` | 24 tests — treasury + executive endpoints |
| `scripts/regression_phase5.sh` | 21 tests — public endpoints (no auth), protected routes still 401 |
| `scripts/regression_phase6.sh` | Agent catalog, auth-gating, live agent runs, report structure |

**Run against prod:**
```bash
BASE_URL=https://public-sector-reporting.azurewebsites.net bash scripts/regression_phase5.sh
```

---

## 11. Known Issues & Decisions

- **HANA IPv6 restriction:** Local machine (IPv6) cannot connect to HANA Cloud directly. Seeding is done via the protected HTTP seed endpoint called from Azure.
- **gpt-4o-mini used throughout:** The org's `gpt-4o` TPM limit is 30k. `gpt-4o-mini` has 200k TPM. All AI calls use `gpt-4o-mini`. Referred to as "Sierra AI" in the UI — no OpenAI/GPT branding anywhere.
- **Data trimming:** `trimForAI()` in `agents.service.js` limits all arrays to 12 rows before sending to Sierra AI to keep prompts under the token limit.
- **Shell PATH issue:** The test shell environment doesn't have npm/az in PATH by default — always use full paths.
- **BudgetLine fiscal_year:** Stored as `'FY2026'` (varchar). Use `CONCAT('FY', TO_VARCHAR(YEAR(CURRENT_DATE)))`. Do NOT use `YEAR(CURRENT_DATE)` directly.

---

## 12. Datasphere / HANA Handoff for Kavi Team

Work remaining in Datasphere (not yet done):
1. Create Analytical Dataset views (`V_*`) on top of `I_*` tables for BI consumption
2. Add calculated columns (e.g., burn rate %, compliance score, days-to-maturity)
3. Create a unified `V_ExecutiveDashboard` cross-domain view
4. Enable Datasphere Data Access Controls (DAC) for row-level security by department/fund
5. Configure Datasphere Analytic Model for SAC (SAP Analytics Cloud) story consumption
6. Set up scheduled data refresh jobs for any replicated sources
7. Add remaining transactional tables to the Datasphere Space if needed for additional reporting

Connection details for Datasphere team:
- Tenant: `sierradigitalinc.us10.hcs.cloud.sap`
- Space: `PUBLIC_SECTOR`
- Schema: `PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER`

---

## 13. Git Commit History (Phase 4 onwards)

```
cccc386  Fix: switch to gpt-4o-mini + trim data + remove AI branding references
806a5f9  Sprint 19: Phase 6 — Agentic AI (4 agents + Agent Hub)
2821d9b  Sprint 18: Phase 5 — Public Transparency Portal
3ba49d2  Fix Phase 4 executive KPIs — remaining HANA column corrections
a8653ac  Fix Phase 4 executive queries — HANA column names
3416608  Sprint 16+17: Phase 4 — Treasury & Revenue + Executive Command Center
```

---

## 14. What's Next (Future Phases — Not Started)

- **Scheduled Briefings:** Email/Teams delivery of Executive AI Briefing on a schedule
- **Agent Actions:** Agents that can write back to HANA (flag alerts, create work orders, draft reports)
- **SAC Integration:** Connect Datasphere Analytic Models to SAP Analytics Cloud stories
- **Mobile-responsive UI:** Current design works on desktop; mobile optimization not done
- **Multi-tenant:** Currently single-org; RBAC can be extended for multi-department isolation
