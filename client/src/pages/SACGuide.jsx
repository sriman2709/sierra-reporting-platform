import { useNavigate } from 'react-router-dom';

const STEPS = [
  {
    phase: 'Phase 1: Datasphere Setup',
    color: '#1a5c9e',
    steps: [
      {
        n: '1',
        title: 'Assign DW Consumer Role to OAuth Client',
        detail: `In SAP BTP Cockpit → your Datasphere subaccount → Service Instances → select your Datasphere instance → Service Keys. Find the OAuth client (e.g. sb-45c23f06…). In Datasphere → Security → Roles → assign "DW Consumer" to this client. This unlocks the OData consumption API (required for SAC live connections).`,
        code: null,
      },
      {
        n: '2',
        title: 'Create a Space in Datasphere',
        detail: `In Datasphere → Space Management → New Space. Name it PUBLIC_SECTOR. Set Memory Allocation (start with 4 GB). This space will host the replicated tables and views equivalent to the HANA schema used here.`,
        code: null,
      },
      {
        n: '3',
        title: 'Replicate Source Tables via Data Integration',
        detail: `For each of the 20 HANA tables (I_Fund, I_GrantMaster, I_Program, I_OutcomeMetric, I_OutcomeActual, I_CostToServeUnit, etc.), create a Remote Table or import a CSV snapshot. In Datasphere → Data Builder → New Remote Table → connect to your HANA source system.`,
        code: `-- Datasphere equivalent of I_Fund:
CREATE TABLE "PUBLIC_SECTOR"."I_Fund" (
  fund_id     NVARCHAR(50) PRIMARY KEY,
  fund_code   NVARCHAR(20),
  fund_name   NVARCHAR(200),
  fund_type   NVARCHAR(50),
  fiscal_year INTEGER,
  appropriation_amount DECIMAL(18,2),
  expenditures_ytd     DECIMAL(18,2),
  encumbrance_amount   DECIMAL(18,2),
  ending_balance       DECIMAL(18,2),
  restricted_amount    DECIMAL(18,2),
  unassigned_amount    DECIMAL(18,2),
  is_grant_fund        NVARCHAR(1),
  gasb54_class         NVARCHAR(50)
);`,
      },
      {
        n: '4',
        title: 'Recreate the 8 Analytical Views',
        detail: `In Datasphere → Data Builder → New Graphical View. Recreate each view. The most important is V_FundAvailableToSpend (joins I_Fund to compute available balance) and V_ForecastVariance (joins I_ForecastEntry + I_ScenarioVersion + I_Fund).`,
        code: `-- V_FundAvailableToSpend (Datasphere Analytical View):
-- Source: I_Fund
-- Computed Columns:
--   available = appropriation_amount - expenditures_ytd - encumbrance_amount
--   burn_pct  = expenditures_ytd / appropriation_amount * 100
--   budget_status = CASE WHEN available < 0 THEN 'OVER_BUDGET' ...`,
      },
    ],
  },
  {
    phase: 'Phase 2: SAP Analytics Cloud Connection',
    color: '#38a169',
    steps: [
      {
        n: '5',
        title: 'Create a Live Connection to Datasphere',
        detail: `In SAC → System → Connections → Add Connection → SAP Datasphere. Enter your Datasphere tenant URL. Use the OAuth client credentials (client_id + client_secret from the service key). Select the PUBLIC_SECTOR space. SAC will discover available analytical views automatically.`,
        code: null,
      },
      {
        n: '6',
        title: 'Create Data Models in SAC',
        detail: `For each module, create a SAC Model (Live connection, not import). Go to Modeler → New Model → Use a Live Data Connection → select the Datasphere connection → pick the view. Key models to create:\n• M_GrantCompliance (from V_GrantCompliance or equivalent CTE view)\n• M_FundAvailableToSpend (from V_FundAvailableToSpend)\n• M_OutcomeScorecard (from V_OutcomeScorecard)\n• M_ForecastVariance (from V_ForecastVariance)`,
        code: null,
      },
      {
        n: '7',
        title: 'Map Measures and Dimensions',
        detail: `In each SAC model, classify columns:\n• Measures: award_amount, total_expenditures, available_to_spend, posture_score, effectiveness_score, cost_per_unit\n• Dimensions: grant_id, fund_type, fiscal_year, period, program_name, department, award_status\nSet aggregation rules (SUM for amounts, AVG for scores).`,
        code: null,
      },
    ],
  },
  {
    phase: 'Phase 3: Build SAC Stories',
    color: '#805ad5',
    steps: [
      {
        n: '8',
        title: 'Grants Management Story',
        detail: `New Story → Canvas. Add these charts:\n• KPI tiles: Total Grants, Total Award Value, Avg Posture Score, At-Risk Grants\n• Bar chart: Grant award amounts by agency (use M_GrantCompliance, dimension=grantor_agency, measure=award_amount)\n• Scatter chart: Posture Score vs Award Amount (identify high-value low-compliance grants)\n• Table: Full grant list with posture_tier filter (STRONG / ADEQUATE / NEEDS_IMPROVEMENT / AT_RISK)`,
        code: null,
      },
      {
        n: '9',
        title: 'Fund Accounting Story',
        detail: `New Story → Canvas. Add:\n• Variance chart (Budget vs Expenditures vs Available) — grouped bar, dimension=fund_name\n• Waterfall chart: Budget → Expenditures → Encumbrances → Available (great for GASB-54 presentation)\n• Filter: fund_type, fiscal_year\n• KPI tiles with threshold formatting (red when available < 10% of budget)`,
        code: null,
      },
      {
        n: '10',
        title: 'Outcome Metrics Story',
        detail: `New Story → Canvas. Add:\n• Radial/donut chart: ON_TRACK / AT_RISK / OFF_TRACK distribution\n• Line chart: Actual value trend over fiscal periods (dimension=period, measure=actual_value, color by performance_status)\n• Scatter chart: effectiveness_score vs avg_cost_per_unit (quadrant analysis)\n• Table: program effectiveness with tier badges (configure cell color rules ≥75=green, ≥50=yellow, else red)`,
        code: null,
      },
      {
        n: '11',
        title: 'Financial Forecast + What-If',
        detail: `New Story → Canvas. For the What-If builder in SAC:\n• Use Planning (if SAC Planning module available): create a version for "What-If" and use input controls to adjust budget allocation\n• Alternative (Analytics only): use Story Filters with sliders on a calculated measure:\n  Projected_Available = [appropriation_amount] * (1 + [@BudgetPct]/100) - [expenditures_ytd] * (1 + [@CostPct]/100) - [encumbrance_amount]\n• Sensitivity Tornado: horizontal bar chart, measures = impact_10pct_budget_cut and impact_10pct_cost_increase (negative/positive axis)`,
        code: `// SAC Calculated Measure for What-If:
// Name: Projected_Available
// Formula (with input controls):
[appropriation_amount] * (1 + [Budget_Pct_Input] / 100)
- [expenditures_ytd] * (1 + [Cost_Pct_Input] / 100)
- [encumbrance_amount]`,
      },
    ],
  },
  {
    phase: 'Phase 4: Datasphere Connector Swap',
    color: '#dd6b20',
    steps: [
      {
        n: '12',
        title: 'Swap the Node.js Connector (this app)',
        detail: `In this React/Node platform, the only file to change is server/connectors/hana.js. Replace the hdbcli direct connection with Datasphere OData calls. The rest of the app (queries, service, routes, React pages) stays identical.`,
        code: `// server/connectors/datasphere.js
import axios from 'axios';

const DS_URL   = process.env.DS_BASE_URL;   // https://your-tenant.eu10.hcs.cloud.sap
const TOKEN_URL = process.env.DS_TOKEN_URL;
const CLIENT_ID = process.env.DS_CLIENT_ID;
const SECRET    = process.env.DS_CLIENT_SECRET;
const SPACE     = process.env.DS_SPACE_ID;  // PUBLIC_SECTOR

let _token = null, _expiry = 0;

async function getToken() {
  if (_token && Date.now() < _expiry) return _token;
  const { data } = await axios.post(TOKEN_URL,
    'grant_type=client_credentials',
    { auth: { username: CLIENT_ID, password: SECRET },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  _token = data.access_token;
  _expiry = Date.now() + (data.expires_in - 60) * 1000;
  return _token;
}

// Map SQL-style queries to OData entity names
const ENTITY_MAP = {
  'I_Fund':                 'I_Fund',
  'I_GrantMaster':          'I_GrantMaster',
  'V_ForecastVariance':     'V_ForecastVariance',
  'V_OutcomeScorecard':     'V_OutcomeScorecard',
  // ... add all 20 tables + 8 views
};

export async function query(entityName, params = {}) {
  const token = await getToken();
  const url = \`\${DS_URL}/api/v1/dwc/consumption/relational/\${SPACE}/\${entityName}\`;
  const { data } = await axios.get(url, {
    headers: { Authorization: \`Bearer \${token}\` },
    params:  { $format: 'json', ...params },
  });
  return data.value;
}

export const SCHEMA = '';  // not needed for OData`,
      },
      {
        n: '13',
        title: 'Environment Variables for Datasphere',
        detail: `Add these to your .env file when switching to Datasphere. Quote values containing # to prevent truncation.`,
        code: `# .env — Datasphere connector
DS_BASE_URL="https://your-tenant.eu10.hcs.cloud.sap"
DS_TOKEN_URL="https://your-tenant.authentication.eu10.hana.ondemand.com/oauth/token"
DS_CLIENT_ID="sb-45c23f06-xxxx-xxxx-xxxx-xxxxxxxxxxxx!bXXXX|client!bXXXX"
DS_CLIENT_SECRET="your-client-secret-here"
DS_SPACE_ID="PUBLIC_SECTOR"

# IMPORTANT: Values containing # must be double-quoted
# (unquoted # in .env is treated as a comment — password gets truncated)`,
      },
    ],
  },
];

