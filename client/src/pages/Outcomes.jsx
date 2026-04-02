import { useState } from 'react';
import useData from '../components/useData';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const fmtN = n => n == null ? '—' : Number(n).toLocaleString('en-US', { maximumFractionDigits: 1 });
const fmt$ = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

const TABS = ['Scorecard', 'Metrics', 'Actuals', 'Cost to Serve'];

export default function Outcomes() {
  const [tab, setTab] = useState('Scorecard');
  const { data: scorecard, loading: sL } = useData('/outcomes/scorecard');
  const { data: metrics,   loading: mL } = useData('/outcomes/metrics');
  const { data: actuals,   loading: aL } = useData('/outcomes/actuals');
  const { data: cost,      loading: cL } = useData('/outcomes/cost');
  const { data: kpis,      loading: kL } = useData('/outcomes/kpis');

  const k = kpis || {};

  const statusData = [
    { name: 'On Track',  value: Number(k.on_track  ?? 0), fill: '#38a169' },
    { name: 'At Risk',   value: Number(k.at_risk   ?? 0), fill: '#d69e2e' },
    { name: 'Off Track', value: Number(k.off_track ?? 0), fill: '#e53e3e' },
  ].filter(d => d.value > 0);

  return (
    <div>
      <div className="kpi-grid">
        <KpiCard label="Total Metrics"   value={k.total_metrics ?? '…'} />
        <KpiCard label="On Track"        value={k.on_track  ?? '…'} color="green" />
        <KpiCard label="At Risk"         value={k.at_risk   ?? '…'} color="yellow" />
        <KpiCard label="Off Track"       value={k.off_track ?? 0}   color="red" />
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Scorecard' && (
        <div className="two-col">
          <SectionCard title="Performance Status">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                <Tooltip />
                <Bar dataKey="value" radius={[0,4,4,0]}>
                  {statusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
          <SectionCard title="Outcome Scorecard">
            {sL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr><th>Program</th><th>Metric</th><th>Period</th><th>Actual</th><th>Target</th><th>Status</th></tr></thead>
                <tbody>
                  {(scorecard || []).slice(0, 8).map((s, i) => (
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

      {tab === 'Metrics' && (
        <SectionCard title={`Outcome Metrics (${metrics?.length ?? '…'})`}>
          {mL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Code</th><th>Metric Name</th><th>Program</th><th>Type</th>
                <th>Unit</th><th>Frequency</th><th>Direction</th><th>Key</th>
              </tr></thead>
              <tbody>
                {(metrics || []).map(m => (
                  <tr key={m.metric_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{m.metric_code}</td>
                    <td style={{ fontWeight: 500 }}>{m.metric_name}</td>
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

      {tab === 'Actuals' && (
        <SectionCard title={`Actual Results (${actuals?.length ?? '…'})`}>
          {aL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Metric</th><th>FY</th><th>Period</th><th>Actual</th>
                <th>Variance</th><th>Quality</th><th>Status</th>
              </tr></thead>
              <tbody>
                {(actuals || []).map(a => (
                  <tr key={a.actual_id}>
                    <td style={{ fontWeight: 500 }}>{a.metric_name}</td>
                    <td>{a.fiscal_year}</td>
                    <td>{a.period}</td>
                    <td style={{ textAlign: 'right' }}>{fmtN(a.actual_value)} {a.unit_of_measure}</td>
                    <td style={{ textAlign: 'right', color: Number(a.variance_from_target) < 0 ? 'var(--red)' : 'var(--green)' }}>
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

      {tab === 'Cost to Serve' && (
        <SectionCard title="Cost-to-Serve Analysis">
          {cL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Program</th><th>Service Type</th><th>FY</th><th>Period</th>
                <th>Total Cost</th><th>Units</th><th>Cost/Unit</th>
              </tr></thead>
              <tbody>
                {(cost || []).map(c => (
                  <tr key={c.cost_unit_id}>
                    <td style={{ fontWeight: 500 }}>{c.program_name}</td>
                    <td>{c.service_type}</td>
                    <td>{c.fiscal_year}</td>
                    <td>{c.period}</td>
                    <td style={{ textAlign: 'right' }}>{fmt$(c.total_cost)}</td>
                    <td style={{ textAlign: 'right' }}>{fmtN(c.units_delivered)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(c.cost_per_unit)}</td>
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
