/**
 * AgentHub.jsx  –  Phase 6 · Agentic AI
 *
 * Four autonomous domain agents that pre-fetch all relevant data,
 * synthesize it through GPT-4o, and return a structured AgentReport.
 *
 * Layout:
 *  ┌─────────────────────────────────────────────────────────┐
 *  │  4 × Agent Cards  (click → Run Analysis)                │
 *  ├─────────────────────────────────────────────────────────┤
 *  │  Report Viewer  (summary · metrics · risks · actions ·  │
 *  │                  sections)                              │
 *  └─────────────────────────────────────────────────────────┘
 */
import { useState } from 'react';

const API = '/api/agents';
const token = () => localStorage.getItem('token');

// ── Agent definitions (mirrors agent.configs.js) ───────────────────────────
const AGENTS = [
  {
    type:        'grants',
    name:        'Grants Intelligence',
    icon:        '🏛',
    color:       '#2563eb',
    bg:          '#eff6ff',
    border:      '#bfdbfe',
    description: 'Compliance posture · Burn rates · Expiry risk · Subrecipient flags · Outcome linkage',
    role:        'Grants Portfolio Review',
  },
  {
    type:        'procurement',
    name:        'Procurement Intelligence',
    icon:        '🛒',
    color:       '#7c3aed',
    bg:          '#f5f3ff',
    border:      '#ddd6fe',
    description: 'Contract health · Vendor risk · AP aging · Spend anomalies · Savings opportunities',
    role:        'Procurement Health Check',
  },
  {
    type:        'operations',
    name:        'Operations Intelligence',
    icon:        '⚙️',
    color:       '#059669',
    bg:          '#ecfdf5',
    border:      '#a7f3d0',
    description: 'Asset health · Fleet status · Capital project risk · Inventory shortfalls · PM compliance',
    role:        'Operations Risk Sweep',
  },
  {
    type:        'executive',
    name:        'Executive AI Briefing',
    icon:        '🏛️',
    color:       '#dc2626',
    bg:          '#fef2f2',
    border:      '#fecaca',
    description: 'Cross-domain synthesis · Fiscal health · Operational readiness · Strategic recommendations',
    role:        'Full-Platform Briefing',
  },
];

