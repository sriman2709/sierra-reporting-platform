import { useState } from 'react';
import useData from '../components/useData';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const fmt$ = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtPct = n => n == null ? '—' : Number(n).toFixed(1) + '%';

const TABS = ['Overview', 'Grant List', 'Compliance Posture', 'Allowability', 'Subrecipient Risk', 'Lifecycle', 'Burn Rate'];

const BURN_COLOR   = { OVER_BURNING: '#e53e3e', UNDER_BURNING: '#3182ce', ON_TRACK: '#38a169', CLOSED: '#718096' };
const TIER_COLOR   = { STRONG: '#38a169', ADEQUATE: '#3182ce', NEEDS_IMPROVEMENT: '#d69e2e', AT_RISK: '#e53e3e' };
const RISK_COLOR   = { HIGH_RISK: '#e53e3e', MEDIUM_RISK: '#d69e2e', LOW_RISK: '#38a169', COMPLIANT: '#38a169' };

// CSV export helper
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

// Score gauge bar
function ScoreBar({ score }) {
  const pct = Math.max(0, Math.min(100, Number(score || 0)));
  const color = pct >= 80 ? '#38a169' : pct >= 60 ? '#3182ce' : pct >= 40 ? '#d69e2e' : '#e53e3e';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width .4s' }} />
      </div>
      <span style={{ fontWeight: 700, fontSize: 13, color, minWidth: 32 }}>{pct}</span>
    </div>
  );
}

