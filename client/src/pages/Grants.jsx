import { useState } from 'react';
import useData from '../components/useData';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const fmt$ = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const TABS = ['Overview', 'Grant List', 'Compliance', 'Lifecycle'];

export default function Grants() {
  const [tab, setTab] = useState('Overview');
  const { data: kpis, loading: kL } = useData('/grants/kpis');
  const { data: list, loading: lL } = useData('/grants');
  const { data: comp, loading: cL } = useData('/grants/compliance');
  const { data: life, loading: liL } = useData('/grants/lifecycle');

  const k = kpis?.[0] || {};

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
        <KpiCard label="Total Grants"     value={k.CNT ?? k.total_grants ?? '…'} color="" />
        <KpiCard label="Total Award Value" value={fmt$(k.TOTAL ?? k.total_award_amount)} color="green" />
        <KpiCard label="Active Grants"     value={k.ACTIVE ?? k.active_grants ?? '…'} color="green" />
        <KpiCard label="Expiring Soon"     value={k.EXPIRING ?? k.expiring_grants ?? '…'} color="yellow" />
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
    </div>
  );
}
