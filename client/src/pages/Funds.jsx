import { useState } from 'react';
import useData from '../components/useData';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const fmt$ = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
const fmtPct = n => n == null ? '—' : Number(n).toFixed(1) + '%';

const TABS = ['Fund Summary', 'Balance Detail', 'GASB-54 Classification'];
const COLORS = ['#1a5c9e', '#38a169', '#d69e2e', '#e53e3e', '#805ad5'];

export default function Funds() {
  const [tab, setTab] = useState('Fund Summary');
  const { data: funds,   loading: fL } = useData('/funds');
  const { data: balance, loading: bL } = useData('/funds/balance');
  const { data: kpis,    loading: kL } = useData('/funds/kpis');

  const k = kpis?.[0] || {};

  const pieData = (funds || []).map(f => ({
    name: f.fund_name,
    value: Number(f.ending_balance || 0),
  })).filter(d => d.value > 0);

  return (
    <div>
      <div className="kpi-grid">
        <KpiCard label="Total Funds"        value={k.CNT ?? k.total_funds ?? '…'} />
        <KpiCard label="Total Balance"       value={fmt$(k.TOTAL ?? k.total_balance)} color="green" />
        <KpiCard label="Restricted Balance"  value={fmt$(k.RESTRICTED ?? k.total_restricted)} color="yellow" />
        <KpiCard label="Unassigned Balance"  value={fmt$(k.UNASSIGNED ?? k.total_unassigned)} color="" />
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
                <th>Fund</th><th>GASB-54 Class</th><th>Nonspendable</th>
                <th>Restricted</th><th>Committed</th><th>Assigned</th><th>Unassigned</th>
              </tr></thead>
              <tbody>
                {(balance || []).map(f => (
                  <tr key={f.fund_id}>
                    <td style={{ fontWeight: 500 }}>{f.fund_name}</td>
                    <td>{f.GASB54_CLASSIFICATION ?? f.gasb54_class}</td>
                    <td style={{ textAlign: 'right' }}>{fmt$(f.restricted_amount)}</td>
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
