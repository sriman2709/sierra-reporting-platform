const PHASE_COLORS = {
  live:     { bg: '#f0fff4', border: '#9ae6b4', badge: '#38a169', label: 'LIVE' },
  phase1:   { bg: '#ebf8ff', border: '#90cdf4', badge: '#3182ce', label: 'LIVE' },
  phase2:   { bg: '#f0fff4', border: '#9ae6b4', badge: '#38a169', label: 'LIVE' },
  phase3:   { bg: '#f0fff4', border: '#9ae6b4', badge: '#38a169', label: 'LIVE' },
  phase4:   { bg: '#f3e8fd', border: '#d6bcfa', badge: '#805ad5', label: 'PHASE 4' },
  phase5:   { bg: '#e0f7fa', border: '#80deea', badge: '#0097a7', label: 'PHASE 5' },
  phase6:   { bg: '#fff3e0', border: '#ffcc80', badge: '#e65100', label: 'PHASE 6' },
};

function RoadmapCard({ icon, title, kpis, phase, wide = false }) {
  const c = PHASE_COLORS[phase] || PHASE_COLORS.live;
  return (
    <div style={{
      background: c.bg,
      border: `1.5px solid ${c.border}`,
      borderRadius: 12,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      gridColumn: wide ? 'span 2' : undefined,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <span style={{
          padding: '3px 10px', borderRadius: 12, fontSize: 10, fontWeight: 800,
          background: c.badge, color: '#fff', letterSpacing: 1,
        }}>{c.label}</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, color: '#1a202c' }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#4a5568', lineHeight: 1.7 }}>
        {kpis.map((k, i) => <li key={i}>{k}</li>)}
      </ul>
    </div>
  );
}

function ArchLayer({ icon, title, sub, items, color }) {
  return (
    <div style={{
      background: '#fff', border: `2px solid ${color}44`, borderRadius: 10,
      padding: '14px 20px', marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a202c' }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: '#718096' }}>{sub}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {items.map((item, i) => (
          <span key={i} style={{
            padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
            background: color + '18', color, border: `1px solid ${color}44`,
          }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function SACStep({ num, title, desc, color }) {
  return (
    <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', background: color,
        color: '#fff', fontWeight: 800, fontSize: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{num}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1a202c', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#4a5568', lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

function SectionHeader({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{ height: 3, width: 24, background: color, borderRadius: 2 }} />
      <span style={{ fontWeight: 800, fontSize: 13, color, letterSpacing: 1 }}>{label}</span>
    </div>
  );
}

export default function Roadmap() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a5c9e 0%, #0d3b6e 100%)',
        borderRadius: 16, padding: '32px 40px', color: '#fff', marginBottom: 32,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, opacity: .75, marginBottom: 6 }}>SIERRA INTELLIGENCE PLATFORM</div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>
          Sierra SLED Enterprise Intelligence Platform
        </h1>
        <p style={{ margin: '10px 0 0', opacity: .85, fontSize: 15, maxWidth: 700 }}>
          Full Public Sector Operating Model — 11 Live Modules across Finance, Operations, Workforce & Fleet
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
          {[
            { label: '11 Live Modules', icon: '✅' },
            { label: '38+ HANA Tables', icon: '🗄' },
            { label: '14+ Canonical Views', icon: '📐' },
            { label: '46 AI Tools', icon: '✦' },
            { label: 'CI/CD to Azure', icon: '☁️' },
          ].map((b, i) => (
            <div key={i} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
              {b.icon} {b.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Foundation ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader color="#38a169" label="FOUNDATION — LIVE" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          <RoadmapCard icon="🏛" title="Grants Management" phase="live" kpis={['Award lifecycle tracking', 'Burn rate vs time elapsed', 'Compliance posture scoring', 'Subrecipient risk matrix', 'Allowability rules engine']} />
          <RoadmapCard icon="💰" title="Fund Accounting" phase="live" kpis={['GASB 54 fund classification', 'Budget vs actuals monitoring', 'Expenditure trending', 'Fund balance analysis']} />
          <RoadmapCard icon="📋" title="Subawards & Compliance" phase="live" kpis={['Subaward register', 'Subrecipient monitoring', 'Corrective action tracking', '2 CFR 200 compliance']} />
          <RoadmapCard icon="📈" title="Outcome Metrics" phase="live" kpis={['Program performance KPIs', '3-year trend analysis', 'Cost-to-serve benchmarking', 'Target vs actual tracking']} />
          <RoadmapCard icon="🔍" title="Audit Readiness" phase="live" kpis={['Control evidence library', 'Document management', 'Approval records', 'Audit log trail']} />
          <RoadmapCard icon="📊" title="Financial Forecast" phase="live" kpis={['Scenario modeling (3 versions)', 'Early warning flags', 'Year-end projection', 'Underspend risk scoring']} />
        </div>
      </div>

      {/* ── Phase 1 ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader color="#3182ce" label="PHASE 1 — FINANCE CONTROLLER — LIVE" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          <RoadmapCard icon="🛒" title="Procurement & AP Intelligence" phase="phase1" kpis={['PO pipeline & cycle time analytics', 'Contract utilization & expiry monitor', 'AP aging buckets (30/60/90-day)', 'Vendor risk scoring & debarment', 'Sole-source procurement flagging']} />
          <RoadmapCard icon="🏦" title="Finance Controller" phase="phase1" kpis={['Budget variance by department', 'Period close readiness dashboard', 'Journal entry exception monitoring', 'Interfund transfer tracking', 'GASB-compliant spend analytics']} />
        </div>
      </div>

      {/* ── Phase 2 ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader color="#38a169" label="PHASE 2 — CAPITAL & OPERATIONS — LIVE" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          <RoadmapCard icon="🏗" title="Capital Projects & CIP" phase="phase2" kpis={['CIP project register & health scoring', 'Phase milestones & AT_RISK alerts', 'Budget-to-complete & change orders', 'Bond drawdown & funding mix', 'V_ProjectHealth + V_CIPSummary views']} />
          <RoadmapCard icon="🔧" title="Assets & Plant Maintenance" phase="phase2" kpis={['Fixed asset register (20 assets)', 'Work orders: EMERGENCY/PREVENTIVE/CORRECTIVE', 'PM compliance tracking & overdue alerts', 'Asset condition scoring (1–5)', 'Failure event log & V_AssetHealth view']} />
          <RoadmapCard icon="📦" title="Inventory & Warehouse" phase="phase2" kpis={['4 warehouses, 24 SKUs, 8 categories', 'OUT_OF_STOCK / LOW_STOCK reorder alerts', 'Stock transaction log (RECEIPT/ISSUE/RETURN)', 'Turnover ratio by category', 'V_InventoryHealth view']} />
        </div>
      </div>

      {/* ── Phase 3 ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader color="#38a169" label="PHASE 3 — WORKFORCE & FLEET — LIVE" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          <RoadmapCard icon="👥" title="HR & Workforce" phase="phase3" kpis={['Position control: budgeted vs filled FTE', 'Grant-funded FTE compliance tracking', 'Salary encumbrance by fund & department', 'Employee health dashboard & tenure', 'Payroll allocation across funds']} />
          <RoadmapCard icon="🚗" title="Fleet Management" phase="phase3" kpis={['Vehicle health: ACTIVE/MAINTENANCE/OUT_OF_SERVICE', 'Fuel consumption & MPG by vehicle/dept', 'Inspection compliance with OVERDUE alerts', 'Fleet operating cost by department', 'V_FleetHealth view']} />
        </div>
      </div>

      {/* ── Phase 2 AI Expansion ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader color="#38a169" label="PHASE 2–3 AI EXPANSION — 46 TOOLS LIVE" />
        <div style={{
          background: '#f0fff4', border: '1.5px solid #9ae6b4', borderRadius: 12, padding: '20px 24px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { domain: 'Grants & Compliance', count: 5, icon: '🏛' },
              { domain: 'Fund Accounting', count: 2, icon: '💰' },
              { domain: 'Outcomes', count: 4, icon: '📈' },
              { domain: 'Forecasting', count: 2, icon: '📊' },
              { domain: 'Procurement & AP', count: 5, icon: '🛒' },
              { domain: 'Finance Controller', count: 3, icon: '🏦' },
              { domain: 'Capital Projects', count: 5, icon: '🏗' },
              { domain: 'Assets & Maintenance', count: 5, icon: '🔧' },
              { domain: 'Inventory & Warehouse', count: 5, icon: '📦' },
              { domain: 'HR & Workforce', count: 5, icon: '👥' },
              { domain: 'Fleet Management', count: 5, icon: '🚗' },
            ].map(d => (
              <div key={d.domain} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 8, padding: '10px 14px', border: '1px solid #c6f6d5' }}>
                <span style={{ fontSize: 18 }}>{d.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{d.domain}</div>
                  <div style={{ fontSize: 11, color: '#38a169', fontWeight: 700 }}>{d.count} tools live</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: '#276749' }}>
            Sierra Intelligence (GPT-4o) can answer cross-domain questions spanning all 11 modules simultaneously.
            Ask: <em>"What is our full Public Works cost picture?"</em> → budget variance + assets + work orders + inventory + fleet + HR in one query.
          </div>
        </div>
      </div>

      {/* ── Phase 4 ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader color="#805ad5" label="PHASE 4 — TREASURY & EXECUTIVE" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          <RoadmapCard icon="🏦" title="Treasury & Revenue" phase="phase4" kpis={['Cash position dashboard', 'Revenue recognition by fund', 'Investment portfolio tracking', 'Debt service management', 'Tax revenue trend analysis']} />
          <RoadmapCard icon="🎯" title="Executive Command Center" phase="phase4" kpis={['Cross-domain executive scorecard', 'Alert & exception aggregator', 'City-level KPI benchmarking', 'Multi-period trend overlays', 'Board reporting package']} />
        </div>
      </div>

      {/* ── Phase 5 ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader color="#0097a7" label="PHASE 5 — PUBLIC TRANSPARENCY" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          <RoadmapCard icon="🌐" title="Public Transparency Portal" phase="phase5" kpis={['Public-facing grant awards dashboard', 'Spending transparency by fund', 'Program outcomes for citizens', 'CAFR-ready financial summaries']} />
        </div>
      </div>

      {/* ── Phase 6: AI Agentic ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader color="#e65100" label="PHASE 6 — AGENTIC AI (ALL DOMAINS)" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          <RoadmapCard icon="✦" title="Grants AI Agent" phase="phase6" kpis={['Auto-flag compliance anomalies', 'Burn rate projection with LLM', 'Corrective action drafting', 'Reporting narrative generation']} />
          <RoadmapCard icon="✦" title="Procurement AI Agent" phase="phase6" kpis={['Duplicate invoice detection', 'Vendor fraud pattern scoring', 'Contract renewal recommendations', 'Bid price benchmarking']} />
          <RoadmapCard icon="✦" title="Operations AI Agent" phase="phase6" kpis={['Predictive asset failure scoring', 'Automated reorder recommendations', 'Fleet route & fuel optimization', 'PM scheduling optimization']} />
          <RoadmapCard icon="✦" title="Executive AI Briefing" phase="phase6" kpis={['Daily executive digest emails', 'Natural language KPI queries', 'Comparative period analysis', 'Risk narrative summarization']} />
        </div>
      </div>

      {/* ── Architecture ── */}
      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
        boxShadow: '0 2px 12px rgba(0,0,0,.06)', padding: '28px 32px', marginBottom: 28,
      }}>
        <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: '#1a202c' }}>Four-Layer Architecture</h2>
        <ArchLayer
          icon="🗄" color="#1a5c9e"
          title="Layer 1: Source Systems & Raw Data"
          sub="SAP HANA Cloud · 38+ Canonical I_ tables · Real-time via hdbcli"
          items={['I_GrantMaster','I_Fund','I_Contract','I_Vendor','I_BudgetLine','I_JournalEntry','I_Invoice',
                  'I_CapitalProject','I_Milestone','I_Asset','I_WorkOrder','I_PMPlan',
                  'I_InventoryItem','I_StockTransaction','I_Warehouse',
                  'I_Employee','I_Position','I_PayrollRecord',
                  'I_Vehicle','I_FuelRecord','I_VehicleInspection','+17 more']}
        />
        <ArchLayer
          icon="📐" color="#38a169"
          title="Layer 2: Sierra Canonical Data Model"
          sub="14+ HANA Views · Pre-aggregated · Used by all modules"
          items={['V_GrantCompliance','V_ProcurementPipeline','V_APAging','V_ContractUtilization',
                  'V_BudgetVariance','V_CloseReadiness',
                  'V_ProjectHealth','V_CIPSummary',
                  'V_AssetHealth','V_InventoryHealth',
                  'V_WorkforceHealth','V_FleetHealth']}
        />
        <ArchLayer
          icon="⚡" color="#805ad5"
          title="Layer 3: Sierra Intelligence Platform"
          sub="Node.js ESM API · React/Vite SPA · JWT Auth · RBAC · 46-tool AI · CI/CD to Azure"
          items={['Grants','Funds','Subawards','Outcomes','Audit','Forecast',
                  'Procurement','Finance','Capital Projects','Assets',
                  'Inventory','HR','Fleet','Sierra AI (GPT-4o)']}
        />
        <ArchLayer
          icon="📊" color="#e65100"
          title="Layer 4: Datasphere + SAC (Roadmap)"
          sub="Datasphere Analytic Models → SAC Stories → Executive Dashboards"
          items={['Remote Tables','Perspectives','Analytic Datasets','KPI Definitions','SAC Stories','Executive Dashboards']}
        />
      </div>

      {/* ── SAC Steps ── */}
      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
        boxShadow: '0 2px 12px rgba(0,0,0,.06)', padding: '28px 32px',
      }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#1a202c' }}>
          Datasphere + SAC Integration Roadmap
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: '#718096' }}>
          Four steps from HANA canonical tables to executive-ready SAP Analytics Cloud stories
        </p>
        <SACStep num={1} color="#1a5c9e"
          title="HANA Tables → Datasphere Remote Tables"
          desc="Connect SAP Datasphere to the HANA Cloud schema. Import all I_ canonical tables as Remote Tables with live replication. Zero ETL — data stays in HANA, Datasphere reads in real time."
        />
        <SACStep num={2} color="#38a169"
          title="Perspectives → Analytic Datasets"
          desc="Create Perspectives on top of the V_ HANA Views (V_GrantCompliance, V_BudgetVariance, V_AssetHealth, V_FleetHealth, V_WorkforceHealth). Promote to Analytic Datasets with dimension/measure semantics."
        />
        <SACStep num={3} color="#805ad5"
          title="Analytic Models → KPI Definitions"
          desc="Build Datasphere Analytic Models defining KPIs: Total Award Value, Budget Utilization %, Fleet Fuel Cost, Vacancy Rate, PM Compliance %. Configure hierarchies (Department > Program > Grant). Publish to SAC."
        />
        <SACStep num={4} color="#e65100"
          title="SAC Stories → Executive Dashboards"
          desc="Design SAC Stories: (a) Grants Executive Overview, (b) Budget Performance by Fund, (c) Fleet & Asset Operations, (d) Workforce Cost & Vacancy, (e) Full Public Sector Operations Command Center."
        />
        <div style={{
          marginTop: 24, padding: '14px 18px',
          background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: 8,
          fontSize: 12, color: '#744210',
        }}>
          <strong>Current State:</strong> Sierra Intelligence Platform serves as the operational layer with 11 live modules, 38+ HANA tables, and 46 AI tools.
          Datasphere + SAC integration delivers the executive analytics and planning layer on top of the same canonical HANA tables — no data duplication.
        </div>
      </div>
    </div>
  );
}
