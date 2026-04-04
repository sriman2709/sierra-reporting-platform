import { useState } from 'react';
import useData from '../components/useData';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';

const fmtN  = n => n == null ? '—' : Number(n).toLocaleString('en-US', { maximumFractionDigits: 1 });
const fmt$  = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
const fmtPct = n => n == null ? '—' : (Number(n) > 0 ? '+' : '') + Number(n).toFixed(1) + '%';

const TABS = ['Scorecard', 'Effectiveness', 'Grant Linkage', 'Trend', 'Cost-Effectiveness', 'Metrics', 'Actuals'];

const TIER_COLOR = { HIGH: '#38a169', MEDIUM: '#3182ce', LOW: '#e53e3e' };
const EFF_COLOR  = { EFFICIENT: '#38a169', AT_PEER: '#3182ce', ABOVE_PEER: '#d69e2e', INEFFICIENT: '#e53e3e' };
const OUT_COLOR  = { ON_TRACK: '#38a169', AT_RISK: '#d69e2e', OFF_TRACK: '#e53e3e', NO_METRICS: '#718096', NO_ACTUALS: '#a0aec0' };

function exportCSV(rows, filename) {
  if (!rows?.length) return;
  const cols = Object.keys(rows[0]);
  const lines = [cols.join(','), ...rows.map(r =>
    cols.map(c => { const v = r[c] == null ? '' : String(r[c]);
      return v.includes(',') || v.includes('"') ? `"${v.replace(/"/g,'""')}"` : v;
    }).join(',')
  )];
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
  a.download = filename; a.click(); URL.revokeObjectURL(a.href);
}

function ScoreBar({ score, max = 100 }) {
  const pct = Math.max(0, Math.min(100, Number(score || 0)));
  const color = pct >= 75 ? '#38a169' : pct >= 50 ? '#3182ce' : '#e53e3e';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width .4s' }} />
      </div>
      <span style={{ fontWeight: 700, fontSize: 13, color, minWidth: 32 }}>{pct}</span>
    </div>
  );
}

