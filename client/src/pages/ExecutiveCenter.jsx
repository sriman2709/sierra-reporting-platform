import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import useData from '../components/useData';
import SectionCard from '../components/SectionCard';

/* ── Formatters ──────────────────────────────────────────────────────────── */
const fmt$ = n =>
  n == null ? '—' : Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtM = n =>
  n == null ? '—' : `$${(Number(n) / 1_000_000).toFixed(2)}M`;
const fmtPct = n => n == null ? '—' : `${Number(n).toFixed(1)}%`;
const fmtNum = n => n == null ? '—' : Number(n).toLocaleString();
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const TABS = ['Command Center', 'Risk & Alerts', 'KPI Benchmarks', 'Budget vs Actual'];

/* ── Colour palette ─────────────────────────────────────────────────────── */
const SEVERITY_COLOR  = { HIGH: '#e53e3e', MEDIUM: '#d69e2e', LOW: '#38a169' };
const DOMAIN_COLORS   = ['#3182ce','#38a169','#805ad5','#d69e2e','#e53e3e','#0097a7','#dd6b20','#2c7a7b'];
const TREND_COLOR     = { UP: '#38a169', DOWN: '#e53e3e', STABLE: '#d69e2e' };
const TREND_ICON      = { UP: '↑', DOWN: '↓', STABLE: '→' };

/* ── Reusable components ────────────────────────────────────────────────── */
function Badge({ value, colorMap, defaultColor = '#718096' }) {
  const color = colorMap?.[value] ?? defaultColor;
  return (
    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
      background: color + '22', color, whiteSpace: 'nowrap' }}>
      {value?.replace(/_/g, ' ') || '—'}
    </span>
  );
}

