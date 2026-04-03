import { useState, useMemo } from 'react';
import useData from '../components/useData';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, CartesianGrid, ReferenceLine, Cell,
} from 'recharts';

const fmt$ = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
const fmtPct = n => n == null ? '—' : Number(n).toFixed(1) + '%';
const fmtK = n => n == null ? '—' : (Math.abs(n) >= 1_000_000
  ? (n / 1_000_000).toFixed(1) + 'M'
  : (n / 1_000).toFixed(0) + 'K');

const SENS_COLOR = { HIGH: '#e53e3e', MEDIUM: '#dd6b20', LOW: '#38a169' };

function exportCSV(rows, cols, filename) {
  const header = cols.map(c => c.label).join(',');
  const body   = rows.map(r => cols.map(c => {
    const v = r[c.key]; return typeof v === 'string' && v.includes(',') ? `"${v}"` : (v ?? '');
  }).join(',')).join('\n');
  const blob = new Blob([header + '\n' + body], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = filename; a.click();
}

// ── What-If calculation (pure function — runs client-side instantly) ──────────
function applyWhatIf(funds, budgetPct, costPct, encumbrancePct) {
  return (funds || []).map(f => {
    const budget       = Number(f.budget       || 0);
    const expenditures = Number(f.expenditures || 0);
    const encumbrances = Number(f.encumbrances || 0);
    const baseAvail    = Number(f.available    || 0);

    const projBudget       = budget       * (1 + budgetPct       / 100);
    const projExpenditures = expenditures * (1 + costPct         / 100);
    const projEncumbrances = encumbrances * (1 + encumbrancePct  / 100);
    const projAvail        = projBudget - projExpenditures - projEncumbrances;
    const impact           = projAvail - baseAvail;

    return {
      ...f,
      proj_budget:       projBudget,
      proj_expenditures: projExpenditures,
      proj_encumbrances: projEncumbrances,
      proj_available:    projAvail,
      impact,
      status: projAvail < 0 ? 'OVER_BUDGET' : projAvail < projBudget * 0.1 ? 'CRITICAL' : 'ON_TRACK',
    };
  });
}

// ── Slider component ──────────────────────────────────────────────────────────
function Slider({ label, value, onChange, min = -50, max = 50 }) {
  const color = value < 0 ? '#e53e3e' : value > 0 ? '#38a169' : '#718096';
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#2d3748' }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{value > 0 ? '+' : ''}{value}%</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#718096' }}>
        <span>{min}%</span><span>0%</span><span>+{max}%</span>
      </div>
    </div>
  );
}

const TABS = ['Variance Dashboard', 'Scenarios', 'Forecast Entries', 'What-If Builder', 'Sensitivity Analysis'];

