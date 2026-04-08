import { useNavigate } from 'react-router-dom';
import useData from '../components/useData';

const fmt$ = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
const fmtN = n => n == null ? '—' : Number(n).toLocaleString();

// ── All 14 operational modules ─────────────────────────────────────────────
const MODULES = [
  // Financial Management
  {
    to: '/grants', icon: '🏛', label: 'Grants Management', color: '#1a5c9e',
    desc: 'Grant lifecycle, compliance posture, subrecipient risk, burn rate tracking',
    phase: 'Financial',
  },
  {
    to: '/funds', icon: '💰', label: 'Fund Accounting', color: '#38a169',
    desc: 'Available-to-spend, GASB-54 fund classifications, encumbrances, over-budget alerts',
    phase: 'Financial',
  },
  {
    to: '/finance', icon: '📒', label: 'Finance Controller', color: '#2c7a7b',
    desc: 'Budget vs actuals by department, period close readiness, journal exceptions',
    phase: 'Financial',
  },
  {
    to: '/procurement', icon: '🛒', label: 'Procurement & AP', color: '#7c3aed',
    desc: 'Contract utilization, expiry risk, AP aging, vendor risk scores, debarment',
    phase: 'Financial',
  },
  {
    to: '/treasury', icon: '🏦', label: 'Treasury & Revenue', color: '#0369a1',
    desc: 'Cash position, investments, debt service schedule, tax revenue by type',
    phase: 'Financial',
  },
  // Program & Outcomes
  {
    to: '/subawards', icon: '📋', label: 'Subaward & Compliance', color: '#d69e2e',
    desc: 'Subrecipient monitoring, corrective actions, CFR Part 200 allowability',
    phase: 'Program',
  },
  {
    to: '/outcomes', icon: '📈', label: 'Outcome Metrics', color: '#805ad5',
    desc: 'Program effectiveness scores, cost-per-outcome, grant–outcome linkage, trends',
    phase: 'Program',
  },
  {
    to: '/audit', icon: '🔍', label: 'Audit Readiness', color: '#dd6b20',
    desc: 'Single Audit drilldown, finding tracking, evidence completeness, export package',
    phase: 'Program',
  },
  // Enterprise Operations
  {
    to: '/capital-projects', icon: '🏗', label: 'Capital Projects & CIP', color: '#c05621',
    desc: 'Project health (ON_TRACK/AT_RISK/DELAYED), milestones, change orders, CIP funding',
    phase: 'Operations',
  },
  {
    to: '/assets', icon: '🔧', label: 'Assets & Maintenance', color: '#276749',
    desc: 'Asset condition ratings, work orders (EMERGENCY/PREVENTIVE), PM compliance',
    phase: 'Operations',
  },
  {
    to: '/inventory', icon: '📦', label: 'Inventory & Warehouse', color: '#5a67d8',
    desc: 'Stock levels, OUT_OF_STOCK/LOW_STOCK alerts, reorder needs, warehouse turnover',
    phase: 'Operations',
  },
  // Workforce & Fleet
  {
    to: '/hr', icon: '👥', label: 'HR & Workforce', color: '#b7791f',
    desc: 'Headcount, position control (budgeted vs filled), vacancy rate, payroll by fund',
    phase: 'Workforce',
  },
  {
    to: '/fleet', icon: '🚗', label: 'Fleet Management', color: '#2d3748',
    desc: 'Vehicle health, fuel consumption, inspection compliance (OVERDUE alerts), fleet cost',
    phase: 'Workforce',
  },
  {
    to: '/forecast', icon: '📊', label: 'Financial Forecast', color: '#e53e3e',
    desc: 'What-if scenario builder, fund sensitivity analysis, variance dashboard',
    phase: 'Financial',
  },
];

const PHASE_COLORS = {
  Financial:  '#ebf8ff',
  Program:    '#fefce8',
  Operations: '#f0fff4',
  Workforce:  '#faf5ff',
};

const PHASE_LABEL_COLORS = {
  Financial:  '#1a5c9e',
  Program:    '#92400e',
  Operations: '#276749',
  Workforce:  '#6b21a8',
};

