import { useState } from 'react';
import useData from '../components/useData';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const fmt$ = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
const fmtPct = n => n == null ? '—' : Number(n).toFixed(1) + '%';

const TABS = ['Variance Dashboard', 'Scenarios', 'Forecast Entries'];

export default function Forecast() {
  const [tab, setTab] = useState('Variance Dashboard');
  const { data: variance,  loading: vL } = useData('/forecast/variance');
  const { data: scenarios, loading: sL } = useData('/forecast/scenarios');
  const { data: entries,   loading: eL } = useData('/forecast/entries');
  const { data: kpis,      loading: kL } = useData('/forecast/kpis');

  const k = kpis || {};

  // Build chart data grouped by scenario_name (fund_name may be null due to seed data)
  const chartData = (variance || []).reduce((acc, row) => {
    const key = row.scenario_name || row.fund_id || 'Unknown';
    const existing = acc.find(d => d.name === key);
    if (existing) {
      existing.budget   = (existing.budget   || 0) + Number(row.original_budget  || 0);
      existing.forecast = (existing.forecast || 0) + Number(row.forecast_amount  || 0);
      existing.actuals  = (existing.actuals  || 0) + Number(row.actuals_to_date  || 0);
    } else {
      acc.push({
        name:     key,
        budget:   Number(row.original_budget || 0),
        forecast: Number(row.forecast_amount || 0),
        actuals:  Number(row.actuals_to_date || 0),
      });
    }
    return acc;
  }, []);

  return (
    <div>
      <div className="kpi-grid">
        <KpiCard label="Scenarios"      value={k.total_scenarios ?? '…'} />
        <KpiCard label="Early Warnings" value={k.early_warnings  ?? '…'} color="red" />
        <KpiCard label="Avg Confidence" value={k.avg_confidence ? fmtPct(k.avg_confidence) : '…'} color="green" />
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Variance Dashboard' && (
        <div>
          <SectionCard title="Budget vs Forecast vs Actuals by Scenario">
            {vL ? <div className="loading">Loading…</div> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => '$' + (v/1000000).toFixed(1) + 'M'} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => fmt$(v)} />
                  <Legend />
                  <Bar dataKey="budget"   name="Budget"   fill="#1a5c9e" radius={[3,3,0,0]} />
                  <Bar dataKey="forecast" name="Forecast" fill="#38a169" radius={[3,3,0,0]} />
                  <Bar dataKey="actuals"  name="Actuals"  fill="#d69e2e" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
          <SectionCard title="Forecast Variance Detail">
            {vL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Fund</th><th>Scenario</th><th>FY</th><th>Period</th>
                  <th>Budget</th><th>Actuals YTD</th><th>Forecast</th>
                  <th>Variance</th><th>Warning</th>
                </tr></thead>
                <tbody>
                  {(variance || []).map(v => (
                    <tr key={v.forecast_id}>
                      <td style={{ fontWeight: 500 }}>{v.fund_name}</td>
                      <td>{v.scenario_name}</td>
                      <td>{v.fiscal_year}</td>
                      <td>{v.period}</td>
                      <td style={{ textAlign: 'right' }}>{fmt$(v.original_budget)}</td>
                      <td style={{ textAlign: 'right' }}>{fmt$(v.actuals_to_date)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(v.forecast_amount)}</td>
                      <td style={{ textAlign: 'right', color: Number(v.VARIANCE_TO_BUDGET) < 0 ? 'var(--red)' : 'var(--green)' }}>
                        {fmt$(v.VARIANCE_TO_BUDGET)}
                      </td>
                      <td><StatusBadge value={v.early_warning_flag === 'Y' ? 'Y' : 'N'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}

      {tab === 'Scenarios' && (
        <SectionCard title={`Forecast Scenarios (${scenarios?.length ?? '…'})`}>
          {sL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Scenario Name</th><th>Type</th><th>FY</th>
                <th>Version</th><th>Created By</th><th>Status</th>
              </tr></thead>
              <tbody>
                {(scenarios || []).map(s => (
                  <tr key={s.scenario_id}>
                    <td style={{ fontWeight: 500 }}>{s.scenario_name}</td>
                    <td>{s.scenario_type}</td>
                    <td>{s.fiscal_year}</td>
                    <td>{s.version_number}</td>
                    <td>{s.created_by}</td>
                    <td><StatusBadge value={s.scenario_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {tab === 'Forecast Entries' && (
        <SectionCard title={`Forecast Entries (${entries?.length ?? '…'})`}>
          {eL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Scenario</th><th>FY</th><th>Period</th><th>Type</th>
                <th>Budget</th><th>Actuals</th><th>YE Projection</th><th>Available</th><th>Confidence</th>
              </tr></thead>
              <tbody>
                {(entries || []).map(e => (
                  <tr key={e.forecast_id}>
                    <td>{e.scenario_name}</td>
                    <td>{e.fiscal_year}</td>
                    <td>{e.period}</td>
                    <td>{e.forecast_type}</td>
                    <td style={{ textAlign: 'right' }}>{fmt$(e.original_budget)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt$(e.actuals_to_date)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(e.year_end_projection)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt$(e.available_balance)}</td>
                    <td style={{ textAlign: 'right' }}>{e.confidence_level}%</td>
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