export default function Outcomes() {
  const [tab, setTab]           = useState('Scorecard');
  const [trendMetric, setTrendMetric] = useState('');

  const { data: scorecard,       loading: sL  } = useData('/outcomes/scorecard');
  const { data: metrics,         loading: mL  } = useData('/outcomes/metrics');
  const { data: actuals,         loading: aL  } = useData('/outcomes/actuals');
  const { data: effectiveness,   loading: eL  } = useData('/outcomes/effectiveness');
  const { data: grantLinkage,    loading: gL  } = useData('/outcomes/grant-linkage');
  const { data: trend,           loading: tL  } = useData('/outcomes/trend');
  const { data: costEff,         loading: cL  } = useData('/outcomes/cost-effectiveness');
  const { data: kpis,            loading: kL  } = useData('/outcomes/kpis');

  const k = kpis || {};

  // Effectiveness KPIs
  const avgEff = effectiveness?.length
    ? Math.round((effectiveness || []).reduce((s, p) => s + Number(p.EFFECTIVENESS_SCORE || 0), 0) / effectiveness.length)
    : 0;
  const highEff = (effectiveness || []).filter(p => p.EFFECTIVENESS_TIER === 'HIGH').length;

  // Trend — build per-metric series
  const metricNames = [...new Set((trend || []).map(r => r.metric_name))];
  const selectedMetric = trendMetric || metricNames[0] || '';
  const trendSeries = (trend || [])
    .filter(r => r.metric_name === selectedMetric)
    .map(r => ({ period: `${r.fiscal_year} ${r.period}`, value: Number(r.actual_value || 0), status: r.performance_status }));

  return (
    <div>
      <div className="kpi-grid">
        <KpiCard label="Total Metrics"    value={k.total_metrics ?? '…'} />
        <KpiCard label="On Track"         value={k.on_track  ?? '…'} color="green" />
        <KpiCard label="At Risk"          value={k.at_risk   ?? '…'} color="yellow" />
        <KpiCard label="Off Track"        value={k.off_track ?? 0}   color="red" />
        <KpiCard label="Avg Effectiveness" value={avgEff ? `${avgEff}/100` : '…'} color={avgEff >= 50 ? 'green' : 'red'} />
        <KpiCard label="High-Performing"  value={highEff ?? '…'}     color="green" />
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* ── Scorecard ── */}
      {tab === 'Scorecard' && (
        <div className="two-col">
          <SectionCard title="Performance Status">
            {kL ? <div className="loading">Loading…</div> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart layout="vertical" margin={{ left: 20, right: 20 }}
                  data={[
                    { name: 'On Track',  value: Number(k.on_track  || 0), fill: '#38a169' },
                    { name: 'At Risk',   value: Number(k.at_risk   || 0), fill: '#d69e2e' },
                    { name: 'Off Track', value: Number(k.off_track || 0), fill: '#e53e3e' },
                  ].filter(d => d.value > 0)}
                >
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0,4,4,0]}>
                    {[{ fill: '#38a169' }, { fill: '#d69e2e' }, { fill: '#e53e3e' }].map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
          <SectionCard title="Outcome Scorecard"
            action={<button onClick={() => exportCSV(scorecard || [], 'scorecard.csv')} style={{ padding:'5px 12px', background:'var(--green)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:600 }}>⬇ Export CSV</button>}
          >
            {sL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr><th>Program</th><th>Metric</th><th>Period</th><th>Actual</th><th>Target</th><th>Status</th></tr></thead>
                <tbody>
                  {(scorecard || []).map((s, i) => (
                    <tr key={i}>
                      <td>{s.program_name}</td>
                      <td style={{ fontWeight: 500 }}>{s.metric_name}</td>
                      <td>{s.period}</td>
                      <td style={{ textAlign: 'right' }}>{fmtN(s.actual_value)}</td>
                      <td style={{ textAlign: 'right' }}>{fmtN(s.target_value)}</td>
                      <td><StatusBadge value={s.performance_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Program Effectiveness ── */}
      {tab === 'Effectiveness' && (
        <div>
          <SectionCard title="Program Effectiveness Score"
            action={<button onClick={() => exportCSV(effectiveness || [], 'effectiveness.csv')} style={{ padding:'5px 12px', background:'var(--green)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:600 }}>⬇ Export CSV</button>}
          >
            {eL ? <div className="loading">Loading…</div> : (
              <>
                <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:12 }}>
                  Score = Outcome achievement (60) + Cost efficiency vs peer avg (25) + Metric coverage (15)
                </p>
                <table className="data-table">
                  <thead><tr>
                    <th>Program</th><th>Type</th><th>Dept</th>
                    <th>Effectiveness</th><th>Tier</th>
                    <th>On Track</th><th>At Risk</th><th>Off Track</th>
                    <th>Cost/Unit</th><th>Peer Avg</th><th>Total Cost</th>
                  </tr></thead>
                  <tbody>
                    {(effectiveness || []).map(p => (
                      <tr key={p.program_id}>
                        <td style={{ fontWeight:500 }}>{p.program_name}</td>
                        <td style={{ fontSize:12 }}>{p.program_type}</td>
                        <td style={{ fontSize:12 }}>{p.department}</td>
                        <td style={{ minWidth:140 }}><ScoreBar score={p.EFFECTIVENESS_SCORE} /></td>
                        <td>
                          <span style={{
                            padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:700,
                            background:(TIER_COLOR[p.EFFECTIVENESS_TIER]||'#888')+'22',
                            color: TIER_COLOR[p.EFFECTIVENESS_TIER]||'#888',
                          }}>{p.EFFECTIVENESS_TIER}</span>
                        </td>
                        <td style={{ textAlign:'center', color:'var(--green)', fontWeight: p.ON_TRACK_COUNT > 0 ? 700 : undefined }}>{p.ON_TRACK_COUNT}</td>
                        <td style={{ textAlign:'center', color: p.AT_RISK_COUNT  > 0 ? 'var(--yellow)' : undefined }}>{p.AT_RISK_COUNT}</td>
                        <td style={{ textAlign:'center', color: p.OFF_TRACK_COUNT> 0 ? 'var(--red)'    : undefined }}>{p.OFF_TRACK_COUNT}</td>
                        <td style={{ textAlign:'right' }}>{fmt$(p.AVG_COST_PER_UNIT)}</td>
                        <td style={{ textAlign:'right', color:'var(--text-muted)' }}>{fmt$(p.PEER_AVG_CPU)}</td>
                        <td style={{ textAlign:'right' }}>{fmt$(p.TOTAL_COST)}</td>
                      </tr>
                    ))}
                    {!(effectiveness||[]).length && <tr><td colSpan={11} style={{ textAlign:'center', color:'var(--text-muted)', padding:24 }}>No program data</td></tr>}
                  </tbody>
                </table>
              </>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Grant → Outcome Linkage ── */}
      {tab === 'Grant Linkage' && (
        <div>
          <SectionCard title="Grant → Program → Outcome Linkage"
            action={<button onClick={() => exportCSV(grantLinkage || [], 'grant-linkage.csv')} style={{ padding:'5px 12px', background:'var(--green)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:600 }}>⬇ Export CSV</button>}
          >
            {gL ? <div className="loading">Loading…</div> : (
              <>
                <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8 }}>
                  Each grant is linked to its funded program and all outcome metrics tracked under that program.
                </p>
                <table className="data-table">
                  <thead><tr>
                    <th>Grant #</th><th>Title</th><th>Amount</th>
                    <th>Program</th><th>Linked Metrics</th>
                    <th>On Track</th><th>At Risk</th><th>Off Track</th>
                    <th>Outcome Status</th>
                  </tr></thead>
                  <tbody>
                    {(grantLinkage || []).map(g => (
                      <tr key={g.grant_id}>
                        <td style={{ fontFamily:'monospace', fontSize:12 }}>{g.grant_number}</td>
                        <td style={{ fontWeight:500, maxWidth:180 }}>{g.grant_title}</td>
                        <td style={{ textAlign:'right' }}>{fmt$(g.award_amount)}</td>
                        <td>{g.program_name || '—'}</td>
                        <td style={{ textAlign:'center' }}>{g.LINKED_METRICS}</td>
                        <td style={{ textAlign:'center', color:'var(--green)', fontWeight: g.ON_TRACK > 0 ? 700 : undefined }}>{g.ON_TRACK}</td>
                        <td style={{ textAlign:'center', color: g.AT_RISK   > 0 ? 'var(--yellow)' : undefined }}>{g.AT_RISK}</td>
                        <td style={{ textAlign:'center', color: g.OFF_TRACK > 0 ? 'var(--red)'    : undefined }}>{g.OFF_TRACK}</td>
                        <td>
                          <span style={{
                            padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:700,
                            background:(OUT_COLOR[g.OUTCOME_STATUS]||'#888')+'22',
                            color: OUT_COLOR[g.OUTCOME_STATUS]||'#888',
                          }}>{g.OUTCOME_STATUS}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Trend ── */}
      {tab === 'Trend' && (
        <div>
          <SectionCard title="Outcome Actuals — Time Series">
            {tL ? <div className="loading">Loading…</div> : (
              <>
                <div style={{ marginBottom:12, display:'flex', alignItems:'center', gap:12 }}>
                  <label style={{ fontSize:13, fontWeight:600 }}>Metric:</label>
                  <select value={selectedMetric} onChange={e => setTrendMetric(e.target.value)}
                    style={{ padding:'4px 10px', border:'1px solid var(--border)', borderRadius:6, fontSize:13 }}>
                    {metricNames.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <button onClick={() => exportCSV(trendSeries, 'trend.csv')} style={{ padding:'4px 12px', background:'var(--green)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:600 }}>⬇ Export CSV</button>
                </div>
                {trendSeries.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={trendSeries} margin={{ top:10, right:20, bottom:10, left:20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="period" tick={{ fontSize:11 }} />
                      <YAxis tick={{ fontSize:11 }} />
                      <Tooltip />
                      <Line
                        type="monotone" dataKey="value" stroke="#1a5c9e" strokeWidth={2}
                        dot={({ cx, cy, payload }) => (
                          <circle key={cx} cx={cx} cy={cy} r={5}
                            fill={payload.status === 'ON_TRACK' ? '#38a169' : payload.status === 'AT_RISK' ? '#d69e2e' : '#e53e3e'}
                            stroke="#fff" strokeWidth={2}
                          />
                        )}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign:'center', color:'var(--text-muted)', padding:40 }}>No trend data for selected metric</div>
                )}
                <div style={{ marginTop:8, fontSize:11, color:'var(--text-muted)' }}>
                  Dots: 🟢 On Track &nbsp; 🟡 At Risk &nbsp; 🔴 Off Track
                </div>
              </>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Cost-Effectiveness ── */}
      {tab === 'Cost-Effectiveness' && (
        <div>
          <SectionCard title="Cost-per-Unit vs Peer Average by Program"
            action={<button onClick={() => exportCSV(costEff || [], 'cost-effectiveness.csv')} style={{ padding:'5px 12px', background:'var(--green)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:600 }}>⬇ Export CSV</button>}
          >
            {cL ? <div className="loading">Loading…</div> : (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={(costEff || []).map(c => ({
                      name: (c.program_name || '').split(' ').slice(0,2).join(' '),
                      'Cost/Unit': Number(c.cost_per_unit || 0),
                      'Peer Avg':  Number(c.benchmark_cost || 0),
                    }))}
                    margin={{ top:10, right:20, bottom:30, left:20 }}
                  >
                    <XAxis dataKey="name" tick={{ fontSize:10 }} angle={-20} textAnchor="end" />
                    <YAxis tickFormatter={v => '$'+v} tick={{ fontSize:11 }} />
                    <Tooltip formatter={v => fmt$(v)} />
                    <Legend />
                    <Bar dataKey="Cost/Unit" radius={[3,3,0,0]}>
                      {(costEff || []).map((c, i) => <Cell key={i} fill={EFF_COLOR[c.EFFICIENCY_RATING]||'#888'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <table className="data-table" style={{ marginTop:16 }}>
                  <thead><tr>
                    <th>Program</th><th>Service Type</th><th>FY</th>
                    <th>Total Cost</th><th>Units</th><th>Cost/Unit</th>
                    <th>vs Peer</th><th>Rating</th>
                  </tr></thead>
                  <tbody>
                    {(costEff || []).map(c => (
                      <tr key={c.cost_unit_id}>
                        <td style={{ fontWeight:500 }}>{c.program_name}</td>
                        <td>{c.service_unit}</td>
                        <td>{c.fiscal_year}</td>
                        <td style={{ textAlign:'right' }}>{fmt$(c.total_cost)}</td>
                        <td style={{ textAlign:'right' }}>{fmtN(c.units_delivered)}</td>
                        <td style={{ textAlign:'right', fontWeight:700 }}>{fmt$(c.cost_per_unit)}</td>
                        <td style={{ textAlign:'right', color: Number(c.PCT_VS_PEER) > 0 ? 'var(--red)' : 'var(--green)' }}>
                          {fmtPct(c.PCT_VS_PEER)}
                        </td>
                        <td>
                          <span style={{
                            padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:700,
                            background:(EFF_COLOR[c.EFFICIENCY_RATING]||'#888')+'22',
                            color: EFF_COLOR[c.EFFICIENCY_RATING]||'#888',
                          }}>{c.EFFICIENCY_RATING}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Metrics ── */}
      {tab === 'Metrics' && (
        <SectionCard title={`Outcome Metrics (${metrics?.length ?? '…'})`}
          action={<button onClick={() => exportCSV(metrics || [], 'metrics.csv')} style={{ padding:'5px 12px', background:'var(--green)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:600 }}>⬇ Export CSV</button>}
        >
          {mL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Code</th><th>Metric Name</th><th>Program</th><th>Type</th>
                <th>Unit</th><th>Frequency</th><th>Direction</th><th>Key Indicator</th>
              </tr></thead>
              <tbody>
                {(metrics || []).map(m => (
                  <tr key={m.metric_id}>
                    <td style={{ fontFamily:'monospace', fontSize:12 }}>{m.metric_code}</td>
                    <td style={{ fontWeight:500 }}>{m.metric_name}</td>
                    <td>{m.program_name}</td>
                    <td>{m.metric_type}</td>
                    <td>{m.unit_of_measure}</td>
                    <td>{m.measurement_frequency}</td>
                    <td>{m.direction}</td>
                    <td><StatusBadge value={m.is_key_indicator === 'Y' ? 'Y' : 'N'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* ── Actuals ── */}
      {tab === 'Actuals' && (
        <SectionCard title={`Actual Results (${actuals?.length ?? '…'})`}
          action={<button onClick={() => exportCSV(actuals || [], 'actuals.csv')} style={{ padding:'5px 12px', background:'var(--green)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:600 }}>⬇ Export CSV</button>}
        >
          {aL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Metric</th><th>FY</th><th>Period</th><th>Actual</th>
                <th>Variance</th><th>Data Quality</th><th>Status</th>
              </tr></thead>
              <tbody>
                {(actuals || []).map(a => (
                  <tr key={a.actual_id}>
                    <td style={{ fontWeight:500 }}>{a.metric_name}</td>
                    <td>{a.fiscal_year}</td>
                    <td>{a.period}</td>
                    <td style={{ textAlign:'right' }}>{fmtN(a.actual_value)} {a.unit_of_measure}</td>
                    <td style={{ textAlign:'right', color: Number(a.variance_from_target) < 0 ? 'var(--red)' : 'var(--green)' }}>
                      {fmtN(a.variance_from_target)}
                    </td>
                    <td><StatusBadge value={a.data_quality_flag} /></td>
                    <td><StatusBadge value={a.performance_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}
    </div>
  );
}