export default function Grants() {
  const [tab, setTab] = useState('Overview');

  const { data: kpis,       loading: kL  } = useData('/grants/kpis');
  const { data: list,       loading: lL  } = useData('/grants');
  const { data: comp,       loading: cL  } = useData('/grants/compliance');
  const { data: posture,    loading: pL  } = useData('/grants/compliance-posture');
  const { data: allowable,  loading: aL  } = useData('/grants/allowability');
  const { data: subRisk,    loading: srL } = useData('/grants/subrecipient-risk');
  const { data: life,       loading: liL } = useData('/grants/lifecycle');
  const { data: burnRate,   loading: brL } = useData('/grants/burn-rate');

  const k = kpis || {};

  // Status distribution chart
  const statusMap = {};
  (list || []).forEach(g => { const s = g.award_status || 'UNKNOWN'; statusMap[s] = (statusMap[s] || 0) + 1; });
  const statusChart = Object.entries(statusMap).map(([name, count]) => ({ name, count }));
  const STATUS_COLORS = { ACTIVE: '#38a169', EXPIRING: '#d69e2e', CLOSED: '#718096', PENDING: '#3182ce' };

  // Risk tier distribution from posture
  const tierMap = {};
  (posture || []).forEach(g => { const t = g.RISK_TIER || 'UNKNOWN'; tierMap[t] = (tierMap[t] || 0) + 1; });
  const tierChart = Object.entries(tierMap).map(([name, count]) => ({ name, count }));

  // Posture KPIs
  const atRisk    = (posture || []).filter(g => g.RISK_TIER === 'AT_RISK').length;
  const avgScore  = posture?.length ? Math.round((posture || []).reduce((s, g) => s + Number(g.POSTURE_SCORE || 0), 0) / posture.length) : 0;
  const highRiskSubs = (subRisk || []).filter(s => s.risk_rating === 'HIGH').length;

  return (
    <div>
      <div className="kpi-grid">
        <KpiCard label="Total Grants"        value={k.total_grants        ?? '…'} />
        <KpiCard label="Total Award Value"   value={fmt$(k.total_award_amount)}    color="green" />
        <KpiCard label="Avg Posture Score"   value={avgScore ? `${avgScore}/100` : '…'} color={avgScore >= 60 ? 'green' : 'red'} />
        <KpiCard label="At-Risk Grants"      value={atRisk ?? '…'}                 color={atRisk > 0 ? 'red' : 'green'} />
        <KpiCard label="High-Risk Subs"      value={highRiskSubs ?? '…'}           color={highRiskSubs > 0 ? 'red' : 'green'} />
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'Overview' && (
        <div className="two-col">
          <SectionCard title="Grant Status Distribution">
            {lL ? <div className="loading">Loading…</div> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={statusChart} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {statusChart.map((e, i) => <Cell key={i} fill={STATUS_COLORS[e.name] || '#1a5c9e'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
          <SectionCard title="Compliance Risk Tier Distribution">
            {pL ? <div className="loading">Loading…</div> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={tierChart} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {tierChart.map((e, i) => <Cell key={i} fill={TIER_COLOR[e.name] || '#888'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Grant List ── */}
      {tab === 'Grant List' && (
        <SectionCard title={`All Grants (${list?.length ?? '…'})`}
          action={<button onClick={() => exportCSV(list || [], 'grants.csv')} style={{ padding:'5px 12px', background:'var(--green)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:600 }}>⬇ Export CSV</button>}
        >
          {lL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Grant #</th><th>Title</th><th>Grantor</th><th>CFDA</th>
                <th>Amount</th><th>Start</th><th>End</th><th>Program</th><th>Status</th>
              </tr></thead>
              <tbody>
                {(list || []).map(g => (
                  <tr key={g.grant_id}>
                    <td style={{ fontFamily:'monospace', fontSize:12 }}>{g.grant_number}</td>
                    <td style={{ fontWeight:500, maxWidth:200 }}>{g.grant_title}</td>
                    <td>{g.grantor_agency}</td>
                    <td style={{ fontFamily:'monospace', fontSize:12 }}>{g.cfda_number}</td>
                    <td style={{ textAlign:'right' }}>{fmt$(g.award_amount)}</td>
                    <td>{fmtDate(g.award_start_date)}</td>
                    <td>{fmtDate(g.award_end_date)}</td>
                    <td>{g.program_name}</td>
                    <td><StatusBadge value={g.award_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* ── Compliance Posture ── */}
      {tab === 'Compliance Posture' && (
        <div>
          <SectionCard title="Compliance Posture Score by Grant"
            action={<button onClick={() => exportCSV(posture || [], 'compliance-posture.csv')} style={{ padding:'5px 12px', background:'var(--green)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:600 }}>⬇ Export CSV</button>}
          >
            {pL ? <div className="loading">Loading…</div> : (
              <>
                <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:12 }}>
                  Score = Document coverage (25) + Approval completeness (20) + Evidence coverage (20) + Allowability reviewed (20) + Monitoring (15) − Findings penalties
                </p>
                <table className="data-table">
                  <thead><tr>
                    <th>Grant #</th><th>Title</th><th>CFDA</th>
                    <th>Posture Score</th><th>Risk Tier</th>
                    <th>Docs</th><th>Approvals</th><th>Evidence</th>
                    <th>Open Findings</th><th>High Findings</th>
                  </tr></thead>
                  <tbody>
                    {(posture || []).map(g => (
                      <tr key={g.grant_id}>
                        <td style={{ fontFamily:'monospace', fontSize:12 }}>{g.grant_number}</td>
                        <td style={{ fontWeight:500, maxWidth:180 }}>{g.grant_title}</td>
                        <td style={{ fontFamily:'monospace', fontSize:11 }}>{g.cfda_number}</td>
                        <td style={{ minWidth:160 }}><ScoreBar score={g.POSTURE_SCORE} /></td>
                        <td>
                          <span style={{
                            padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:700,
                            background: (TIER_COLOR[g.RISK_TIER] || '#888') + '22',
                            color: TIER_COLOR[g.RISK_TIER] || '#888',
                          }}>{g.RISK_TIER}</span>
                        </td>
                        <td style={{ textAlign:'center' }}>{g.DOCUMENT_COUNT ?? 0}</td>
                        <td style={{ textAlign:'center' }}>{g.APPROVAL_COUNT ?? 0}</td>
                        <td style={{ textAlign:'center' }}>{g.EVIDENCE_COUNT ?? 0}</td>
                        <td style={{ textAlign:'center', color: g.OPEN_FINDINGS > 0 ? 'var(--red)' : undefined, fontWeight: g.OPEN_FINDINGS > 0 ? 700 : undefined }}>
                          {g.OPEN_FINDINGS ?? 0}
                        </td>
                        <td style={{ textAlign:'center', color: g.HIGH_FINDINGS > 0 ? 'var(--red)' : undefined, fontWeight: g.HIGH_FINDINGS > 0 ? 700 : undefined }}>
                          {g.HIGH_FINDINGS ?? 0}
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

      {/* ── Allowability ── */}
      {tab === 'Allowability' && (
        <SectionCard title="Cost Allowability Rules by Grant"
          action={<button onClick={() => exportCSV(allowable || [], 'allowability.csv')} style={{ padding:'5px 12px', background:'var(--green)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:600 }}>⬇ Export CSV</button>}
        >
          {aL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Cost Category</th><th>CFR Reference</th>
                <th>Allowable</th><th>Necessary</th><th>Reasonable</th><th>Allocable</th><th>Description</th>
              </tr></thead>
              <tbody>
                {(allowable || []).map(r => (
                  <tr key={r.rule_id}>
                    <td style={{ fontWeight:500 }}>{r.cost_category}</td>
                    <td style={{ fontFamily:'monospace', fontSize:11 }}>{r.cfr_reference || '—'}</td>
                    <td>
                      <span style={{
                        padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:700,
                        background: r.is_allowable ? '#c6f6d522' : '#fed7d722',
                        color: r.is_allowable ? '#276749' : '#9b2335',
                      }}>{r.is_allowable ? '✅ YES' : '❌ NO'}</span>
                    </td>
                    <td style={{ textAlign:'center' }}>{r.is_necessary ? '✓' : '—'}</td>
                    <td style={{ textAlign:'center' }}>{r.is_reasonable ? '✓' : '—'}</td>
                    <td style={{ textAlign:'center' }}>{r.is_allocable ? '✓' : '—'}</td>
                    <td style={{ fontSize:12, color:'var(--text-muted)', maxWidth:200 }}>{r.description || r.exceptions || '—'}</td>
                  </tr>
                ))}
                {!(allowable || []).length && (
                  <tr><td colSpan={7} style={{ textAlign:'center', color:'var(--text-muted)', padding:24 }}>No allowability rules on record</td></tr>
                )}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* ── Subrecipient Risk ── */}
      {tab === 'Subrecipient Risk' && (
        <div>
          <div className="kpi-grid" style={{ marginBottom:16 }}>
            <KpiCard label="Total Monitoring Records" value={(subRisk || []).length} />
            <KpiCard label="High Risk"   value={(subRisk || []).filter(s => s.risk_rating === 'HIGH').length}   color="red" />
            <KpiCard label="Medium Risk" value={(subRisk || []).filter(s => s.risk_rating === 'MEDIUM').length} color="yellow" />
            <KpiCard label="Report Overdue"
              value={(subRisk || []).filter(s => s.report_due_date && new Date(s.report_due_date) < new Date()).length}
              color="orange"
            />
          </div>
          <SectionCard title="Subrecipient Monitoring Risk Matrix"
            action={<button onClick={() => exportCSV(subRisk || [], 'subrecipient-risk.csv')} style={{ padding:'5px 12px', background:'var(--green)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:600 }}>⬇ Export CSV</button>}
          >
            {srL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Subrecipient</th><th>Monitoring Type</th>
                  <th>Date</th><th>Findings</th><th>Follow-Up</th>
                  <th>Report Due</th><th>Risk Rating</th>
                </tr></thead>
                <tbody>
                  {(subRisk || []).map(s => (
                    <tr key={s.monitoring_id}>
                      <td style={{ fontWeight:500 }}>{s.subrecipient_name || s.subrecipient_id?.slice(0,8)}</td>
                      <td>{s.monitoring_type}</td>
                      <td>{fmtDate(s.monitoring_date)}</td>
                      <td style={{ textAlign:'center', color: s.findings_count > 0 ? 'var(--red)' : undefined, fontWeight: s.findings_count > 0 ? 700 : undefined }}>
                        {s.findings_count ?? 0}
                      </td>
                      <td style={{ textAlign:'center' }}>{s.follow_up_required ?? '—'}</td>
                      <td style={{ color: s.report_due_date && new Date(s.report_due_date) < new Date() ? 'var(--red)' : undefined }}>
                        {fmtDate(s.report_due_date)}
                        {s.report_due_date && new Date(s.report_due_date) < new Date()
                          ? <span style={{ marginLeft:4, fontSize:10, color:'var(--red)', fontWeight:700 }}>OVERDUE</span> : null}
                      </td>
                      <td>
                        <span style={{
                          padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:700,
                          background: (RISK_COLOR[s.risk_rating] || '#888') + '22',
                          color: RISK_COLOR[s.risk_rating] || '#888',
                        }}>{s.risk_rating}</span>
                      </td>
                    </tr>
                  ))}
                  {!(subRisk || []).length && (
                    <tr><td colSpan={8} style={{ textAlign:'center', color:'var(--text-muted)', padding:24 }}>No monitoring records found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Compliance (existing) ── */}
      {tab === 'Compliance' && (
        <SectionCard title="Grant Compliance Status">
          {cL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Grant #</th><th>Title</th><th>Amount</th>
                <th>Docs</th><th>Approvals</th><th>Evidence</th><th>Subawards</th><th>Compliance</th>
              </tr></thead>
              <tbody>
                {(comp || []).map(g => (
                  <tr key={g.grant_id}>
                    <td style={{ fontFamily:'monospace', fontSize:12 }}>{g.grant_number}</td>
                    <td style={{ fontWeight:500 }}>{g.grant_title}</td>
                    <td>{fmt$(g.award_amount)}</td>
                    <td style={{ textAlign:'center' }}>{g.DOCUMENT_COUNT ?? 0}</td>
                    <td style={{ textAlign:'center' }}>{g.APPROVAL_COUNT ?? 0}</td>
                    <td style={{ textAlign:'center' }}>{g.EVIDENCE_COUNT ?? 0}</td>
                    <td style={{ textAlign:'center' }}>{g.SUBAWARD_COUNT ?? 0}</td>
                    <td><StatusBadge value={g.COMPLIANCE_STATUS} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* ── Lifecycle ── */}
      {tab === 'Lifecycle' && (
        <SectionCard title="Award Lifecycle Tracking">
          {liL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Grant #</th><th>Title</th><th>Start</th><th>End</th>
                <th>Elapsed Days</th><th>Total Days</th><th>Status</th><th>Fund</th>
              </tr></thead>
              <tbody>
                {(life || []).map(g => (
                  <tr key={g.grant_id}>
                    <td style={{ fontFamily:'monospace', fontSize:12 }}>{g.grant_number}</td>
                    <td style={{ fontWeight:500 }}>{g.grant_title}</td>
                    <td>{fmtDate(g.award_start_date)}</td>
                    <td>{fmtDate(g.award_end_date)}</td>
                    <td style={{ textAlign:'right' }}>{g.ELAPSED_DAYS ?? g.elapsed_days}</td>
                    <td style={{ textAlign:'right' }}>{g.TOTAL_DAYS ?? g.total_days}</td>
                    <td><StatusBadge value={g.LIFECYCLE_STATUS ?? g.lifecycle_status} /></td>
                    <td>{g.fund_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* ── Burn Rate ── */}
      {tab === 'Burn Rate' && (
        <div>
          <SectionCard title="Grant Spend % vs Time Elapsed % (Burn Rate Analysis)">
            {brL ? <div className="loading">Loading…</div> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={(burnRate || []).map(g => ({
                    name: (g.grant_number || '').split('-').slice(0,2).join('-'),
                    'Spend %': Number(g.spend_pct || 0),
                    'Time %':  Number(g.time_elapsed_pct || 0),
                  }))}
                  margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                >
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={v => v + '%'} tick={{ fontSize: 11 }} domain={[0, 120]} />
                  <Tooltip formatter={v => fmtPct(v)} />
                  <Legend />
                  <Bar dataKey="Spend %" fill="#e53e3e" radius={[3,3,0,0]} />
                  <Bar dataKey="Time %"  fill="#1a5c9e" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
          <SectionCard title="Burn Rate Detail by Grant"
            action={<button onClick={() => exportCSV(burnRate || [], 'burn-rate.csv')} style={{ padding:'5px 12px', background:'var(--green)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:600 }}>⬇ Export CSV</button>}
          >
            {brL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Grant #</th><th>Title</th><th>Grantor</th><th>Award</th>
                  <th>Spend %</th><th>Time Elapsed %</th><th>Variance</th><th>Burn Status</th>
                </tr></thead>
                <tbody>
                  {(burnRate || []).map(g => {
                    const variance = Number(g.spend_pct || 0) - Number(g.time_elapsed_pct || 0);
                    return (
                      <tr key={g.grant_id}>
                        <td style={{ fontFamily:'monospace', fontSize:12 }}>{g.grant_number}</td>
                        <td style={{ fontWeight:500, maxWidth:180 }}>{g.grant_title}</td>
                        <td>{g.grantor_agency}</td>
                        <td style={{ textAlign:'right' }}>{fmt$(g.award_amount)}</td>
                        <td style={{ textAlign:'right', fontWeight:600 }}>{fmtPct(g.spend_pct)}</td>
                        <td style={{ textAlign:'right' }}>{fmtPct(g.time_elapsed_pct)}</td>
                        <td style={{ textAlign:'right', color: variance > 0 ? 'var(--red)' : 'var(--green)' }}>
                          {variance > 0 ? '+' : ''}{fmtPct(variance)}
                        </td>
                        <td>
                          <span style={{
                            padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:600,
                            background: (BURN_COLOR[g.burn_status] || '#888') + '22',
                            color: BURN_COLOR[g.burn_status] || '#888',
                          }}>{g.burn_status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
