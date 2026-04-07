import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts';
import useData from '../components/useData';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';

/* ── Formatters ──────────────────────────────────────────────────────────── */
const fmt$ = n =>
  n == null ? '—' : Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtM = n =>
  n == null ? '—' : `$${(Number(n) / 1_000_000).toFixed(2)}M`;
const fmtPct = n => n == null ? '—' : `${Number(n).toFixed(1)}%`;
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtNum = n => n == null ? '—' : Number(n).toLocaleString();

const TABS = ['Overview', 'Cash Position', 'Investments', 'Debt Service', 'Tax Revenue'];

const ACCT_COLORS = {
  OPERATING:  '#3182ce',
  RESERVE:    '#38a169',
  RESTRICTED: '#805ad5',
  INVESTMENT: '#d69e2e',
};
const INV_COLORS  = ['#3182ce','#38a169','#d69e2e','#805ad5','#e53e3e','#0097a7'];
const RATING_COLOR = { AAA: '#38a169', 'AA+': '#38a169', 'AA': '#68d391', 'AA-': '#68d391', 'A+': '#d69e2e', 'A': '#d69e2e', 'A-': '#ed8936', BBB: '#e53e3e' };

function Badge({ value, colorMap, defaultColor = '#718096' }) {
  const color = colorMap?.[value] ?? defaultColor;
  return (
    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
      background: color + '22', color, whiteSpace: 'nowrap' }}>
      {value?.replace(/_/g, ' ') || '—'}
    </span>
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
          {p.name}: {typeof p.value === 'number' && p.value > 1000 ? fmt$(p.value) : fmtPct(p.value)}
        </div>
      ))}
    </div>
  );
};