// ── Risk badge styling ─────────────────────────────────────────────────────
const RISK_STYLE = {
  HIGH:   { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', dot: '#dc2626' },
  MEDIUM: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', dot: '#d97706' },
  LOW:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', dot: '#16a34a' },
};

const SEV_STYLE = {
  HIGH:   { bg: '#fee2e2', color: '#b91c1c', label: '● HIGH'   },
  MEDIUM: { bg: '#fef3c7', color: '#92400e', label: '● MEDIUM' },
  LOW:    { bg: '#dcfce7', color: '#166534', label: '● LOW'    },
};

const STATUS_STYLE = {
  ok:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  warn:  { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  alert: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

const DEADLINE_STYLE = {
  'Immediate':     { bg: '#fee2e2', color: '#b91c1c' },
  'This Week':     { bg: '#fef3c7', color: '#92400e' },
  'This Month':    { bg: '#dbeafe', color: '#1e40af' },
  'This Quarter':  { bg: '#f3f4f6', color: '#374151' },
};

// ── Thinking animation ─────────────────────────────────────────────────────
function ThinkingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#94a3b8',
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes pulse { 0%,80%,100%{opacity:.2;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }`}</style>
    </span>
  );
}

// ── Agent Card ─────────────────────────────────────────────────────────────
function AgentCard({ agent, loading, lastRun, onRun, active }) {
  return (
    <div
      onClick={() => !loading && onRun(agent.type)}
      style={{
        background:   active ? agent.bg    : '#fff',
        border:       `2px solid ${active ? agent.color : agent.border}`,
        borderRadius: 14,
        padding:      '20px 22px',
        cursor:       loading ? 'wait' : 'pointer',
        transition:   'all 0.18s',
        boxShadow:    active ? `0 0 0 3px ${agent.color}22` : '0 1px 4px rgba(0,0,0,0.06)',
        position:     'relative',
        overflow:     'hidden',
      }}
    >
      {/* accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: active ? agent.color : 'transparent',
        borderRadius: '14px 14px 0 0',
        transition: 'background 0.18s',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          fontSize: 32, width: 52, height: 52, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: agent.bg, borderRadius: 12, flexShrink: 0,
          border: `1.5px solid ${agent.border}`,
        }}>{agent.icon}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{agent.name}</span>
            {lastRun && (
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                background: RISK_STYLE[lastRun.risk_level]?.bg || '#f1f5f9',
                color:      RISK_STYLE[lastRun.risk_level]?.color || '#64748b',
                border:     `1px solid ${RISK_STYLE[lastRun.risk_level]?.border || '#e2e8f0'}`,
                padding: '2px 8px', borderRadius: 8,
              }}>{lastRun.risk_level}</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10, lineHeight: 1.5 }}>
            {agent.description}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: 11, fontWeight: 600, color: agent.color,
              background: agent.bg, padding: '3px 10px',
              borderRadius: 6, border: `1px solid ${agent.border}`,
            }}>{agent.role}</span>

            <button
              onClick={e => { e.stopPropagation(); onRun(agent.type); }}
              disabled={loading}
              style={{
                background:    loading ? '#f1f5f9' : agent.color,
                color:         loading ? '#94a3b8'  : '#fff',
                border:        'none',
                borderRadius:  8,
                padding:       '7px 18px',
                fontSize:      12,
                fontWeight:    700,
                cursor:        loading ? 'wait' : 'pointer',
                display:       'flex',
                alignItems:    'center',
                gap:           8,
                transition:    'all 0.15s',
              }}
            >
              {loading ? <><ThinkingDots /> Analyzing…</> : '▶ Run Analysis'}
            </button>
          </div>
          {lastRun && (
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 8 }}>
              Last run: {new Date(lastRun.run_at).toLocaleString()} · {(lastRun.elapsed_ms / 1000).toFixed(1)}s
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Metrics Grid ───────────────────────────────────────────────────────────
function MetricsGrid({ metrics }) {
  if (!metrics?.length) return null;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: 10, marginBottom: 20,
    }}>
      {metrics.map((m, i) => {
        const s = STATUS_STYLE[m.status] || STATUS_STYLE.ok;
        return (
          <div key={i} style={{
            background: s.bg, border: `1.5px solid ${s.border}`,
            borderRadius: 10, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500, marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{m.value}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Risks List ─────────────────────────────────────────────────────────────
function RisksList({ risks }) {
  if (!risks?.length) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10, letterSpacing: 0.3 }}>
        ⚠ Risk Findings ({risks.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {risks.map((r, i) => {
          const s = SEV_STYLE[r.severity] || SEV_STYLE.LOW;
          return (
            <div key={i} style={{
              background: '#fff', border: '1.5px solid #e2e8f0',
              borderLeft: `4px solid ${r.severity === 'HIGH' ? '#dc2626' : r.severity === 'MEDIUM' ? '#d97706' : '#16a34a'}`,
              borderRadius: '0 8px 8px 0', padding: '10px 14px',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px',
                background: s.bg, color: s.color,
                borderRadius: 6, flexShrink: 0, marginTop: 1,
              }}>{s.label}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 2 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{r.detail}</div>
                {r.domain && (
                  <span style={{
                    fontSize: 10, color: '#94a3b8', fontWeight: 600,
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    padding: '1px 6px', borderRadius: 4, marginTop: 4, display: 'inline-block',
                  }}>{r.domain}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Actions List ───────────────────────────────────────────────────────────
function ActionsList({ actions }) {
  if (!actions?.length) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10, letterSpacing: 0.3 }}>
        ✅ Recommended Actions ({actions.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {actions.map((a, i) => {
          const dl = DEADLINE_STYLE[a.deadline] || DEADLINE_STYLE['This Quarter'];
          return (
            <div key={i} style={{
              background: '#fff', border: '1.5px solid #e2e8f0',
              borderRadius: 8, padding: '10px 14px',
              display: 'flex', gap: 14, alignItems: 'flex-start',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#1e293b', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, flexShrink: 0,
              }}>{a.priority}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 2 }}>{a.action}</div>
                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{a.rationale}</div>
              </div>
              {a.deadline && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: dl.bg, color: dl.color,
                  padding: '3px 9px', borderRadius: 6, flexShrink: 0,
                }}>{a.deadline}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Report Sections ────────────────────────────────────────────────────────
function Sections({ sections }) {
  if (!sections?.length) return null;
  return (
    <div>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10, letterSpacing: 0.3 }}>
        📋 Analysis Sections
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {sections.map((s, i) => (
          <div key={i} style={{
            background: '#f8fafc', border: '1.5px solid #e2e8f0',
            borderRadius: 10, padding: '14px 16px',
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>{s.title}</div>
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.65 }}>{s.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main AgentHub ──────────────────────────────────────────────────────────
export default function AgentHub() {
  const [loadingType, setLoadingType]   = useState(null);
  const [reports, setReports]           = useState({});    // type → AgentReport
  const [activeReport, setActiveReport] = useState(null);  // currently displayed type
  const [error, setError]               = useState(null);

  async function handleRun(type) {
    setLoadingType(type);
    setActiveReport(type);
    setError(null);
    try {
      const res = await fetch(`${API}/${type}/run`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token()}`,
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const report = await res.json();
      setReports(prev => ({ ...prev, [type]: report }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingType(null);
    }
  }

  const report     = activeReport ? reports[activeReport] : null;
  const activeAgent = AGENTS.find(a => a.type === activeReport);
  const riskStyle  = report ? (RISK_STYLE[report.risk_level] || RISK_STYLE.MEDIUM) : null;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 0 40px' }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>✦</span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Sierra Agentic AI
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
              Autonomous domain agents — pre-fetch all data, synthesize with GPT-4o, return structured intelligence reports.
            </p>
          </div>
        </div>
        <div style={{
          background: '#f0f9ff', border: '1px solid #bae6fd',
          borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#0369a1',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          ℹ Each agent independently reviews its full domain and returns risk findings, prioritized actions, and a strategic summary.
        </div>
      </div>

      {/* ── Agent Cards grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 14, marginBottom: 28,
      }}>
        {AGENTS.map(agent => (
          <AgentCard
            key={agent.type}
            agent={agent}
            loading={loadingType === agent.type}
            lastRun={reports[agent.type]}
            active={activeReport === agent.type}
            onRun={handleRun}
          />
        ))}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1.5px solid #fecaca',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10,
          color: '#dc2626', fontSize: 13, fontWeight: 500,
        }}>
          ✗ Agent error: {error}
        </div>
      )}

      {/* ── Loading state ── */}
      {loadingType && !report && (
        <div style={{
          background: '#fff', border: '1.5px solid #e2e8f0',
          borderRadius: 14, padding: '48px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          color: '#64748b',
        }}>
          <div style={{ fontSize: 48 }}>{AGENTS.find(a => a.type === loadingType)?.icon}</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>
            {AGENTS.find(a => a.type === loadingType)?.name} is running…
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <ThinkingDots /> Fetching data and synthesizing analysis with GPT-4o
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', maxWidth: 400 }}>
            The agent is pre-fetching all domain data in parallel, then generating a structured intelligence report.
            This typically takes 10–30 seconds.
          </div>
        </div>
      )}

      {/* ── Report Viewer ── */}
      {report && !loadingType && activeAgent && (
        <div style={{
          background: '#fff', border: `2px solid ${activeAgent.border}`,
          borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        }}>
          {/* Report header */}
          <div style={{
            background:    activeAgent.bg,
            borderBottom:  `2px solid ${activeAgent.border}`,
            padding:       '20px 24px',
            display:       'flex',
            alignItems:    'flex-start',
            gap:           16,
          }}>
            <div style={{
              fontSize: 36, width: 60, height: 60,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#fff', borderRadius: 12,
              border: `1.5px solid ${activeAgent.border}`,
              flexShrink: 0,
            }}>{activeAgent.icon}</div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 17, color: '#0f172a' }}>
                  {report.agent_name}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 800, letterSpacing: 0.8,
                  background: riskStyle.bg, color: riskStyle.color,
                  border: `1.5px solid ${riskStyle.border}`,
                  padding: '3px 12px', borderRadius: 8,
                }}>
                  {report.risk_level} RISK
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  {new Date(report.run_at).toLocaleString()} · {(report.elapsed_ms / 1000).toFixed(1)}s
                </span>
              </div>

              {/* Summary */}
              <div style={{
                fontSize: 13, color: '#334155', lineHeight: 1.7,
                background: '#fff', borderRadius: 8,
                border: `1px solid ${activeAgent.border}`,
                padding: '10px 14px',
              }}>
                {report.summary}
              </div>
            </div>
          </div>

          {/* Report body */}
          <div style={{ padding: '24px 24px' }}>
            <MetricsGrid  metrics={report.headline_metrics} />
            <RisksList    risks={report.risks} />
            <ActionsList  actions={report.actions} />
            <Sections     sections={report.sections} />
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!report && !loadingType && !error && (
        <div style={{
          background: '#f8fafc', border: '2px dashed #e2e8f0',
          borderRadius: 14, padding: '48px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 10, color: '#94a3b8', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40 }}>✦</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#64748b' }}>Select an agent to run analysis</div>
          <div style={{ fontSize: 12, maxWidth: 400 }}>
            Click "Run Analysis" on any agent card above to trigger an autonomous intelligence review.
            Results include risk findings, prioritized actions, and a full domain briefing.
          </div>
        </div>
      )}
    </div>
  );
}
