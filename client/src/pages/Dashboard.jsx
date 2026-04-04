import { useNavigate } from 'react-router-dom';
import useData from '../components/useData';

const fmt$ = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
const fmtN = n => n == null ? '—' : Number(n).toLocaleString();

const MODULES = [
  {
    to: '/grants',
    icon: '🏛',
    label: 'Grants Management',
    desc: 'Grant lifecycle, compliance posture, subrecipient risk, burn rate',
    color: '#1a5c9e',
  },
  {
    to: '/funds',
    icon: '💰',
    label: 'Fund Accounting',
    desc: 'Available-to-spend, GASB-54 classifications, encumbrances',
    color: '#38a169',
  },
  {
    to: '/subawards',
    icon: '📋',
    label: 'Subaward & Compliance',
    desc: 'Subrecipient monitoring, corrective actions, allowability rules',
    color: '#d69e2e',
  },
  {
    to: '/outcomes',
    icon: '📈',
    label: 'Outcome Metrics',
    desc: 'Program effectiveness scores, grant–outcome linkage, trend analysis',
    color: '#805ad5',
  },
  {
    to: '/audit',
    icon: '🔍',
    label: 'Audit Readiness',
    desc: 'Single Audit drilldown, evidence completeness, export package',
    color: '#dd6b20',
  },
  {
    to: '/forecast',
    icon: '📊',
    label: 'Financial Forecast',
    desc: 'Variance dashboard, what-if scenario builder, sensitivity analysis',
    color: '#e53e3e',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: grantKpis  } = useData('/grants/kpis');
  const { data: fundKpis   } = useData('/funds/kpis');
  const { data: outcomeKpis} = useData('/outcomes/kpis');
  const { data: forecastKpis} = useData('/forecast/kpis');

  const gk = grantKpis   || {};
  const fk = fundKpis    || {};
  const ok = outcomeKpis || {};
  const fck = forecastKpis || {};

  const summaryKpis = [
    { label: 'Total Grants',       value: gk.total_grants     ?? '…', color: '#1a5c9e' },
    { label: 'Total Award Value',  value: fmt$(gk.total_award_amount), color: '#1a5c9e' },
    { label: 'Total Funds',        value: fk.total_funds      ?? '…', color: '#38a169' },
    { label: 'Total Available',    value: fmt$(fk.total_available),   color: '#38a169' },
    { label: 'Outcome Metrics',    value: ok.total_metrics    ?? '…', color: '#805ad5' },
    { label: 'On Track',           value: ok.on_track         ?? '…', color: '#805ad5' },
    { label: 'At Risk',            value: ok.at_risk          ?? '…', color: '#dd6b20' },
    { label: 'Forecast Scenarios', value: fck.total_scenarios ?? '…', color: '#e53e3e' },
  ];

  return (
    <div>
      {/* Platform overview banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0d3a63, #1a5c9e)',
        borderRadius: 10, padding: '28px 32px', marginBottom: 28, color: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Sierra SLED Reporting Platform</h2>
            <p style={{ opacity: 0.8, fontSize: 14, maxWidth: 560 }}>
              Real-time public sector financial intelligence powered by SAP HANA Cloud.
              6 modules covering the full grant and fund lifecycle — from award to audit.
            </p>
          </div>
          <div style={{ textAlign: 'right', opacity: 0.9 }}>
            <div style={{ fontSize: 12, marginBottom: 4 }}>Connected to</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>SAP HANA Cloud</div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>schema PUBLIC_SECTOR</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
          {['20 HANA Tables', '8 Live Views', '6 Modules', 'JWT Auth', 'CSV Export', 'Role-Based Access'].map(tag => (
            <span key={tag} style={{
              padding: '3px 10px', background: 'rgba(255,255,255,.15)',
              borderRadius: 20, fontSize: 12,
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Cross-module KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {summaryKpis.slice(0, 4).map(k => (
          <div key={k.label} style={{
            background: '#fff', borderRadius: 8, padding: '16px 18px',
            boxShadow: '0 1px 4px rgba(0,0,0,.1)', borderLeft: `4px solid ${k.color}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#718096', letterSpacing: '.06em' }}>{k.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6, color: '#1a202c' }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        {summaryKpis.slice(4).map(k => (
          <div key={k.label} style={{
            background: '#fff', borderRadius: 8, padding: '16px 18px',
            boxShadow: '0 1px 4px rgba(0,0,0,.1)', borderLeft: `4px solid ${k.color}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#718096', letterSpacing: '.06em' }}>{k.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6, color: '#1a202c' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Module cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {MODULES.map(m => (
          <div
            key={m.to}
            onClick={() => navigate(m.to)}
            style={{
              background: '#fff', borderRadius: 10, padding: '20px 22px',
              boxShadow: '0 1px 4px rgba(0,0,0,.1)',
              cursor: 'pointer', border: '1px solid #e2e8f0',
              transition: 'box-shadow .2s, border-color .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.12)'; e.currentTarget.style.borderColor = m.color; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.1)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>{m.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a202c', marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 13, color: '#718096', lineHeight: 1.5 }}>{m.desc}</div>
            <div style={{ marginTop: 14, fontSize: 12, color: m.color, fontWeight: 600 }}>Open module →</div>
          </div>
        ))}
      </div>

      {/* Architecture note */}
      <div style={{
        marginTop: 28, background: '#f7f9fc', borderRadius: 8, padding: '16px 20px',
        border: '1px solid #e2e8f0', display: 'flex', gap: 24, alignItems: 'center',
      }}>
        <div style={{ fontSize: 24 }}>🗄</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Platform Architecture</div>
          <div style={{ fontSize: 12, color: '#718096' }}>
            React + Vite frontend → Node.js/Express API → SAP HANA Cloud (hdbcli).
            Connector-agnostic design: swap <code style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 3 }}>server/connectors/hana.js</code> to connect Oracle, Snowflake, or SAP Datasphere.
          </div>
        </div>
        <button
          onClick={() => navigate('/guide')}
          style={{
            marginLeft: 'auto', padding: '8px 16px', background: '#1a5c9e', color: '#fff',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
          }}
        >SAC Dev Guide →</button>
      </div>
    </div>
  );
}