/* ── Progress bar ─────────────────────────────────────────────────────────── */
function ProgressBar({ value, max, color = '#3182ce', height = 8 }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  return (
    <div style={{ background: '#e2e8f0', borderRadius: 4, height, overflow: 'hidden', width: '100%' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4,
        transition: 'width 0.4s ease' }} />
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function Treasury() {
  const [tab, setTab] = useState('Overview');

  const { data: kpis,      loading: kL } = useData('/treasury/kpis');
  const { data: cash,      loading: cL } = useData('/treasury/cash-accounts');
  const { data: invs,      loading: iL } = useData('/treasury/investments');
  const { data: debt,      loading: dL } = useData('/treasury/debt-service');
  const { data: taxTrend,  loading: tL } = useData('/treasury/tax-trend');
  const { data: revByType, loading: rL } = useData('/treasury/revenue-by-type');
  const { data: cashType,  loading: ctL } = useData('/treasury/cash-by-type');
  const { data: invType,   loading: itL } = useData('/treasury/investments-by-type');

  const k         = kpis && !Array.isArray(kpis) ? kpis : {};
  const safeCash  = Array.isArray(cash)    ? cash    : [];
  const safeInvs  = Array.isArray(invs)    ? invs    : [];
  const safeDebt  = Array.isArray(debt)    ? debt    : [];
  const safeTax   = Array.isArray(taxTrend)? taxTrend: [];
  const safeRev   = Array.isArray(revByType)? revByType:[];
  const safeCType = Array.isArray(cashType) ? cashType : [];
  const safeIType = Array.isArray(invType)  ? invType  : [];

  /* Charts */
  const taxChartData = (() => {
    const months = [...new Set(safeTax.map(r => r.period_label))];
    return months.map(m => {
      const rows = safeTax.filter(r => r.period_label === m);
      const obj = { period: m };
      rows.forEach(r => { obj[r.tax_type] = Number(r.amount_collected || 0); });
      return obj;
    });
  })();
  const taxTypes = [...new Set(safeTax.map(r => r.tax_type))];

  const cashPie = safeCType.map(r => ({
    name: r.account_type?.replace(/_/g, ' '),
    value: Number(r.total_balance || 0),
  }));
  const invPie = safeIType.map(r => ({
    name: r.investment_type?.replace(/_/g, ' '),
    value: Number(r.total_market || 0),
  }));

  const debtAlert = safeDebt.filter(d => Number(d.days_to_payment) <= 30);
  const maturingInvs = safeInvs.filter(i => Number(i.days_to_maturity) <= 90 && i.status === 'ACTIVE');

  return (
    <div>
      {/* ── KPI Row ── */}
      <div className="kpi-grid">
        <KpiCard label="Total Cash Position"    value={fmtM(k.total_cash_position)} color="blue" />
        <KpiCard label="Operating Cash"          value={fmtM(k.operating_cash)}       color="green" />
        <KpiCard label="Reserve Cash"            value={fmtM(k.reserve_cash)}         />
        <KpiCard label="Investment Portfolio"    value={fmtM(k.total_investments)}    color="blue" />
        <KpiCard label="Total Debt Outstanding"  value={fmtM(k.total_debt_outstanding)} color={Number(k.total_debt_outstanding) > 0 ? 'yellow' : ''} />
        <KpiCard label="Tax Revenue YTD"         value={fmtM(k.tax_revenue_ytd)}     color="green" />
      </div>

      {/* ── Alerts ── */}
      {debtAlert.length > 0 && (
        <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8,
          padding: '12px 16px', marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 18 }}>🔔</span>
          <span style={{ color: '#c53030', fontWeight: 600 }}>
            {debtAlert.length} debt service payment(s) due within 30 days — action required
          </span>
        </div>
      )}
      {maturingInvs.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: 8,
          padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 18 }}>📅</span>
          <span style={{ color: '#744210', fontWeight: 600 }}>
            {maturingInvs.length} investment(s) maturing within 90 days — review reinvestment strategy
          </span>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          OVERVIEW TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'Overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Cash by account type */}
            <SectionCard title="Cash Position by Account Type">
              {ctL ? <div className="loading">Loading…</div> : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={cashPie} cx="50%" cy="50%" innerRadius={44} outerRadius={72} dataKey="value">
                        {cashPie.map((d, i) => (
                          <Cell key={i} fill={ACCT_COLORS[safeCType[i]?.account_type] || INV_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={v => fmt$(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    {safeCType.map((r, i) => {
                      const color = ACCT_COLORS[r.account_type] || INV_COLORS[i];
                      return (
                        <div key={r.account_type} style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                            <span style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color, fontWeight: 600 }}>{r.account_type}</span>
                            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700 }}>{fmt$(r.total_balance)}</span>
                          </div>
                          <ProgressBar value={Number(r.total_balance)} max={Number(k.total_cash_position)} color={color} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Investment portfolio mix */}
            <SectionCard title="Investment Portfolio Mix">
              {itL ? <div className="loading">Loading…</div> : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={invPie} cx="50%" cy="50%" innerRadius={44} outerRadius={72} dataKey="value">
                        {invPie.map((d, i) => <Cell key={i} fill={INV_COLORS[i]} />)}
                      </Pie>
                      <Tooltip formatter={v => fmt$(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    {safeIType.map((r, i) => (
                      <div key={r.investment_type} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 2, background: INV_COLORS[i], flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: INV_COLORS[i] }}>
                            {r.investment_type?.replace(/_/g, ' ')}
                          </span>
                          <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700 }}>{fmt$(r.total_market)}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#718096', marginBottom: 2 }}>
                          Avg Yield: <strong>{fmtPct(r.avg_yield * 100)}</strong>
                        </div>
                        <ProgressBar value={Number(r.total_market)} max={Number(k.total_investments)} color={INV_COLORS[i]} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>
          </div>

          {/* Tax Revenue by Type */}
          <SectionCard title="Tax Revenue vs Budget YTD">
            {rL ? <div className="loading">Loading…</div> : (
              <div>
                {safeRev.map(r => {
                  const pct = Number(r.pct_of_budget || 0);
                  const barColor = pct >= 100 ? '#38a169' : pct >= 80 ? '#d69e2e' : '#e53e3e';
                  return (
                    <div key={r.tax_type} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{r.tax_type?.replace(/_/g, ' ')}</span>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 12 }}>
                          <span>Collected: <strong>{fmt$(r.total_collected)}</strong></span>
                          <span style={{ color: '#718096' }}>Budget: {fmt$(r.total_budgeted)}</span>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                            background: barColor + '22', color: barColor }}>
                            {fmtPct(pct)} of budget
                          </span>
                        </div>
                      </div>
                      <ProgressBar value={Number(r.total_collected)} max={Number(r.total_budgeted)} color={barColor} height={10} />
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CASH POSITION TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'Cash Position' && (
        <SectionCard title={`Cash Accounts (${safeCash.length})`}>
          {cL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Account Name</th><th>Type</th><th>Bank</th>
                <th>Account #</th><th>Fund ID</th><th>Balance</th><th>As Of</th>
              </tr></thead>
              <tbody>
                {safeCash.map(r => {
                  const color = ACCT_COLORS[r.account_type] || '#718096';
                  return (
                    <tr key={r.account_id}>
                      <td style={{ fontWeight: 600 }}>{r.account_name}</td>
                      <td><Badge value={r.account_type} colorMap={ACCT_COLORS} /></td>
                      <td style={{ fontSize: 12 }}>{r.bank_name}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#718096' }}>
                        ••••{r.account_number_last4}
                      </td>
                      <td style={{ fontSize: 12 }}>{r.fund_id || '—'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color }}>{fmt$(r.balance)}</td>
                      <td style={{ fontSize: 12 }}>{fmtDate(r.as_of_date)}</td>
                    </tr>
                  );
                })}
                {!safeCash.length && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No cash accounts found</td></tr>
                )}
                {safeCash.length > 0 && (
                  <tr style={{ background: '#ebf8ff', fontWeight: 700 }}>
                    <td colSpan={5} style={{ textAlign: 'right', paddingRight: 12 }}>Total Cash Position</td>
                    <td style={{ textAlign: 'right', color: '#2b6cb0', fontSize: 15 }}>{fmt$(k.total_cash_position)}</td>
                    <td />
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          INVESTMENTS TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'Investments' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: '#ebf8ff', border: '1px solid #90cdf4', borderRadius: 8, padding: '16px 20px' }}>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Total Portfolio Value</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#2b6cb0' }}>{fmtM(k.total_investments)}</div>
            </div>
            <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: 8, padding: '16px 20px' }}>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Active Investments</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#276749' }}>
                {safeInvs.filter(i => i.status === 'ACTIVE').length}
              </div>
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: 8, padding: '16px 20px' }}>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Maturing ≤ 90 Days</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#744210' }}>{k.investments_maturing_90d ?? '—'}</div>
            </div>
          </div>

          <SectionCard title={`Investment Portfolio (${safeInvs.length} positions)`}>
            {iL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Type</th><th>Issuer</th><th>Par Value</th><th>Market Value</th>
                  <th>Gain / Loss</th><th>Yield</th><th>Rating</th>
                  <th>Maturity Date</th><th>Days to Mat.</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {safeInvs.map(r => {
                    const gain = Number(r.unrealized_gain || 0);
                    const gainColor = gain >= 0 ? '#38a169' : '#e53e3e';
                    const dtm = Number(r.days_to_maturity || 0);
                    return (
                      <tr key={r.investment_id} style={{ background: dtm <= 30 && r.status === 'ACTIVE' ? '#fffbeb' : undefined }}>
                        <td><Badge value={r.investment_type} colorMap={{
                          BOND: '#3182ce', TBILL: '#38a169', MONEY_MARKET: '#d69e2e',
                          CD: '#805ad5', AGENCY: '#0097a7',
                        }} /></td>
                        <td style={{ fontWeight: 600, fontSize: 13 }}>{r.issuer}</td>
                        <td style={{ textAlign: 'right' }}>{fmt$(r.par_value)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt$(r.current_value)}</td>
                        <td style={{ textAlign: 'right', color: gainColor, fontWeight: 600 }}>
                          {gain >= 0 ? '+' : ''}{fmt$(gain)}
                          <span style={{ fontSize: 11, marginLeft: 4 }}>({fmtPct(r.gain_pct)})</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>{fmtPct(Number(r.yield_rate) * 100)}</td>
                        <td>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                            background: (RATING_COLOR[r.rating] || '#718096') + '22',
                            color: RATING_COLOR[r.rating] || '#718096' }}>
                            {r.rating || '—'}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: dtm <= 90 ? '#d69e2e' : undefined, fontWeight: dtm <= 90 ? 600 : 400 }}>
                          {fmtDate(r.maturity_date)}
                        </td>
                        <td style={{ textAlign: 'center', color: dtm <= 30 ? '#e53e3e' : dtm <= 90 ? '#d69e2e' : undefined, fontWeight: dtm <= 90 ? 700 : 400 }}>
                          {dtm > 0 ? `${dtm}d` : 'Matured'}
                        </td>
                        <td><Badge value={r.status} colorMap={{ ACTIVE: '#38a169', MATURED: '#718096', SOLD: '#805ad5' }} /></td>
                      </tr>
                    );
                  })}
                  {!safeInvs.length && (
                    <tr><td colSpan={10} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No investment records found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          DEBT SERVICE TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'Debt Service' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8, padding: '16px 20px' }}>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Total Debt Outstanding</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#c53030' }}>{fmtM(k.total_debt_outstanding)}</div>
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: 8, padding: '16px 20px' }}>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Annual Debt Service</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#744210' }}>{fmt$(k.annual_debt_service)}</div>
            </div>
          </div>

          <SectionCard title={`Debt Service Schedule (${safeDebt.length} obligations)`}>
            {dL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Description</th><th>Type</th><th>Original Principal</th>
                  <th>Outstanding Balance</th><th>% Remaining</th><th>Interest Rate</th>
                  <th>Annual Payment</th><th>Next Payment</th><th>Days Away</th><th>Maturity Year</th>
                </tr></thead>
                <tbody>
                  {safeDebt.map(r => {
                    const dtp = Number(r.days_to_payment || 0);
                    const urgent = dtp <= 30;
                    return (
                      <tr key={r.debt_id} style={{ background: urgent ? '#fff5f5' : undefined }}>
                        <td style={{ fontWeight: 600, maxWidth: 200 }}>{r.bond_description}</td>
                        <td><Badge value={r.bond_type} colorMap={{
                          GO_BOND: '#3182ce', REVENUE_BOND: '#805ad5',
                          LEASE: '#d69e2e', COP: '#38a169',
                        }} /></td>
                        <td style={{ textAlign: 'right' }}>{fmt$(r.original_principal)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#c53030' }}>{fmt$(r.outstanding_balance)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <ProgressBar value={Number(r.pct_remaining)} max={100} color="#e53e3e" height={6} />
                          <span style={{ fontSize: 11, color: '#718096' }}>{fmtPct(r.pct_remaining)}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>{fmtPct(r.interest_rate)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(r.annual_payment)}</td>
                        <td style={{ fontSize: 12, color: urgent ? '#c53030' : undefined, fontWeight: urgent ? 700 : 400 }}>
                          {fmtDate(r.next_payment_date)}
                        </td>
                        <td style={{ textAlign: 'center', color: urgent ? '#e53e3e' : dtp <= 90 ? '#d69e2e' : undefined, fontWeight: dtp <= 90 ? 700 : 400 }}>
                          {dtp > 0 ? `${dtp}d` : '🔴 Past Due'}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{r.maturity_year}</td>
                      </tr>
                    );
                  })}
                  {!safeDebt.length && (
                    <tr><td colSpan={10} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No debt service records found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAX REVENUE TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'Tax Revenue' && (
        <div>
          <SectionCard title="Monthly Tax Revenue Trend by Type">
            {tL ? <div className="loading">Loading…</div> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={taxChartData} margin={{ top: 8, right: 16, left: 16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                  <Tooltip content={<ChartTip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {taxTypes.map((t, i) => (
                    <Bar key={t} dataKey={t} stackId="a" fill={INV_COLORS[i % INV_COLORS.length]} radius={i === taxTypes.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Tax Revenue Detail — YTD" style={{ marginTop: 20 }}>
            {tL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Tax Type</th><th>Period</th><th>Collected</th>
                  <th>Budgeted</th><th>% of Budget</th>
                </tr></thead>
                <tbody>
                  {safeTax.filter(r => r.fiscal_year === new Date().getFullYear()).map((r, i) => {
                    const pct = Number(r.pct_of_budget || 0);
                    const barColor = pct >= 100 ? '#38a169' : pct >= 80 ? '#d69e2e' : '#e53e3e';
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{r.tax_type?.replace(/_/g, ' ')}</td>
                        <td style={{ fontSize: 12 }}>{r.period_label}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt$(r.amount_collected)}</td>
                        <td style={{ textAlign: 'right', color: '#718096' }}>{fmt$(r.amount_budgeted)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                            background: barColor + '22', color: barColor }}>
                            {fmtPct(pct)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {!safeTax.length && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No tax revenue records found</td></tr>
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