const PLATFORM_TAGS = [
  '46 HANA Tables', '14 Live Modules', '4 AI Agents', 'Sierra AI',
  'JWT + RBAC', 'Public Portal', 'Azure Hosted', 'SAP Datasphere',
];

export default function Dashboard() {
  const navigate = useNavigate();

  // Cross-domain KPI pulls
  const { data: grantKpis }    = useData('/grants/kpis');
  const { data: fundKpis }     = useData('/funds/kpis');
  const { data: procKpis }     = useData('/procurement/kpis');
  const { data: capitalKpis }  = useData('/capital/kpis');
  const { data: hrKpis }       = useData('/hr/kpis');
  const { data: fleetKpis }    = useData('/fleet/kpis');
  const { data: assetKpis }    = useData('/assets/kpis');
  const { data: inventoryKpis }= useData('/inventory/kpis');
  const { data: treasuryKpis } = useData('/treasury/kpis');

  const gk  = grantKpis     || {};
  const fk  = fundKpis      || {};
  const pk  = procKpis      || {};
  const ck  = capitalKpis   || {};
  const hk  = hrKpis        || {};
  const flk = fleetKpis     || {};
  const ak  = assetKpis     || {};
  const ik  = inventoryKpis || {};
  const tk  = treasuryKpis  || {};

  const KPI_ROWS = [
    [
      { label: 'Active Grants',     value: fmtN(gk.active_grants),           color: '#1a5c9e' },
      { label: 'Total Grant Funding',value: fmt$(gk.total_award_amount),      color: '#1a5c9e' },
      { label: 'Fund Balance',      value: fmt$(fk.total_balance),            color: '#38a169' },
      { label: 'Available-to-Spend',value: fmt$(fk.total_available),          color: '#38a169' },
      { label: 'Cash Position',     value: fmt$(tk.cash_reserves),            color: '#0369a1' },
    ],
    [
      { label: 'Active Contracts',  value: fmtN(pk.active_contracts),         color: '#7c3aed' },
      { label: 'Capital Projects',  value: fmtN(ck.active_projects),          color: '#c05621' },
      { label: 'Active Employees',  value: fmtN(hk.active_employees),         color: '#b7791f' },
      { label: 'Fleet Vehicles',    value: fmtN(flk.total_vehicles),          color: '#2d3748' },
      { label: 'Stock Alerts',      value: fmtN(ik.out_of_stock_count),       color: '#e53e3e' },
    ],
  ];

  return (
    <div>
      {/* ── Platform banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0d3a63, #1a5c9e)',
        borderRadius: 12, padding: '28px 32px', marginBottom: 24, color: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, margin: 0 }}>
              Sierra SLED Enterprise Intelligence Platform
            </h2>
            <p style={{ opacity: 0.85, fontSize: 13, maxWidth: 580, marginTop: 8, lineHeight: 1.6 }}>
              Real-time public sector operating intelligence powered by SAP HANA Cloud.
              14 modules covering the complete SLED lifecycle — from grants to fleet, treasury to workforce —
              with autonomous AI agents and a citizen-facing public transparency portal.
            </p>
          </div>
          <div style={{ textAlign: 'right', opacity: 0.9, flexShrink: 0 }}>
            <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7 }}>Connected to</div>
            <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2 }}>SAP HANA Cloud</div>
            <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>via SAP Datasphere · Schema PUBLIC_SECTOR</div>
            <div style={{ marginTop: 10, display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {['Phase 1–6 Complete', '✓ All Systems Live'].map(t => (
                <span key={t} style={{
                  padding: '2px 10px', background: 'rgba(255,255,255,.2)',
                  borderRadius: 20, fontSize: 11, fontWeight: 600,
                }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
          {PLATFORM_TAGS.map(tag => (
            <span key={tag} style={{
              padding: '3px 12px', background: 'rgba(255,255,255,.13)',
              borderRadius: 20, fontSize: 12,
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* ── Cross-domain KPI strip ── */}
      {KPI_ROWS.map((row, ri) => (
        <div key={ri} style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12, marginBottom: 14,
        }}>
          {row.map(k => (
            <div key={k.label} style={{
              background: '#fff', borderRadius: 8, padding: '14px 16px',
              boxShadow: '0 1px 4px rgba(0,0,0,.08)', borderLeft: `4px solid ${k.color}`,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#718096', letterSpacing: '.06em' }}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6, color: '#1a202c' }}>{k.value}</div>
            </div>
          ))}
        </div>
      ))}

      {/* ── Module cards ── */}
      <div style={{ marginBottom: 10, marginTop: 24 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
          Platform Modules
        </h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 28 }}>
        {MODULES.map(m => (
          <div
            key={m.to}
            onClick={() => navigate(m.to)}
            style={{
              background: '#fff', borderRadius: 10, padding: '18px 20px',
              boxShadow: '0 1px 4px rgba(0,0,0,.08)',
              cursor: 'pointer', border: '1.5px solid #e2e8f0',
              transition: 'box-shadow .18s, border-color .18s',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.12)';
              e.currentTarget.style.borderColor = m.color;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.08)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <div style={{
              position: 'absolute', top: 0, right: 0,
              background: PHASE_COLORS[m.phase] || '#f8fafc',
              color: PHASE_LABEL_COLORS[m.phase] || '#64748b',
              fontSize: 9, fontWeight: 800, letterSpacing: 0.8,
              padding: '3px 8px', borderRadius: '0 8px 0 6px',
            }}>{m.phase.toUpperCase()}</div>

            <div style={{ fontSize: 26, marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a202c', marginBottom: 5 }}>{m.label}</div>
            <div style={{ fontSize: 12, color: '#718096', lineHeight: 1.55 }}>{m.desc}</div>
            <div style={{ marginTop: 12, fontSize: 12, color: m.color, fontWeight: 700 }}>Open module →</div>
          </div>
        ))}
      </div>

      {/* ── AI & Agents quick-launch ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div
          onClick={() => navigate('/agents')}
          style={{
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            borderRadius: 12, padding: '20px 24px', cursor: 'pointer', color: '#fff',
            border: '2px solid #475569', transition: 'border-color .18s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#475569'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 26 }}>✦</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>Agent Hub</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>4 autonomous domain agents</div>
            </div>
          </div>
          <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.55 }}>
            Grants · Procurement · Operations · Executive AI Briefing — each pre-fetches all domain data and generates a structured risk report.
          </div>
          <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Run analysis →</div>
        </div>

        <div
          onClick={() => navigate('/ai')}
          style={{
            background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
            borderRadius: 12, padding: '20px 24px', cursor: 'pointer', color: '#fff',
            border: '2px solid #3b82f6', transition: 'border-color .18s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#93c5fd'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#3b82f6'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 26 }}>◈</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>Sierra Intelligence</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>46-tool AI analyst · all domains</div>
            </div>
          </div>
          <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.55 }}>
            Ask any question across all 14 modules simultaneously. Live HANA data · contextual follow-up suggestions after every answer.
          </div>
          <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: '#93c5fd' }}>Ask a question →</div>
        </div>
      </div>

      {/* ── Architecture note ── */}
      <div style={{
        background: '#f7f9fc', borderRadius: 8, padding: '14px 20px',
        border: '1px solid #e2e8f0', display: 'flex', gap: 20, alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 22 }}>🗄</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>Platform Architecture</div>
          <div style={{ fontSize: 12, color: '#718096' }}>
            React + Vite SPA → Node.js/Express API (ESM) → SAP HANA Cloud via Datasphere (hdb driver).
            All data in schema <code style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 3 }}>PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER</code>.
            Deployed on Azure App Service · JWT auth · role-based access control.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/transparency')} style={{
            padding: '8px 14px', background: '#0369a1', color: '#fff',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700,
          }}>🌐 Public Portal</button>
          <button onClick={() => navigate('/roadmap')} style={{
            padding: '8px 14px', background: '#1a5c9e', color: '#fff',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700,
          }}>🗺 Roadmap →</button>
        </div>
      </div>
    </div>
  );
}
