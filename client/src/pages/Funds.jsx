import { useState } from 'react';
import useData from '../components/useData';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts';

const fmt$ = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
const fmtPct = n => n == null ? '—' : Number(n).toFixed(1) + '%';

const TABS = ['Fund Summary', 'Available to Spend', 'Balance Detail', 'GASB-54 Classification'];
const COLORS = ['#1a5c9e', '#38a169', '#d69e2e', '#e53e3e', '#805ad5'];

const STATUS_COLOR = {
  OVER_BUDGET: '#e53e3e',
  CRITICAL:    '#d69e2e',
  WARNING:     '#ed8936',
  ON_TRACK:    '#38a169',
};

export default function Funds() {
  const [tab, setTab] = useState('Fund Summary');
  const { data: funds,     loading: fL } = useData('/funds');
  const { data: balance,   loading: bL } = useData('/funds/balance');
  const { data: available, loading: aL } = useData('/funds/available');
  const { data: kpis,      loading: kL } = useData('/funds/kpis');

  const k = kpis || {};

  const pieData = (funds || []).map(f => ({
    name: f.fund_name,
    value: Number(f.ending_balance || 0),
  })).filter(d => d.value > 0);

  // Bar chart data for Available-to-Spend
  const availChartData = (available || []).map(f => ({
    name: (f.fund_name || '').split(' ')[0],
    Budget:       Number(f.budget       || 0),
    Expenditures: Number(f.expenditures || 0),
    Encumbrances: Number(f.encumbrances || 0),
    Available:    Math.max(0, Number(f.available_to_spend || 0)),
  }));

  return (
    <div>
      <div className="kpi-grid">
        <KpiCard label="Total Funds"         value={k.total_funds          ?? '…'} />
        <KpiCard label="Total Available"     value={fmt$(k.total_available)}        color="green" />
        <KpiCard label="Total Encumbrances"  value={fmt$(k.total_encumbrances)}     color="yellow" />
        <KpiCard label="Over-Budget Funds"   value={k.over_budget_funds    ?? '…'}  color={Number(k.over_budget_funds) > 0 ? 'red' : 'green'} />
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Fund Summary' && (
        <div className="two-col">
          <SectionCard title="Fund Balances">
            {fL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Code</th><th>Fund Name</th><th>Type</th><th>FY</th>
                  <th>Ending Balance</th><th>Grant Fund</th>
                </tr></thead>
                <tbody>
                  {(funds || []).map(f => (
                    <tr key={f.fund_id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{f.fund_code}</td>
                      <td style={{ fontWeight: 500 }}>{f.fund_name}</td>
                      <td>{f.fund_type}</td>
                      <td>{f.fiscal_year}</td>
                      <td style={{ textAlign: 'right' }}>{fmt$(f.ending_balance)}</td>
                      <td><StatusBadge value={f.is_grant_fund ? 'Y' : 'N'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
          <SectionCard title="Balance by Fund">
            {fL ? <div className="loading">Loading…</div> : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name }) => name.split(' ')[0]}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => fmt$(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        </div>
      )}

      {tab === 'Available to Spend' && (
        <div>
          <SectionCard title="Budget vs Expenditures vs Encumbrances vs Available (by Fund)">
            {aL ? <div className="loading">Loading…</div> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={availChartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => '$' + (v / 1000000).toFixed(1) + 'M'} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => fmt$(v)} />
                  <Legend />
                  <Bar dataKey="Budget"       fill="#1a5c9e" radius={[3,3,0,0]} />
                  <Bar dataKey="Expenditures" fill="#d69e2e" radius={[3,3,0,0]} />
                  <Bar dataKey="Encumbrances" fill="#e53e3e" radius={[3,3,0,0]} />
                  <Bar dataKey="Available"    fill="#38a169" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Available-to-Spend Detail">
            {aL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Fund</th><th>Type</th>
                  <th>Appropriation</th><th>Expenditures</th><th>Encumbrances</th>
                  <th>Available to Spend</th><th>Burn %</th><th>Enc %</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {(available || []).map(f => {
                    const avail = Number(f.available_to_spend || 0);
                    return (
                      <tr key={f.fund_id}>
                        <td style={{ fontWeight: 500 }}>{f.fund_name}</td>
                        <td>{f.fund_type}</td>
                        <td style={{ textAlign: 'right' }}>{fmt$(f.budget)}</td>
                        <td style={{ textAlign: 'right' }}>{fmt$(f.expenditures)}</td>
                        <td style={{ textAlign: 'right' }}>{fmt$(f.encumbrances)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: avail < 0 ? 'var(--red)' : 'var(--green)' }}>
                          {fmt$(avail)}
                        </td>
                        <td style={{ textAlign: 'right' }}>{fmtPct(f.burn_pct)}</td>
                        <td style={{ textAlign: 'right' }}>{fmtPct(f.encumbrance_pct)}</td>
                        <td>
                          <span style={{
                            padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                            background: (STATUS_COLOR[f.budget_status] || '#888') + '22',
                            color: STATUS_COLOR[f.budget_status] || '#888',
                          }}>
                            {f.budget_status}
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

      {tab === 'Balance Detail' && (
        <SectionCard title="Fund Balance Detail">
          {bL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Fund</th><th>Type</th><th>FY</th>
                <th>Beginning</th><th>Revenues</th><th>Expenditures</th><th>Ending</th>
                <th>Restricted%</th><th>Unassigned%</th>
              </tr></thead>
              <tbody>
                {(balance || []).map(f => (
                  <tr key={f.fund_id}>
                    <td style={{ fontWeight: 500 }}>{f.fund_name}</td>
                    <td>{f.fund_type}</td>
                    <td>{f.fiscal_year}</td>
                    <td style={{ textAlign: 'right' }}>{fmt$(f.beginning_balance)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt$(f.revenues_ytd)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt$(f.expenditures_ytd)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(f.ending_balance)}</td>
                    <td style={{ textAlign: 'right' }}>{fmtPct(f.RESTRICTED_PCT)}</td>
                    <td style={{ textAlign: 'right' }}>{fmtPct(f.UNASSIGNED_PCT)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {tab === 'GASB-54 Classification' && (
        <SectionCard title="GASB Statement 54 Fund Balance Classification">
          {bL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Fund</th><th>GASB-54 Class</th><th>Justification</th>
                <th>Restricted</th><th>Committed</th><th>Assigned</th><th>Unassigned</th>
              </tr></thead>
              <tbody>
                {(balance || []).map(f => (
                  <tr key={f.fund_id}>
                    <td style={{ fontWeight: 500 }}>{f.fund_name}</td>
                    <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{f.GASB54_CLASSIFICATION ?? f.gasb54_class}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.CLASSIFICATION_JUSTIFICATION || '—'}</td>
                    <td style={{ textAlign: 'right' }}>{fmt$(f.restricted_amount)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt$(f.committed_amount)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt$(f.assigned_amount)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt$(f.unassigned_amount)}</td>
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