const S_CARD = {
  background: '#fff', borderRadius: 8, padding: '20px 22px',
  boxShadow: '0 1px 4px rgba(0,0,0,.1)', marginBottom: 16, border: '1px solid #e2e8f0',
};

export default function SACGuide() {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0d3a63, #1a5c9e)',
        borderRadius: 10, padding: '24px 28px', marginBottom: 28, color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
            SAP Analytics Cloud + Datasphere — Step-by-Step Dev Guide
          </h2>
          <p style={{ opacity: 0.8, fontSize: 13 }}>
            How to replicate this Sierra SLED platform in SAC/Datasphere, and how to swap the Node.js connector.
          </p>
        </div>
        <button onClick={() => navigate('/')} style={{
          padding: '7px 14px', background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)',
          borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap',
        }}>← Dashboard</button>
      </div>

      {/* Architecture diagram (text) */}
      <div style={{ ...S_CARD, background: '#f7f9fc' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Current Architecture vs SAC Architecture</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#1a5c9e', marginBottom: 8 }}>This Platform (React + Node)</div>
            {['Browser (React + Recharts)', '↓', 'Node.js/Express API', '↓', 'hdbcli connector', '↓', 'SAP HANA Cloud'].map((l, i) => (
              <div key={i} style={{ fontSize: 12, color: l === '↓' ? '#718096' : '#1a202c', textAlign: 'center', padding: '3px 0' }}>{l}</div>
            ))}
          </div>
          <div style={{ fontSize: 20, color: '#718096' }}>⇄</div>
          <div style={{ background: '#fff', borderRadius: 8, padding: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#38a169', marginBottom: 8 }}>SAC + Datasphere</div>
            {['SAC Story (Charts + KPIs)', '↓', 'SAC Live Connection', '↓', 'Datasphere OData API', '↓', 'Datasphere Space'].map((l, i) => (
              <div key={i} style={{ fontSize: 12, color: l === '↓' ? '#718096' : '#1a202c', textAlign: 'center', padding: '3px 0' }}>{l}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Steps */}
      {STEPS.map(phase => (
        <div key={phase.phase} style={{ marginBottom: 28 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
            paddingBottom: 10, borderBottom: `2px solid ${phase.color}`,
          }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%', background: phase.color, flexShrink: 0,
            }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: phase.color }}>{phase.phase}</h3>
          </div>

          {phase.steps.map(step => (
            <div key={step.n} style={S_CARD}>
              <div style={{ display: 'flex', gap: 14, marginBottom: step.detail ? 10 : 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: phase.color,
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>{step.n}</div>
                <div style={{ fontWeight: 700, fontSize: 14, paddingTop: 4 }}>{step.title}</div>
              </div>
              {step.detail && (
                <div style={{ marginLeft: 42 }}>
                  <div style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.7, marginBottom: step.code ? 12 : 0, whiteSpace: 'pre-line' }}>
                    {step.detail}
                  </div>
                  {step.code && (
                    <pre style={{
                      background: '#1a202c', color: '#e2e8f0', padding: '14px 16px',
                      borderRadius: 6, fontSize: 12, overflowX: 'auto', lineHeight: 1.6,
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                    }}>{step.code}</pre>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Checklist */}
      <div style={S_CARD}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Pre-Launch Checklist</div>
        {[
          ['Datasphere DW Consumer role assigned to OAuth client', '#38a169'],
          ['All 20 HANA tables replicated to Datasphere space', '#38a169'],
          ['8 analytical views recreated in Datasphere Data Builder', '#38a169'],
          ['SAC Live Connection verified (test connection → green)', '#38a169'],
          ['SAC models created for each module (4 minimum)', '#d69e2e'],
          ['Story filters and input controls configured for What-If', '#d69e2e'],
          ['Cell color rules set for compliance/effectiveness tiers', '#d69e2e'],
          ['Node.js connector swapped to datasphere.js (optional)', '#718096'],
          ['CSV export tested on all 6 modules', '#718096'],
          ['Role-based access configured in both SAC and Datasphere', '#718096'],
        ].map(([item, color]) => (
          <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${color}`, flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13, color: '#2d3748' }}>{item}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '20px 0', color: '#718096', fontSize: 12 }}>
        Sierra SLED Reporting Platform — Built with React, Node.js, SAP HANA Cloud hdbcli
      </div>
    </div>
  );
}
