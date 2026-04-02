import { useState } from 'react';
import useData from '../components/useData';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

const fmt$ = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtPct = n => n == null ? '—' : Number(n).toFixed(1) + '%';

const TABS = ['Overview', 'Grant List', 'Compliance', 'Lifecycle', 'Burn Rate'];

const BURN_COLOR = {
  OVER_BURNING:  '#e53e3e',
  UNDER_BURNING: '#3182ce',
  ON_TRACK:      '#38a169',
  CLOSED:        '#718096',
};

export default function Grants() {
  const [tab, setTab] = useState('Overview');
  const { data: kpis,     loading: kL  } = useData('/grants/kpis');
  const { data: list,     loading: lL  } = useData('/grants');
  const { data: comp,     loading: cL  } = useData('/grants/compliance');
  const { data: life,     loading: liL } = useData('/grants/lifecycle');
  const { data: burnRate, loading: brL } = useData('/grants/burn-rate');

  const k = kpis || {};

  // Build status breakdown chart from list
  const statusMap = {};
  (list || []).forEach(g => {
    const s = g.award_status || 'UNKNOWN';
    statusMap[s] = (statusMap[s] || 0) + 1;
  });
  const chartData = Object.entries(statusMap).map(([name, count]) => ({ name, count }));

  const COLORS = { ACTIVE: '#38a169', EXPIRING: '#d69e2e', CLOSED: '#718096', PENDING: '#3182ce' };

  return (
    <div>
      <div className="kpi-grid">
        <KpiCard label="Total Grants"      value={k.total_grants     ?? '…'} />
        <KpiCard label="Total Award Value" value={fmt$(k.total_award_amount)}  color="green" />
        <KpiCard label="Active Grants"     value={k.active_grants    ?? '…'} color="green" />
        <KpiCard label="Expiring Soon"     value={k.expiring_grants  ?? '…'} color="yellow" />
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="two-col">
          <SectionCard title="Grant Status Distribution">
            {kL ? <div className="loading">Loading…</div> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[entry.name] || '#1a5c9e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
          <SectionCard title="Recent Grants">
            {lL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Grant</th><th>Amount</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {(list || []).slice(0, 5).map(g => (
                    <tr key={g.grant_id}>
                      <td style={{ maxWidth: 180 }}><div style={{ fontWeight: 500 }}>{g.grant_title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.grant_number}</div>
                      </td>
                      <td>{fmt$(g.award_amount)}</td>
                      <td><StatusBadge value={g.award_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}

      {tab === 'Grant List' && (
        <SectionCard title={`All Grants (${list?.length ?? '…'})`}>
          {lL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Grant #</th><th>Title</th><th>Grantor</th><th>CFDA</th>
                <th>Amount</th><th>Start</th><th>End</th><th>Program</th><th>Status</th>
              </tr></thead>
              <tbody>
                {(list || []).map(g => (
                  <tr key={g.grant_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{g.grant_number}</td>
                    <td style={{ fontWeight: 500, maxWidth: 200 }}>{g.grant_title}</td>
                    <td>{g.grantor_agency}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{g.cfda_number}</td>
                    <td style={{ textAlign: 'right' }}>{fmt$(g.award_amount)}</td>
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

      {tab === 'Compliance' && (
        <SectionCard title="Grant Compliance Status">
          {cL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Grant #</th><th>Title</th><th>Amount</th>
                <th>Docs</th><th>Approvals</th><th>Evidence</th><th>Subawards</th>
                <th>Compliance</th>
              </tr></thead>
              <tbody>
                {(comp || []).map(g => (
                  <tr key={g.grant_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{g.grant_number}</td>
                    <td style={{ fontWeight: 500 }}>{g.grant_title}</td>
                    <td>{fmt$(g.award_amount)}</td>
                    <td style={{ textAlign: 'center' }}>{g.DOCUMENT_COUNT ?? g.document_count}</td>
                    <td style={{ textAlign: 'center' }}>{g.APPROVAL_COUNT ?? g.approval_count}</td>
                    <td style={{ textAlign: 'center' }}>{g.EVIDENCE_COUNT ?? g.evidence_count}</td>
                    <td style={{ textAlign: 'center' }}>{g.SUBAWARD_COUNT ?? g.subaward_count}</td>
                    <td><StatusBadge value={g.COMPLIANCE_STATUS ?? g.compliance_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {tab === 'Lifecycle' && (
        <SectionCard title="Award Lifecycle Tracking">
          {liL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Grant #</th><th>Title</th><th>Start</th><th>End</th>
                <th>Elapsed</th><th>Total Days</th><th>Lifecycle</th><th>Fund</th>
              </tr></thead>
              <tbody>
                {(life || []).map(g => (
                  <tr key={g.grant_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{g.grant_number}</td>
                    <td style={{ fontWeight: 500 }}>{g.grant_title}</td>
                    <td>{fmtDate(g.award_start_date)}</td>
                    <td>{fmtDate(g.award_end_date)}</td>
                    <td style={{ textAlign: 'right' }}>{g.ELAPSED_DAYS ?? g.elapsed_days}</td>
                    <td style={{ textAlign: 'right' }}>{g.TOTAL_DAYS ?? g.total_days}</td>
                    <td><StatusBadge value={g.LIFECYCLE_STATUS ?? g.lifecycle_status} /></td>
                    <td>{g.fund_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

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

          <SectionCard title="Burn Rate Detail by Grant">
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
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{g.grant_number}</td>
                        <td style={{ fontWeight: 500, maxWidth: 180 }}>{g.grant_title}</td>
                        <td>{g.grantor_agency}</td>
                        <td style={{ textAlign: 'right' }}>{fmt$(g.award_amount)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtPct(g.spend_pct)}</td>
                        <td style={{ textAlign: 'right' }}>{fmtPct(g.time_elapsed_pct)}</td>
                        <td style={{ textAlign: 'right', color: variance > 0 ? 'var(--red)' : 'var(--green)' }}>
                          {variance > 0 ? '+' : ''}{fmtPct(variance)}
                        </td>
                        <td>
                          <span style={{
                            padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                            background: (BURN_COLOR[g.burn_status] || '#888') + '22',
                            color: BURN_COLOR[g.burn_status] || '#888',
                          }}>
                            {g.burn_status}
                          </span>
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
