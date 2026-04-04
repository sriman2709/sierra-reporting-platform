import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import useData from '../components/useData';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';

const fmt$ = n =>
  n == null ? '—' : Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtM = n =>
  n == null ? '—' : `$${(Number(n) / 1_000_000).toFixed(1)}M`;
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtN = n => n == null ? '—' : Number(n).toLocaleString('en-US', { maximumFractionDigits: 1 });

const TABS = ['Overview', 'Projects', 'Milestones', 'Funding'];

const HEALTH_COLOR = { GREEN: '#38a169', YELLOW: '#d69e2e', RED: '#e53e3e', GREY: '#a0aec0' };
const HEALTH_BG    = { GREEN: '#f0fff4', YELLOW: '#fffbeb', RED: '#fff5f5', GREY: '#f7fafc' };

const TYPE_COLOR = {
  ROAD: '#3182ce', BRIDGE: '#2b6cb0', BUILDING: '#805ad5',
  PARKS: '#38a169', UTILITY: '#2c7a7b', IT: '#d69e2e', OTHER: '#718096',
};

const SOURCE_COLOR = {
  BOND:                 '#3182ce',
  GRANT:                '#38a169',
  GENERAL_FUND:         '#805ad5',
  SPECIAL_ASSESSMENT:   '#2c7a7b',
  DEVELOPER_CONTRIBUTION:'#d69e2e',
};

const MILESTONE_STATUS_COLOR = {
  COMPLETED:   '#38a169',
  IN_PROGRESS: '#3182ce',
  AT_RISK:     '#e53e3e',
  NOT_STARTED: '#a0aec0',
};

const CO_STATUS_COLOR = {
  APPROVED: '#38a169',
  PENDING:  '#d69e2e',
  REJECTED: '#e53e3e',
};

const CO_REASON_COLOR = {
  SCOPE_CHANGE:          '#805ad5',
  UNFORESEEN_CONDITIONS: '#e53e3e',
  DESIGN_ERROR:          '#e53e3e',
  OWNER_REQUEST:         '#3182ce',
  WEATHER:               '#2c7a7b',
  REGULATORY:            '#d69e2e',
};

function Badge({ value, colorMap, defaultColor = '#718096' }) {
  const color = colorMap?.[value] || defaultColor;
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
      background: color + '22', color,
    }}>{value || '—'}</span>
  );
}

function ProgressBar({ pct, color, thin }) {
  const p = Math.max(0, Math.min(100, Number(pct || 0)));
  const c = color || (p > 100 ? '#e53e3e' : p >= 90 ? '#d69e2e' : '#38a169');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: thin ? 6 : 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', minWidth: 80 }}>
        <div style={{ width: `${Math.min(p, 100)}%`, height: '100%', background: c, borderRadius: 4, transition: 'width .4s' }} />
      </div>
      <span style={{ fontWeight: 700, fontSize: 12, color: c, minWidth: 38 }}>{p}%</span>
    </div>
  );
}

function HealthDot({ status }) {
  const color = HEALTH_COLOR[status] || '#718096';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span style={{ color, fontWeight: 700, fontSize: 12 }}>{status}</span>
    </span>
  );
}

