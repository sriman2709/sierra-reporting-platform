const PHASE_COLORS = {
  foundation: { bg: '#f0fff4', border: '#9ae6b4', badge: '#38a169', label: 'LIVE' },
  phase1:     { bg: '#ebf8ff', border: '#90cdf4', badge: '#3182ce', label: 'LIVE' },
  phase2:     { bg: '#e8eaf6', border: '#9fa8da', badge: '#3949ab', label: 'PHASE 2' },
  phase3:     { bg: '#f3e8fd', border: '#d6bcfa', badge: '#805ad5', label: 'PHASE 3' },
  phase4:     { bg: '#e0f7fa', border: '#80deea', badge: '#0097a7', label: 'PHASE 4' },
  phase5:     { bg: '#fff3e0', border: '#ffcc80', badge: '#e65100', label: 'PHASE 5' },
};

function RoadmapCard({ icon, title, kpis, phase, wide = false }) {
  const c = PHASE_COLORS[phase] || PHASE_COLORS.foundation;
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
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>{num}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1a202c', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#4a5568', lineHeight: 1.6 }}>{desc}</div>
      </div>
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
          From Fund &amp; Grant Control → Full Public Sector Operating Model
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
          {[
            { label: '9 Live Modules', icon: '✅' },
            { label: '20+ HANA Tables', icon: '🗄' },
            { label: '8 Canonical Views', icon: '📐' },
            { label: 'AI Analyst Embedded', icon: '✦' },
          ].map((b, i) => (
            <div key={i} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
              {b.icon} {b.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Foundation ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ height: 3, width: 24, background: PHASE_COLORS.foundation.badge, borderRadius: 2 }} />
          <span style={{ fontWeight: 800, fontSize: 13, color: PHASE_COLORS.foundation.badge, letterSpacing: 1 }}>FOUNDATION — LIVE NOW</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          <RoadmapCard icon="🏛" title="Grants Management" phase="foundation" kpis={['Award lifecycle tracking', 'Burn rate vs time elapsed', 'Compliance posture scoring', 'Subrecipient risk matrix', 'Allowability rules engine']} />
          <RoadmapCard icon="💰" title="Fund Accounting" phase="foundation" kpis={['GASB 54 fund classification', 'Budget vs actuals monitoring', 'Expenditure trending', 'Fund balance analysis']} />
          <RoadmapCard icon="📋" title="Subawards & Compliance" phase="foundation" kpis={['Subaward register', 'Subrecipient monitoring', 'Corrective action tracking', '2 CFR 200 compliance']} />
          <RoadmapCard icon="📈" title="Outcome Metrics" phase="foundation" kpis={['Program performance KPIs', '3-year trend analysis', 'Cost-to-serve benchmarking', 'Target vs actual tracking']} />
          <RoadmapCard icon="🔍" title="Audit Readiness" phase="foundation" kpis={['Control evidence library', 'Document management', 'Approval records', 'Audit log trail']} />
          <RoadmapCard icon="📊" title="Financial Forecast" phase="foundation" kpis={['Scenario modeling (3 versions)', 'Early warning flags', 'Year-end projection', 'Underspend risk scoring']} />
        </div>
      </div>

      {/* ── Phase 1: Enterprise Expansion ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ height: 3, width: 24, background: PHASE_COLORS.phase1.badge, borderRadius: 2 }} />
          <span style={{ fontWeight: 800, fontSize: 13, color: PHASE_COLORS.phase1.badge, letterSpacing: 1 }}>PHASE 1 — SPRINT 9 &amp; 10 — LIVE</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          <RoadmapCard icon="🛒" title="Procurement & AP Intelligence" phase="phase1" kpis={['PO pipeline &amp; cycle time analytics', 'Contract utilization &amp; expiry monitor', 'AP aging buckets (30/60/90-day)', 'Vendor risk scoring &amp; debarment', 'Sole-source procurement flagging']} />
          <RoadmapCard icon="🏦" title="Finance Controller" phase="phase1" kpis={['Budget variance by department', 'Period close readiness dashboard', 'Journal entry exception monitoring', 'Interfund transfer tracking', 'GASB-compliant spend analytics']} />
        </div>
      </div>

      {/* ── Phase 2 ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ height: 3, width: 24, background: PHASE_COLORS.phase2.badge, borderRadius: 2 }} />
          <span style={{ fontWeight: 800, fontSize: 13, color: PHASE_COLORS.phase2.badge, letterSpacing: 1 }}>PHASE 2 — CAPITAL &amp; OPERATIONS</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          <RoadmapCard icon="🏗" title="Capital Projects" phase="phase2" kpis={['CIP project register', 'Phase progress &amp; milestones', 'Budget-to-complete forecasting', 'Change order management', 'Bond drawdown tracking']} />
          <RoadmapCard icon="⚙️" title="Assets & Maintenance" phase="phase2" kpis={['Fixed asset register', 'Depreciation scheduling', 'Maintenance work order tracking', 'Asset condition scoring', 'Replacement cost forecasting']} />
          <RoadmapCard icon="📦" title="Inventory Management" phase="phase2" kpis={['Inventory catalog &amp; valuation', 'Reorder point alerts', 'Consumption vs budget', 'Warehouse location tracking']} />
        </div>
      </div>

      {/* ── Phase 3 ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ height: 3, width: 24, background: PHASE_COLORS.phase3.badge, borderRadius: 2 }} />
          <span style={{ fontWeight: 800, fontSize: 13, color: PHASE_COLORS.phase3.badge, letterSpacing: 1 }}>PHASE 3 — HR &amp; TREASURY</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          <RoadmapCard icon="👥" title="HR & Payroll Analytics" phase="phase3" kpis={['Position control vs actuals', 'Salary encumbrance forecasting', 'FTE by program &amp; fund', 'Grant-funded FTE compliance', 'Turnover &amp; vacancy rate KPIs']} />
          <RoadmapCard icon="🏦" title="Treasury & Revenue" phase="phase3" kpis={['Cash position dashboard', 'Revenue recognition by fund', 'Investment portfolio tracking', 'Debt service management', 'Tax revenue trend analysis']} />
        </div>
      </div>

      {/* ── Phase 4 ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ height: 3, width: 24, background: PHASE_COLORS.phase4.badge, borderRadius: 2 }} />
          <span style={{ fontWeight: 800, fontSize: 13, color: PHASE_COLORS.phase4.badge, letterSpacing: 1 }}>PHASE 4 — EXECUTIVE &amp; PUBLIC LAYER</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          <RoadmapCard icon="🎯" title="Executive Command Center" phase="phase4" kpis={['Cross-domain executive scorecard', 'Alert &amp; exception aggregator', 'City-level KPI benchmarking', 'Multi-period trend overlays', 'Board reporting package']} />
          <RoadmapCard icon="🌐" title="Public Transparency Portal" phase="phase4" kpis={['Public-facing grant awards dashboard', 'Spending transparency by fund', 'Program outcomes for citizens', 'CAFR-ready financial summaries']} />
        </div>
      </div>

      {/* ── Phase 5 ── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ height: 3, width: 24, background: PHASE_COLORS.phase5.badge, borderRadius: 2 }} />
          <span style={{ fontWeight: 800, fontSize: 13, color: PHASE_COLORS.phase5.badge, letterSpacing: 1 }}>PHASE 5 — AI EXPANSION (ALL DOMAINS)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          <RoadmapCard icon="✦" title="Grants AI Agent" phase="phase5" kpis={['Auto-flag compliance anomalies', 'Burn rate projection with LLM', 'Corrective action drafting', 'Reporting narrative generation']} />
          <RoadmapCard icon="✦" title="Procurement AI Agent" phase="phase5" kpis={['Duplicate invoice detection', 'Vendor fraud pattern scoring', 'Contract renewal recommendations', 'Bid price benchmarking']} />
          <RoadmapCard icon="✦" title="Finance AI Agent" phase="phase5" kpis={['Anomalous journal entry detection', 'Budget overrun early prediction', 'Period close acceleration', 'GASB standard interpretation']} />
          <RoadmapCard icon="✦" title="Executive AI Briefing" phase="phase5" kpis={['Daily executive digest emails', 'Natural language KPI queries', 'Comparative period analysis', 'Risk narrative summarization']} />
        </div>
      </div>

      {/* ── Architecture Diagram ── */}
      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
        boxShadow: '0 2px 12px rgba(0,0,0,.06)', padding: '28px 32px', marginBottom: 28,
      }}>
        <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: '#1a202c' }}>
          Four-Layer Architecture
        </h2>
        <ArchLayer
          icon="🗄"
          title="Layer 1: Source Systems & Raw Data"
          sub="SAP HANA Cloud · Canonical I_ tables · Real-time via hdbcli"
          color="#1a5c9e"
          items={['I_GrantMaster', 'I_Fund', 'I_Program', 'I_Contract', 'I_Vendor', 'I_BudgetLine', 'I_JournalEntry', 'I_Invoice', 'I_PurchaseOrder', '+15 more tables']}
        />
        <ArchLayer
          icon="📐"
          title="Layer 2: Sierra Canonical Data Model"
          sub="HANA Views · Pre-aggregated for performance · Used by all modules"
          color="#38a169"
          items={['V_GrantCompliance', 'V_GrantAwardLifecycle', 'V_ProcurementPipeline', 'V_APAging', 'V_ContractUtilization', 'V_BudgetVariance', 'V_CloseReadiness', '+3 more views']}
        />
        <ArchLayer
          icon="⚡"
          title="Layer 3: Sierra Intelligence Platform"
          sub="Node.js ESM API · React/Vite SPA · JWT Auth · Module-level RBAC"
          color="#805ad5"
          items={['Grants', 'Funds', 'Subawards', 'Outcomes', 'Audit', 'Forecast', 'Procurement', 'Finance', 'AI Chat', 'Roadmap']}
        />
        <ArchLayer
          icon="📊"
          title="Layer 4: Datasphere + SAC (Roadmap)"
          sub="Datasphere Analytic Models → SAC Stories → Executive Dashboards"
          color="#e65100"
          items={['Remote Tables', 'Perspectives', 'Analytic Datasets', 'KPI Definitions', 'SAC Stories', 'Executive Dashboards']}
        />
      </div>

      {/* ── Datasphere + SAC Roadmap ── */}
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
        <SACStep
          num={1} color="#1a5c9e"
          title="HANA Tables → Datasphere Remote Tables"
          desc="Connect SAP Datasphere to the HANA Cloud schema. Import all I_ canonical tables as Remote Tables with live replication. Zero ETL — data stays in HANA, Datasphere reads in real time."
        />
        <SACStep
          num={2} color="#38a169"
          title="Perspectives → Analytic Datasets"
          desc="Create Perspectives on top of the V_ HANA Views (V_GrantCompliance, V_ProcurementPipeline, V_BudgetVariance). Promote to Analytic Datasets with dimension/measure semantics. This is the semantic layer."
        />
        <SACStep
          num={3} color="#805ad5"
          title="Analytic Models → KPI Definitions"
          desc="Build Datasphere Analytic Models defining KPIs: Total Award Value, Budget Utilization %, AP Backlog, Compliance Score. Configure hierarchies (Department > Program > Grant). Publish to SAC."
        />
        <SACStep
          num={4} color="#e65100"
          title="SAC Stories → Executive Dashboards"
          desc="Design SAC Stories using the Analytic Models. Deliver: (a) Grants Executive Overview, (b) Budget Performance by Fund, (c) Procurement Risk Heat Map, (d) Period Close Status. Publish to SAC Planning for what-if simulations."
        />
        <div style={{
          marginTop: 24, padding: '14px 18px',
          background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: 8,
          fontSize: 12, color: '#744210',
        }}>
          <strong>Current State:</strong> Sierra Intelligence Platform (this app) serves as the operational layer feeding real-time data.
          Datasphere + SAC integration delivers the executive analytics and planning layer on top of the same canonical HANA tables.
          Both layers coexist — no duplication of data or logic.
        </div>
      </div>
    </div>
  );
}