/* Domain scorecard tile */
function DomainTile({ icon, domain, kpis, color, riskCount = 0 }) {
  return (
    <div style={{ background: '#fff', border: `1.5px solid ${color}33`, borderRadius: 12,
      padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
      {/* top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: color }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#1a202c' }}>{domain}</span>
        </div>
        {riskCount > 0 && (
          <span style={{ background: '#e53e3e', color: '#fff', borderRadius: 10,
            fontSize: 10, fontWeight: 800, padding: '1px 7px', lineHeight: '16px' }}>
            {riskCount} ALERT{riskCount > 1 ? 'S' : ''}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {kpis.map(({ label, value, highlight }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#718096' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 700,
              color: highlight === 'red' ? '#e53e3e' : highlight === 'green' ? '#38a169' : highlight === 'blue' ? color : '#1a202c' }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* KPI benchmark card */
function BenchmarkCard({ kpi, color }) {
  const curr    = Number(kpi.current_value || 0);
  const target  = Number(kpi.target_value || 0);
  const peer    = Number(kpi.peer_avg || 0);
  const pctOfTarget = target > 0 ? Math.min(100, (curr / target) * 100) : 0;
  const trendColor  = TREND_COLOR[kpi.trend] || '#718096';
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>
            {kpi.domain}
          </div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1a202c', marginTop: 2 }}>{kpi.kpi_name}</div>
        </div>
        <span style={{ color: trendColor, fontWeight: 800, fontSize: 16 }}>
          {TREND_ICON[kpi.trend] || '→'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color }}>{kpi.current_value}{kpi.unit === 'pct' ? '%' : ''}</span>
        <span style={{ fontSize: 12, color: '#718096' }}>{kpi.unit === 'pct' ? '' : kpi.unit}</span>
      </div>
      <div style={{ background: '#e2e8f0', borderRadius: 4, height: 6, marginBottom: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pctOfTarget}%`, height: '100%', background: pctOfTarget >= 100 ? '#38a169' : pctOfTarget >= 80 ? color : '#e53e3e',
          borderRadius: 4, transition: 'width .4s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#718096' }}>
        <span>Target: <strong>{target}{kpi.unit === 'pct' ? '%' : ''}</strong></span>
        <span>Peer Avg: <strong>{peer}{kpi.unit === 'pct' ? '%' : ''}</strong></span>
        <span style={{ color: pctOfTarget >= 100 ? '#38a169' : '#d69e2e', fontWeight: 700 }}>
          {pctOfTarget.toFixed(0)}% of target
        </span>
      </div>
    </div>
  );
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
      padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 1000 ? fmt$(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

/* ── Main component ─────────────────────────────────────────────────────── */
export default function ExecutiveCenter() {
  const [tab, setTab] = useState('Command Center');

  const { data: kpis,       loading: kL }  = useData('/executive/kpis');
  const { data: alerts,     loading: aL }  = useData('/executive/alerts');
  const { data: benchmarks, loading: bL }  = useData('/executive/benchmarks');
  const { data: grantTrend, loading: gL }  = useData('/executive/grant-trend');
  const { data: domainRisk, loading: drL } = useData('/executive/domain-risk');
  const { data: budgetAct,  loading: baL } = useData('/executive/budget-actual');

  const k           = kpis && !Array.isArray(kpis) ? kpis : {};
  const safeAlerts  = Array.isArray(alerts)     ? alerts     : [];
  const safeBench   = Array.isArray(benchmarks) ? benchmarks : [];
  const safeGrant   = Array.isArray(grantTrend) ? grantTrend : [];
  const safeDR      = Array.isArray(domainRisk) ? domainRisk : [];
  const safeBA      = Array.isArray(budgetAct)  ? budgetAct  : [];

  /* Alert counts by domain */
  const alertsByDomain = safeAlerts.reduce((acc, a) => {
    acc[a.domain] = (acc[a.domain] || 0) + 1; return acc;
  }, {});
  const highAlerts = safeAlerts.filter(a => a.severity === 'HIGH').length;

  /* Risk radar data */
  const radarData = safeDR.map(r => ({
    domain: r.domain,
    Alerts: Number(r.total_alerts || 0),
    High:   Number(r.high_count   || 0),
  }));

  /* Budget utilisation bar chart */
  const budgetChart = safeBA.map(r => ({
    name: r.department,
    Budget:    Number(r.total_budget || 0),
    Actual:    Number(r.total_actual || 0),
  }));

  return (
    <div>
      {/* ── Global alert banner ── */}
      {highAlerts > 0 && (
        <div style={{ background: 'linear-gradient(135deg,#fff5f5,#fed7d7)', border: '1.5px solid #fc8181',
          borderRadius: 10, padding: '14px 20px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>🚨</span>
          <div>
            <span style={{ color: '#c53030', fontWeight: 800, fontSize: 14 }}>
              {highAlerts} HIGH-severity alert{highAlerts > 1 ? 's' : ''} require executive attention
            </span>
            <div style={{ fontSize: 12, color: '#c53030', marginTop: 2 }}>
              Switch to Risk & Alerts tab for details and recommended actions.
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t}
            {t === 'Risk & Alerts' && safeAlerts.length > 0 && (
              <span style={{ marginLeft: 6, background: highAlerts > 0 ? '#e53e3e' : '#d69e2e',
                color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 800, padding: '0 6px' }}>
                {safeAlerts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          COMMAND CENTER TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'Command Center' && (
        <div>
          {/* Executive headline metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
            {[
              { label: 'Total Cash Position',   value: fmtM(k.total_cash_position), color: '#2b6cb0', bg: '#ebf8ff' },
              { label: 'Tax Revenue YTD',        value: fmtM(k.tax_revenue_ytd),    color: '#276749', bg: '#f0fff4' },
              { label: 'Total Expenditures YTD', value: fmtM(k.total_expenditures_ytd), color: '#744210', bg: '#fffbeb' },
              { label: 'Capital Spend YTD',      value: fmtM(k.capital_spend_ytd),  color: '#553c9a', bg: '#f3e8fd' },
            ].map(m => (
              <div key={m.label} style={{ background: m.bg, borderRadius: 10, padding: '16px 18px',
                border: `1px solid ${m.color}33` }}>
                <div style={{ fontSize: 11, color: '#718096', marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Domain tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            <DomainTile icon="🏛" domain="Grants Management" color="#3182ce"
              riskCount={alertsByDomain['GRANTS'] || 0}
              kpis={[
                { label: 'Active Grants',    value: fmtNum(k.active_grants), highlight: 'blue' },
                { label: 'Total Awards',     value: fmtM(k.total_grant_awards) },
              ]} />
            <DomainTile icon="🛒" domain="Procurement & AP" color="#805ad5"
              riskCount={alertsByDomain['PROCUREMENT'] || 0}
              kpis={[
                { label: 'Open POs',              value: fmtNum(k.open_pos), highlight: k.open_pos > 10 ? 'red' : 'green' },
                { label: 'Pending Invoice Value', value: fmtM(k.pending_invoice_value), highlight: 'blue' },
              ]} />
            <DomainTile icon="🏗" domain="Capital Projects" color="#d69e2e"
              riskCount={alertsByDomain['CAPITAL'] || 0}
              kpis={[
                { label: 'Active Projects', value: fmtNum(k.active_projects), highlight: 'blue' },
                { label: 'Spend YTD',       value: fmtM(k.capital_spend_ytd) },
              ]} />
            <DomainTile icon="🔧" domain="Assets & Maintenance" color="#e53e3e"
              riskCount={alertsByDomain['ASSETS'] || 0}
              kpis={[
                { label: 'Total Assets',     value: fmtNum(k.total_assets) },
                { label: 'Open Work Orders', value: fmtNum(k.open_work_orders), highlight: k.open_work_orders > 20 ? 'red' : 'green' },
              ]} />
            <DomainTile icon="👥" domain="HR & Workforce" color="#38a169"
              riskCount={alertsByDomain['HR'] || 0}
              kpis={[
                { label: 'Active Employees', value: fmtNum(k.active_employees) },
                { label: 'Vacant Positions', value: fmtNum(k.open_positions), highlight: k.open_positions > 5 ? 'red' : 'green' },
              ]} />
            <DomainTile icon="🚗" domain="Fleet Management" color="#0097a7"
              riskCount={alertsByDomain['FLEET'] || 0}
              kpis={[
                { label: 'Active Vehicles',  value: fmtNum(k.active_vehicles) },
                { label: 'Out of Service',   value: fmtNum(k.vehicles_oos), highlight: k.vehicles_oos > 0 ? 'red' : 'green' },
              ]} />
            <DomainTile icon="📦" domain="Inventory & Warehouse" color="#dd6b20"
              riskCount={alertsByDomain['INVENTORY'] || 0}
              kpis={[
                { label: 'Low Stock Items', value: fmtNum(k.low_stock_items), highlight: k.low_stock_items > 0 ? 'red' : 'green' },
              ]} />
            <DomainTile icon="🏦" domain="Treasury & Revenue" color="#2b6cb0"
              riskCount={alertsByDomain['TREASURY'] || 0}
              kpis={[
                { label: 'Cash Position', value: fmtM(k.total_cash_position), highlight: 'blue' },
                { label: 'Tax Rev YTD',   value: fmtM(k.tax_revenue_ytd) },
              ]} />
          </div>

          {/* Grant spend trend chart */}
          <SectionCard title="Grant Expenditure Trend — Last 6 Months">
            {gL ? <div className="loading">Loading…</div> : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={safeGrant} margin={{ top: 8, right: 16, left: 16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => [fmt$(v), 'Grant Spend']} />
                  <Line type="monotone" dataKey="grant_spend" stroke="#3182ce" strokeWidth={2.5}
                    dot={{ r: 4, fill: '#3182ce' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          RISK & ALERTS TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'Risk & Alerts' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Risk by domain */}
            <SectionCard title="Alert Distribution by Domain">
              {drL ? <div className="loading">Loading…</div> : (
                safeDR.length > 0 ? (
                  <table className="data-table">
                    <thead><tr>
                      <th>Domain</th><th style={{ textAlign: 'center' }}>HIGH</th>
                      <th style={{ textAlign: 'center' }}>MEDIUM</th>
                      <th style={{ textAlign: 'center' }}>LOW</th>
                      <th style={{ textAlign: 'center' }}>Total</th>
                    </tr></thead>
                    <tbody>
                      {safeDR.map(r => (
                        <tr key={r.domain}>
                          <td style={{ fontWeight: 600 }}>{r.domain}</td>
                          <td style={{ textAlign: 'center', color: '#e53e3e', fontWeight: 700 }}>{r.high_count || '—'}</td>
                          <td style={{ textAlign: 'center', color: '#d69e2e', fontWeight: 700 }}>{r.medium_count || '—'}</td>
                          <td style={{ textAlign: 'center', color: '#38a169', fontWeight: 700 }}>{r.low_count || '—'}</td>
                          <td style={{ textAlign: 'center', fontWeight: 800 }}>{r.total_alerts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', color: '#38a169', padding: 32, fontWeight: 700 }}>
                    ✅ No open alerts — all domains healthy
                  </div>
                )
              )}
            </SectionCard>

            {/* Alert severity breakdown pie */}
            <SectionCard title="Alert Severity Breakdown">
              {aL ? <div className="loading">Loading…</div> : (() => {
                const sevCounts = safeAlerts.reduce((acc, a) => {
                  acc[a.severity] = (acc[a.severity] || 0) + 1; return acc;
                }, {});
                const sevData = Object.entries(sevCounts).map(([k, v]) => ({ name: k, value: v }));
                return sevData.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie data={sevData} cx="50%" cy="50%" innerRadius={44} outerRadius={72} dataKey="value">
                          {sevData.map((d, i) => (
                            <Cell key={i} fill={SEVERITY_COLOR[d.name] || '#718096'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ flex: 1 }}>
                      {sevData.map(d => {
                        const c = SEVERITY_COLOR[d.name] || '#718096';
                        return (
                          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <span style={{ width: 12, height: 12, borderRadius: 3, background: c, flexShrink: 0 }} />
                            <span style={{ color: c, fontWeight: 700, flex: 1 }}>{d.name}</span>
                            <span style={{ fontWeight: 800, color: c }}>{d.value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#38a169', padding: 32, fontWeight: 700 }}>
                    ✅ No open alerts
                  </div>
                );
              })()}
            </SectionCard>
          </div>

          {/* Full alert list */}
          <SectionCard title={`Open Alerts & Exceptions (${safeAlerts.length})`}>
            {aL ? <div className="loading">Loading…</div> : (
              safeAlerts.length > 0 ? (
                <table className="data-table">
                  <thead><tr>
                    <th>Severity</th><th>Domain</th><th>Alert</th>
                    <th>Description</th><th>Created</th><th>Assigned To</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {safeAlerts.map(a => {
                      const sc = SEVERITY_COLOR[a.severity] || '#718096';
                      return (
                        <tr key={a.alert_id}
                          style={{ background: a.severity === 'HIGH' ? '#fff5f5' : a.severity === 'MEDIUM' ? '#fffbeb' : undefined }}>
                          <td>
                            <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800,
                              background: sc + '22', color: sc }}>
                              {a.severity}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600, fontSize: 12 }}>{a.domain}</td>
                          <td style={{ fontWeight: 700, maxWidth: 180 }}>{a.title}</td>
                          <td style={{ fontSize: 12, color: '#4a5568', maxWidth: 280 }}>{a.description}</td>
                          <td style={{ fontSize: 12 }}>{fmtDate(a.created_date)}</td>
                          <td style={{ fontSize: 12 }}>{a.assigned_to || '—'}</td>
                          <td>
                            <Badge value={a.status} colorMap={{
                              OPEN: '#e53e3e', ACKNOWLEDGED: '#d69e2e', RESOLVED: '#38a169'
                            }} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', color: '#38a169', padding: 40, fontWeight: 700, fontSize: 16 }}>
                  ✅ All clear — no open alerts across all domains
                </div>
              )
            )}
          </SectionCard>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          KPI BENCHMARKS TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'KPI Benchmarks' && (
        <div>
          {/* Group by domain */}
          {bL ? (
            <div className="loading">Loading benchmarks…</div>
          ) : safeBench.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#718096', padding: 40 }}>No benchmark data found</div>
          ) : (() => {
            const domains = [...new Set(safeBench.map(b => b.domain))];
            return domains.map((dom, di) => {
              const domBench = safeBench.filter(b => b.domain === dom);
              const color = DOMAIN_COLORS[di % DOMAIN_COLORS.length];
              return (
                <div key={dom} style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ height: 3, width: 24, background: color, borderRadius: 2 }} />
                    <span style={{ fontWeight: 800, fontSize: 13, color, letterSpacing: 1, textTransform: 'uppercase' }}>
                      {dom}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                    {domBench.map(b => <BenchmarkCard key={b.benchmark_id} kpi={b} color={color} />)}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          BUDGET VS ACTUAL TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'Budget vs Actual' && (
        <div>
          <SectionCard title="Budget vs Actual by Department (Current FY)" style={{ marginBottom: 20 }}>
            {baL ? <div className="loading">Loading…</div> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={budgetChart} margin={{ top: 8, right: 16, left: 16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
                  <Tooltip content={<ChartTip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Budget" fill="#90cdf4" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Actual" fill="#3182ce" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Department Budget Utilisation Detail">
            {baL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Department</th><th>Total Budget</th><th>Actual Spend</th>
                  <th>Variance</th><th>Utilisation</th>
                </tr></thead>
                <tbody>
                  {safeBA.map(r => {
                    const pct = Number(r.utilization_pct || 0);
                    const variance = Number(r.variance || 0);
                    const barColor = pct > 100 ? '#e53e3e' : pct >= 90 ? '#d69e2e' : '#38a169';
                    return (
                      <tr key={r.department}
                        style={{ background: pct > 100 ? '#fff5f5' : undefined }}>
                        <td style={{ fontWeight: 700 }}>{r.department}</td>
                        <td style={{ textAlign: 'right' }}>{fmt$(r.total_budget)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt$(r.total_actual)}</td>
                        <td style={{ textAlign: 'right', color: variance >= 0 ? '#38a169' : '#e53e3e', fontWeight: 700 }}>
                          {variance >= 0 ? '+' : ''}{fmt$(variance)}
                        </td>
                        <td style={{ minWidth: 160 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, background: '#e2e8f0', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: barColor, borderRadius: 4 }} />
                            </div>
                            <span style={{ fontWeight: 700, color: barColor, fontSize: 12, whiteSpace: 'nowrap' }}>
                              {fmtPct(pct)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!safeBA.length && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No budget data available</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