export default function Forecast() {
  const [tab, setTab] = useState('Variance Dashboard');

  // existing data
  const { data: variance,    loading: vL  } = useData('/forecast/variance');
  const { data: scenarios,   loading: sL  } = useData('/forecast/scenarios');
  const { data: entries,     loading: eL  } = useData('/forecast/entries');
  const { data: kpis,        loading: kL  } = useData('/forecast/kpis');
  // sprint 6
  const { data: whatIfBase,  loading: wL  } = useData('/forecast/what-if-base');
  const { data: sensitivity, loading: senL } = useData('/forecast/sensitivity');

  const k = kpis || {};

  // ── Sprint 6: What-If state ─────────────────────────────────────────────────
  const [budgetPct,       setBudgetPct]       = useState(0);
  const [costPct,         setCostPct]         = useState(0);
  const [encumbrancePct,  setEncumbrancePct]  = useState(0);
  const [filterFund,      setFilterFund]      = useState('ALL');

  const allFunds  = whatIfBase || [];
  const fundNames = ['ALL', ...new Set(allFunds.map(f => f.fund_type).filter(Boolean))];

  const baseFunds    = filterFund === 'ALL' ? allFunds : allFunds.filter(f => f.fund_type === filterFund);
  const projFunds    = useMemo(() => applyWhatIf(baseFunds, budgetPct, costPct, encumbrancePct), [baseFunds, budgetPct, costPct, encumbrancePct]);

  const totalBaseAvail  = baseFunds.reduce((s, f) => s + Number(f.available    || 0), 0);
  const totalProjAvail  = projFunds.reduce((s, f) => s + Number(f.proj_available || 0), 0);
  const totalImpact     = totalProjAvail - totalBaseAvail;
  const overBudgetCount = projFunds.filter(f => f.proj_available < 0).length;

  const whatIfChartData = projFunds.slice(0, 10).map(f => ({
    name:      f.fund_name?.length > 14 ? f.fund_name.slice(0, 14) + '…' : f.fund_name,
    'Base Available':  Number(f.available    || 0),
    'Projected':       Number(f.proj_available || 0),
  }));

  // ── Variance chart data ─────────────────────────────────────────────────────
  const chartData = (variance || []).reduce((acc, row) => {
    const key = row.scenario_name || row.fund_id || 'Unknown';
    const existing = acc.find(d => d.name === key);
    if (existing) {
      existing.budget   = (existing.budget   || 0) + Number(row.original_budget || 0);
      existing.forecast = (existing.forecast || 0) + Number(row.forecast_amount || 0);
      existing.actuals  = (existing.actuals  || 0) + Number(row.actuals_to_date || 0);
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

  // ── Sensitivity chart (tornado) ─────────────────────────────────────────────
  const tornadoData = (sensitivity || []).slice(0, 10).map(f => ({
    name:        f.fund_name?.length > 16 ? f.fund_name.slice(0, 16) + '…' : f.fund_name,
    'Budget Cut Impact': -Number(f.impact_10pct_budget_cut    || 0),
    'Cost Increase':      Number(f.impact_10pct_cost_increase || 0),
    rating:               f.sensitivity_rating,
  }));

  return (
    <div>
      <div className="kpi-grid">
        <KpiCard label="Scenarios"         value={k.total_scenarios ?? '…'} />
        <KpiCard label="Early Warnings"    value={k.early_warnings  ?? '…'} color="red" />
        <KpiCard label="Avg Confidence"    value={k.avg_confidence ? fmtPct(k.avg_confidence) : '…'} color="green" />
        {tab === 'What-If Builder' && <>
          <KpiCard label="Base Available"  value={fmt$(totalBaseAvail)} />
          <KpiCard label="Projected Available" value={fmt$(totalProjAvail)} color={totalProjAvail < totalBaseAvail ? 'red' : 'green'} />
          <KpiCard label="Total Impact"    value={(totalImpact >= 0 ? '+' : '') + fmt$(totalImpact)} color={totalImpact < 0 ? 'red' : 'green'} />
          <KpiCard label="Funds Over Budget (Projected)" value={overBudgetCount} color={overBudgetCount > 0 ? 'red' : 'green'} />
        </>}
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* ── Variance Dashboard ─────────────────────────────────────────── */}
      {tab === 'Variance Dashboard' && (
        <div>
          <SectionCard title="Budget vs Forecast vs Actuals by Scenario">
            {vL ? <div className="loading">Loading…</div> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => '$' + (v / 1_000_000).toFixed(1) + 'M'} tick={{ fontSize: 11 }} />
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
            <div style={{ marginBottom: 8, textAlign: 'right' }}>
              <button className="btn btn-sm" onClick={() => exportCSV(variance || [], [
                {key:'fund_name',label:'Fund'},{key:'scenario_name',label:'Scenario'},
                {key:'fiscal_year',label:'FY'},{key:'period',label:'Period'},
                {key:'original_budget',label:'Budget'},{key:'actuals_to_date',label:'Actuals YTD'},
                {key:'forecast_amount',label:'Forecast'},{key:'VARIANCE_TO_BUDGET',label:'Variance'},
              ], 'forecast-variance.csv')}>⬇ Export CSV</button>
            </div>
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

      {/* ── Scenarios ─────────────────────────────────────────────────── */}
      {tab === 'Scenarios' && (
        <SectionCard title={`Forecast Scenarios (${scenarios?.length ?? '…'})`}>
          <div style={{ marginBottom: 8, textAlign: 'right' }}>
            <button className="btn btn-sm" onClick={() => exportCSV(scenarios || [], [
              {key:'scenario_name',label:'Name'},{key:'scenario_type',label:'Type'},
              {key:'fiscal_year',label:'FY'},{key:'version_number',label:'Version'},
              {key:'created_by',label:'Created By'},{key:'scenario_status',label:'Status'},
            ], 'scenarios.csv')}>⬇ Export CSV</button>
          </div>
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

      {/* ── Forecast Entries ───────────────────────────────────────────── */}
      {tab === 'Forecast Entries' && (
        <SectionCard title={`Forecast Entries (${entries?.length ?? '…'})`}>
          <div style={{ marginBottom: 8, textAlign: 'right' }}>
            <button className="btn btn-sm" onClick={() => exportCSV(entries || [], [
              {key:'scenario_name',label:'Scenario'},{key:'fiscal_year',label:'FY'},
              {key:'period',label:'Period'},{key:'forecast_type',label:'Type'},
              {key:'original_budget',label:'Budget'},{key:'actuals_to_date',label:'Actuals'},
              {key:'year_end_projection',label:'YE Projection'},{key:'available_balance',label:'Available'},
              {key:'confidence_level',label:'Confidence %'},
            ], 'forecast-entries.csv')}>⬇ Export CSV</button>
          </div>
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

      {/* ── What-If Builder ────────────────────────────────────────────── */}
      {tab === 'What-If Builder' && (
        <div>
          {/* Controls panel */}
          <SectionCard title="Scenario Parameters">
            <p style={{ color: '#718096', fontSize: 13, marginBottom: 16 }}>
              Adjust parameters below to model budget scenarios. Results update instantly based on
              current fund balances from HANA Cloud.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
              <div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#718096', textTransform: 'uppercase' }}>
                    Filter by Fund Type
                  </label>
                  <select
                    value={filterFund}
                    onChange={e => setFilterFund(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13 }}
                  >
                    {fundNames.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div style={{ padding: '10px 14px', background: '#f7f9fc', borderRadius: 8, fontSize: 13 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Active Funds: {baseFunds.length}</div>
                  <div>Total Budget: {fmt$(baseFunds.reduce((s,f)=>s+Number(f.budget||0),0))}</div>
                  <div>Total Expenditures: {fmt$(baseFunds.reduce((s,f)=>s+Number(f.expenditures||0),0))}</div>
                </div>
              </div>
              <div>
                <Slider label="Budget Change %" value={budgetPct} onChange={setBudgetPct} />
                <Slider label="Cost / Expenditure Change %" value={costPct} onChange={setCostPct} />
                <Slider label="Encumbrance Change %" value={encumbrancePct} onChange={setEncumbrancePct} />
              </div>
              <div>
                {/* Impact summary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Base Available', value: fmt$(totalBaseAvail), color: '#1a5c9e' },
                    { label: 'Projected Available', value: fmt$(totalProjAvail), color: totalProjAvail < totalBaseAvail ? '#e53e3e' : '#38a169' },
                    { label: 'Net Impact', value: (totalImpact >= 0 ? '+' : '') + fmt$(totalImpact), color: totalImpact < 0 ? '#e53e3e' : '#38a169' },
                    { label: 'Over-Budget Funds', value: overBudgetCount, color: overBudgetCount > 0 ? '#e53e3e' : '#38a169' },
                  ].map(m => (
                    <div key={m.label} style={{ padding: '10px 12px', background: '#f7f9fc', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#718096', textTransform: 'uppercase', marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>
                <button
                  style={{ width: '100%', marginTop: 10, padding: '8px', background: '#1a5c9e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                  onClick={() => { setBudgetPct(0); setCostPct(0); setEncumbrancePct(0); }}
                >↺ Reset Parameters</button>
              </div>
            </div>
          </SectionCard>

          {/* Comparison chart */}
          <SectionCard title="Base vs Projected Available Balance (Top 10 Funds)">
            {wL ? <div className="loading">Loading…</div> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={whatIfChartData} margin={{ top: 10, right: 20, bottom: 40, left: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tickFormatter={v => fmtK(v)} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => fmt$(v)} />
                  <Legend verticalAlign="top" />
                  <ReferenceLine y={0} stroke="#e53e3e" strokeDasharray="4 2" />
                  <Bar dataKey="Base Available" fill="#1a5c9e" radius={[3,3,0,0]} />
                  <Bar dataKey="Projected"      fill={totalImpact < 0 ? '#fc8181' : '#68d391'} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          {/* Detail table */}
          <SectionCard title="Fund-Level What-If Detail">
            <div style={{ marginBottom: 8, textAlign: 'right' }}>
              <button className="btn btn-sm" onClick={() => exportCSV(projFunds, [
                {key:'fund_name',label:'Fund'},{key:'fund_type',label:'Type'},
                {key:'budget',label:'Base Budget'},{key:'proj_budget',label:'Projected Budget'},
                {key:'expenditures',label:'Base Expenditures'},{key:'proj_expenditures',label:'Projected Expenditures'},
                {key:'available',label:'Base Available'},{key:'proj_available',label:'Projected Available'},
                {key:'impact',label:'Impact'},{key:'status',label:'Status'},
              ], 'what-if-detail.csv')}>⬇ Export CSV</button>
            </div>
            {wL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Fund</th><th>Type</th>
                  <th style={{ textAlign: 'right' }}>Base Available</th>
                  <th style={{ textAlign: 'right' }}>Projected Available</th>
                  <th style={{ textAlign: 'right' }}>Impact</th>
                  <th>Status</th>
                </tr></thead>
                <tbody>
                  {projFunds.map(f => (
                    <tr key={f.fund_id}>
                      <td style={{ fontWeight: 500 }}>{f.fund_name}</td>
                      <td>{f.fund_type}</td>
                      <td style={{ textAlign: 'right' }}>{fmt$(f.available)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: f.proj_available < 0 ? '#e53e3e' : '#2d3748' }}>
                        {fmt$(f.proj_available)}
                      </td>
                      <td style={{ textAlign: 'right', color: f.impact < 0 ? '#e53e3e' : '#38a169', fontWeight: 600 }}>
                        {f.impact >= 0 ? '+' : ''}{fmt$(f.impact)}
                      </td>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                          background: f.status === 'OVER_BUDGET' ? '#fed7d7' : f.status === 'CRITICAL' ? '#feebc8' : '#c6f6d5',
                          color:      f.status === 'OVER_BUDGET' ? '#c53030' : f.status === 'CRITICAL' ? '#c05621' : '#276749',
                        }}>{f.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Sensitivity Analysis ───────────────────────────────────────── */}
      {tab === 'Sensitivity Analysis' && (
        <div>
          <SectionCard title="Fund Sensitivity to Parameter Changes (10% Shock)">
            <p style={{ color: '#718096', fontSize: 13, marginBottom: 16 }}>
              Tornado chart showing which funds are most exposed to a 10% budget cut vs 10% cost increase.
              Funds with HIGH sensitivity have available balances below 10% of their budget.
            </p>
            {senL ? <div className="loading">Loading…</div> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={tornadoData} layout="vertical"
                  margin={{ top: 10, right: 30, bottom: 10, left: 120 }}
                >
                  <XAxis type="number" tickFormatter={v => fmtK(Math.abs(v))} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={115} />
                  <Tooltip formatter={(v, name) => [fmt$(Math.abs(v)), name]} />
                  <Legend />
                  <ReferenceLine x={0} stroke="#4a5568" />
                  <Bar dataKey="Budget Cut Impact"  name="10% Budget Cut Impact"   fill="#e53e3e" radius={[0,3,3,0]} />
                  <Bar dataKey="Cost Increase"      name="10% Cost Increase Impact" fill="#dd6b20" radius={[0,3,3,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Sensitivity Ratings by Fund">
            <div style={{ marginBottom: 8, textAlign: 'right' }}>
              <button className="btn btn-sm" onClick={() => exportCSV(sensitivity || [], [
                {key:'fund_name',label:'Fund'},{key:'fund_type',label:'Type'},
                {key:'budget',label:'Budget'},{key:'expenditures',label:'Expenditures'},
                {key:'current_available',label:'Available'},
                {key:'spend_pct',label:'Spend %'},
                {key:'impact_10pct_budget_cut',label:'10% Budget Cut Impact'},
                {key:'impact_10pct_cost_increase',label:'10% Cost Increase Impact'},
                {key:'impact_5pct_budget_cut',label:'5% Budget Cut Impact'},
                {key:'sensitivity_rating',label:'Rating'},
              ], 'sensitivity-analysis.csv')}>⬇ Export CSV</button>
            </div>
            {senL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Fund</th><th>Type</th>
                  <th style={{ textAlign: 'right' }}>Budget</th>
                  <th style={{ textAlign: 'right' }}>Available</th>
                  <th style={{ textAlign: 'right' }}>Spend %</th>
                  <th style={{ textAlign: 'right' }}>10% Budget Cut</th>
                  <th style={{ textAlign: 'right' }}>10% Cost Increase</th>
                  <th>Sensitivity</th>
                </tr></thead>
                <tbody>
                  {(sensitivity || []).map(f => (
                    <tr key={f.fund_id}>
                      <td style={{ fontWeight: 500 }}>{f.fund_name}</td>
                      <td>{f.fund_type}</td>
                      <td style={{ textAlign: 'right' }}>{fmt$(f.budget)}</td>
                      <td style={{ textAlign: 'right', color: Number(f.current_available) < 0 ? '#e53e3e' : 'inherit' }}>
                        {fmt$(f.current_available)}
                      </td>
                      <td style={{ textAlign: 'right' }}>{fmtPct(f.spend_pct)}</td>
                      <td style={{ textAlign: 'right', color: '#e53e3e', fontWeight: 600 }}>
                        -{fmt$(f.impact_10pct_budget_cut)}
                      </td>
                      <td style={{ textAlign: 'right', color: '#dd6b20', fontWeight: 600 }}>
                        +{fmt$(f.impact_10pct_cost_increase)}
                      </td>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                          background: f.sensitivity_rating === 'HIGH' ? '#fed7d7' : f.sensitivity_rating === 'MEDIUM' ? '#feebc8' : '#c6f6d5',
                          color:      SENS_COLOR[f.sensitivity_rating] || '#4a5568',
                        }}>{f.sensitivity_rating}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