function HealthSummaryBadge({ label, count, color }) {
  return (
    <div style={{
      background: color + '15', border: `2px solid ${color}33`, borderRadius: 10,
      padding: '14px 24px', textAlign: 'center', minWidth: 120,
    }}>
      <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#718096', marginTop: 4 }}>{label}</div>
    </div>
  );
}

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {p.name.includes('Budget') || p.name.includes('Spent') || p.name.includes('$') ? fmt$(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

export default function CapitalProjects() {
  const [tab, setTab] = useState('Overview');

  const { data: kpis,    loading: kL  } = useData('/capital/kpis');
  const { data: projects,loading: pL  } = useData('/capital/projects');
  const { data: milestones, loading: mL } = useData('/capital/milestones');
  const { data: changeOrders, loading: cL } = useData('/capital/change-orders');
  const { data: funding, loading: fL  } = useData('/capital/funding');
  const { data: cipSummary, loading: sL } = useData('/capital/cip-summary');

  const k = kpis || {};

  // CIP Summary chart data
  const cipChartData = (cipSummary || []).map(r => ({
    name: r.project_type || r.PROJECT_TYPE,
    Budget: Number(r.TOTAL_BUDGET || 0),
    Spent:  Number(r.TOTAL_SPENT  || 0),
    count:  Number(r.PROJECT_COUNT || 0),
  }));

  // Funding by source type
  const fundingBySource = (funding || []).reduce((acc, f) => {
    const t = f.source_type;
    if (!acc[t]) acc[t] = 0;
    acc[t] += Number(f.allocated_amount || 0);
    return acc;
  }, {});
  const fundingChartData = Object.entries(fundingBySource).map(([name, value]) => ({ name, value }));

  // Milestone summary
  const msBreakdown = (milestones || []).reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* KPI Row */}
      <div className="kpi-grid">
        <KpiCard label="Total CIP Budget"     value={fmtM(k.total_cip_budget)} color="green" />
        <KpiCard label="Spent to Date"        value={fmtM(k.total_spent)} />
        <KpiCard label="Budget Remaining"     value={fmtM(k.total_remaining)} color={Number(k.total_remaining) < 0 ? 'red' : ''} />
        <KpiCard label="Active Projects"      value={k.active_projects ?? '…'} />
        <KpiCard label="Red Health"           value={k.red_projects ?? '…'} color={Number(k.red_projects) > 0 ? 'red' : ''} />
        <KpiCard label="Pending Change Orders" value={k.pending_change_orders ?? '…'} color={Number(k.pending_change_orders) > 0 ? 'yellow' : ''} />
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'Overview' && (
        <div>
          {/* Health summary cards */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <HealthSummaryBadge label="GREEN — On Track"   count={k.green_projects  ?? '…'} color={HEALTH_COLOR.GREEN}  />
            <HealthSummaryBadge label="YELLOW — At Risk"   count={k.yellow_projects ?? '…'} color={HEALTH_COLOR.YELLOW} />
            <HealthSummaryBadge label="RED — Critical"     count={k.red_projects    ?? '…'} color={HEALTH_COLOR.RED}    />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* CIP Budget by Type */}
            <SectionCard title="CIP Budget & Spend by Project Type">
              {sL ? <div className="loading">Loading…</div> : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={cipChartData} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `$${(v/1e6).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CUSTOM_TOOLTIP />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Budget" name="Total Budget" fill="#3182ce" radius={[3,3,0,0]} />
                    <Bar dataKey="Spent"  name="Spent to Date" fill="#38a169" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </SectionCard>

            {/* Funding sources */}
            <SectionCard title="Funding Sources — Allocated Mix">
              {fL ? <div className="loading">Loading…</div> : (
                <div>
                  {fundingChartData.map(s => {
                    const total = fundingChartData.reduce((a, x) => a + x.value, 0);
                    const pct = total > 0 ? (s.value / total * 100).toFixed(1) : 0;
                    const color = SOURCE_COLOR[s.name] || '#718096';
                    return (
                      <div key={s.name} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                          <span style={{ fontWeight: 600, color }}>{s.name.replace(/_/g, ' ')}</span>
                          <span style={{ color: '#718096' }}>{fmt$(s.value)} <strong style={{ color }}>({pct}%)</strong></span>
                        </div>
                        <ProgressBar pct={pct} color={color} />
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          </div>

          {/* Milestone status summary */}
          <SectionCard title="Milestone Status Summary" style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {Object.entries(MILESTONE_STATUS_COLOR).map(([status, color]) => (
                <div key={status} style={{
                  background: color + '15', border: `1px solid ${color}44`,
                  borderRadius: 8, padding: '12px 20px', textAlign: 'center', minWidth: 130,
                }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color }}>{msBreakdown[status] || 0}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#718096', marginTop: 2 }}>{status.replace('_', ' ')}</div>
                </div>
              ))}
              <div style={{
                background: '#f7fafc', border: '1px solid #e2e8f0',
                borderRadius: 8, padding: '12px 20px', textAlign: 'center', minWidth: 130,
              }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#2d3748' }}>{milestones?.length || 0}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#718096', marginTop: 2 }}>TOTAL MILESTONES</div>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Projects ── */}
      {tab === 'Projects' && (
        <SectionCard title={`Capital Project Health Dashboard (${projects?.length ?? '…'} projects)`}>
          {pL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Project #</th><th>Name</th><th>Type</th><th>Phase</th>
                <th>Budget</th><th>Spend %</th><th>COs</th><th>Milestones</th>
                <th>Health</th><th>Status</th>
              </tr></thead>
              <tbody>
                {(projects || []).map(p => {
                  const spendPct = Number(p.SPEND_PCT || 0);
                  const health = p.HEALTH_STATUS || 'GREEN';
                  const bgColor = HEALTH_BG[health] || '#fff';
                  return (
                    <tr key={p.project_id} style={{ background: health === 'RED' ? '#fff5f5' : health === 'YELLOW' ? '#fffbeb' : undefined }}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.project_number}</td>
                      <td style={{ fontWeight: 600, maxWidth: 200 }}>
                        {p.project_name}
                        <div style={{ fontSize: 11, color: '#718096', fontWeight: 400 }}>{p.department}</div>
                      </td>
                      <td><Badge value={p.project_type} colorMap={TYPE_COLOR} /></td>
                      <td><Badge value={p.phase} /></td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {fmt$(p.total_budget)}
                        {Number(p.APPROVED_CO_IMPACT) !== 0 && (
                          <div style={{ fontSize: 10, color: Number(p.APPROVED_CO_IMPACT) > 0 ? '#e53e3e' : '#38a169' }}>
                            CO: {Number(p.APPROVED_CO_IMPACT) > 0 ? '+' : ''}{fmt$(p.APPROVED_CO_IMPACT)}
                          </div>
                        )}
                      </td>
                      <td style={{ minWidth: 130 }}>
                        <ProgressBar pct={spendPct} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: Number(p.CHANGE_ORDER_COUNT) > 0 ? 700 : 400 }}>
                          {p.CHANGE_ORDER_COUNT || 0}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: 12 }}>
                        <span style={{ color: '#38a169', fontWeight: 700 }}>{p.MILESTONES_COMPLETE || 0}</span>
                        <span style={{ color: '#a0aec0' }}>/{p.TOTAL_MILESTONES || 0}</span>
                        {Number(p.MILESTONES_AT_RISK) > 0 && (
                          <span style={{ color: '#e53e3e', marginLeft: 4, fontWeight: 700 }}>
                            ⚠{p.MILESTONES_AT_RISK}
                          </span>
                        )}
                      </td>
                      <td><HealthDot status={health} /></td>
                      <td><StatusBadge value={p.project_status} /></td>
                    </tr>
                  );
                })}
                {!(projects || []).length && (
                  <tr><td colSpan={10} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No project data found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* ── Milestones ── */}
      {tab === 'Milestones' && (
        <div>
          {/* AT_RISK callout */}
          {(milestones || []).some(m => m.status === 'AT_RISK') && (
            <div style={{
              background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8,
              padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 18 }}>⚠</span>
              <span style={{ color: '#c53030', fontWeight: 600 }}>
                {(milestones || []).filter(m => m.status === 'AT_RISK').length} milestone(s) are AT RISK — review and update project plans
              </span>
            </div>
          )}

          <SectionCard title={`Milestone Tracker (${milestones?.length ?? '…'} milestones)`}>
            {mL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Project</th><th>Milestone</th><th>Type</th>
                  <th>Planned</th><th>Actual</th><th>Progress</th>
                  <th>Responsible</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {(milestones || []).map(m => {
                    const color = MILESTONE_STATUS_COLOR[m.status] || '#718096';
                    return (
                      <tr key={m.milestone_id} style={{ background: m.status === 'AT_RISK' ? '#fff5f5' : undefined }}>
                        <td style={{ fontSize: 12 }}>
                          <span style={{ fontFamily: 'monospace', color: '#718096' }}>{m.project_number}</span>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{m.project_name}</div>
                        </td>
                        <td style={{ fontWeight: 500, maxWidth: 200 }}>
                          {m.milestone_name}
                          {m.notes && <div style={{ fontSize: 11, color: '#718096' }}>{m.notes}</div>}
                        </td>
                        <td><Badge value={m.milestone_type} /></td>
                        <td>{fmtDate(m.planned_date)}</td>
                        <td>{fmtDate(m.actual_date) || <span style={{ color: '#a0aec0' }}>Pending</span>}</td>
                        <td style={{ minWidth: 130 }}>
                          <ProgressBar pct={m.completion_pct} color={color} thin />
                        </td>
                        <td style={{ fontSize: 12 }}>{m.responsible_party}</td>
                        <td>
                          <span style={{
                            padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                            background: color + '22', color,
                          }}>
                            {m.status?.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {!(milestones || []).length && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No milestone data found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Funding ── */}
      {tab === 'Funding' && (
        <div>
          {/* Change orders banner */}
          {(changeOrders || []).some(co => co.status === 'PENDING') && (
            <div style={{
              background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: 8,
              padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 18 }}>📋</span>
              <span style={{ color: '#744210', fontWeight: 600 }}>
                {(changeOrders || []).filter(co => co.status === 'PENDING').length} change order(s) pending approval —
                total cost impact: {fmt$((changeOrders || []).filter(co => co.status === 'PENDING').reduce((a, co) => a + Number(co.cost_impact || 0), 0))}
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Funding table */}
            <SectionCard title={`Project Funding Sources (${funding?.length ?? '…'})`}>
              {fL ? <div className="loading">Loading…</div> : (
                <table className="data-table">
                  <thead><tr>
                    <th>Project</th><th>Source</th><th>Allocated</th><th>Drawn</th><th>Draw %</th>
                  </tr></thead>
                  <tbody>
                    {(funding || []).map(f => {
                      const color = SOURCE_COLOR[f.source_type] || '#718096';
                      return (
                        <tr key={f.funding_id}>
                          <td style={{ fontSize: 12 }}>
                            <span style={{ fontFamily: 'monospace', color: '#718096', fontSize: 11 }}>{f.project_number}</span>
                            <div style={{ fontWeight: 500 }}>{f.project_name}</div>
                          </td>
                          <td>
                            <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: color + '22', color }}>
                              {f.source_type?.replace(/_/g, ' ')}
                            </span>
                            <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>{f.source_name}</div>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(f.allocated_amount)}</td>
                          <td style={{ textAlign: 'right' }}>{fmt$(f.drawn_amount)}</td>
                          <td style={{ minWidth: 100 }}><ProgressBar pct={f.DRAW_PCT} thin /></td>
                        </tr>
                      );
                    })}
                    {!(funding || []).length && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No funding data found</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </SectionCard>

            {/* Change orders */}
            <SectionCard title={`Change Orders (${changeOrders?.length ?? '…'})`}>
              {cL ? <div className="loading">Loading…</div> : (
                <table className="data-table">
                  <thead><tr>
                    <th>Project</th><th>CO #</th><th>Reason</th>
                    <th>Cost Impact</th><th>Sched. Days</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {(changeOrders || []).map(co => {
                      const costColor = Number(co.cost_impact) > 0 ? '#e53e3e' : '#38a169';
                      return (
                        <tr key={co.change_order_id} style={{ background: co.status === 'PENDING' ? '#fffbeb' : undefined }}>
                          <td style={{ fontSize: 12 }}>
                            <span style={{ fontFamily: 'monospace', color: '#718096', fontSize: 11 }}>{co.project_number}</span>
                            <div style={{ fontWeight: 500, maxWidth: 140 }}>{co.project_name}</div>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{co.co_number}</td>
                          <td><Badge value={co.reason} colorMap={CO_REASON_COLOR} /></td>
                          <td style={{ textAlign: 'right', color: costColor, fontWeight: 700 }}>
                            {Number(co.cost_impact) > 0 ? '+' : ''}{fmt$(co.cost_impact)}
                          </td>
                          <td style={{ textAlign: 'center', color: Number(co.schedule_impact_days) > 0 ? '#e53e3e' : '#38a169', fontWeight: 700 }}>
                            {Number(co.schedule_impact_days) > 0 ? `+${co.schedule_impact_days}d` : `${co.schedule_impact_days}d`}
                          </td>
                          <td>
                            <Badge value={co.status} colorMap={CO_STATUS_COLOR} />
                          </td>
                        </tr>
                      );
                    })}
                    {!(changeOrders || []).length && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No change orders found</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}
