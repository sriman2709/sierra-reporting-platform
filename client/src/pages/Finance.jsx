import { useState } from 'react';
import useData from '../components/useData';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, PieChart, Pie, Cell,
} from 'recharts';

const fmt$ = n =>
  n == null ? '—' : Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const TABS = ['Budget Control', 'Close Readiness', 'Journal Monitor', 'Interfund Activity'];

const BUDGET_STATUS_COLOR = {
  OVERRUN:      '#e53e3e',
  AT_RISK:      '#d69e2e',
  ON_TRACK:     '#38a169',
  UNDER_BUDGET: '#3182ce',
};

const ENTRY_STATUS_COLOR = {
  POSTED:    '#38a169',
  PENDING:   '#d69e2e',
  EXCEPTION: '#e53e3e',
  REVERSED:  '#718096',
};

const TASK_STATUS_COLOR = {
  COMPLETE:    '#38a169',
  IN_PROGRESS: '#3182ce',
  OVERDUE:     '#e53e3e',
  NOT_STARTED: '#718096',
};

const PRIORITY_COLOR = {
  HIGH:   '#e53e3e',
  MEDIUM: '#d69e2e',
  LOW:    '#718096',
};

const TRANSFER_STATUS_COLOR = {
  APPROVED: '#38a169',
  PENDING:  '#d69e2e',
  REVERSED: '#718096',
};

const PIE_COLORS = ['#38a169', '#3182ce', '#e53e3e', '#718096'];

function Badge({ value, colorMap, defaultColor = '#718096' }) {
  const color = colorMap?.[value] || defaultColor;
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
      background: color + '22', color,
    }}>{value || '—'}</span>
  );
}

function SpendBar({ pct }) {
  const p = Math.max(0, Math.min(100, Number(pct || 0)));
  const color = p > 100 ? '#e53e3e' : p >= 90 ? '#d69e2e' : '#38a169';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 7, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', minWidth: 70 }}>
        <div style={{ width: `${Math.min(p, 100)}%`, height: '100%', background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontWeight: 700, fontSize: 12, color, minWidth: 38 }}>{p}%</span>
    </div>
  );
}

const CustomPieLabel = ({ cx, cy, midAngle, outerRadius, name, value }) => {
  const RADIAN = Math.PI / 180;
  const r = outerRadius + 24;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  if (!value) return null;
  return (
    <text x={x} y={y} fill="#4a5568" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>
      {name}: {value}
    </text>
  );
};

export default function Finance() {
  const [tab, setTab] = useState('Budget Control');

  const { data: kpis,     loading: kL  } = useData('/finance/kpis');
  const { data: budget,   loading: bL  } = useData('/finance/budget-variance');
  const { data: close,    loading: clL } = useData('/finance/close-readiness');
  const { data: journals, loading: jL  } = useData('/finance/journals');
  const { data: interfund,loading: iL  } = useData('/finance/interfund');

  const k = kpis || {};

  // Budget by department for bar chart
  const deptMap = {};
  (budget || []).forEach(b => {
    if (!deptMap[b.department]) deptMap[b.department] = { Budget: 0, Actuals: 0, Encumbrances: 0 };
    deptMap[b.department].Budget       += Number(b.revised_budget || 0);
    deptMap[b.department].Actuals      += Number(b.actuals || 0);
    deptMap[b.department].Encumbrances += Number(b.encumbrances || 0);
  });
  const deptChart = Object.entries(deptMap).map(([name, vals]) => ({
    name: name.length > 14 ? name.slice(0, 12) + '…' : name,
    fullName: name,
    ...vals,
  }));

  // Close readiness — use first row's aggregate totals (they repeat per task)
  const firstRow = (close || [])[0] || {};
  const totalTasks   = Number(firstRow.TOTAL_TASKS   || 0);
  const completedT   = Number(firstRow.COMPLETED      || 0);
  const inProgressT  = Number(firstRow.IN_PROGRESS    || 0);
  const overdueT     = Number(firstRow.OVERDUE         || 0);
  const notStartedT  = Number(firstRow.NOT_STARTED     || 0);
  const completionPct = Number(firstRow.COMPLETION_PCT || 0);

  const pieData = [
    { name: 'Complete',    value: completedT  },
    { name: 'In Progress', value: inProgressT },
    { name: 'Overdue',     value: overdueT    },
    { name: 'Not Started', value: notStartedT },
  ].filter(d => d.value > 0);

  // Journal exception count
  const exceptions = (journals || []).filter(j => j.entry_status === 'EXCEPTION').length;
  const pending    = (journals || []).filter(j => j.entry_status === 'PENDING').length;

  // Interfund totals
  const interfundApproved = (interfund || []).filter(t => t.transfer_status === 'APPROVED');
  const interfundTotal    = interfundApproved.reduce((s, t) => s + Number(t.transfer_amount || 0), 0);

  return (
    <div>
      {/* KPI Row */}
      <div className="kpi-grid">
        <KpiCard label="Total Budget"       value={fmt$(k.total_budget)}    color="green" />
        <KpiCard label="Total Actuals"      value={fmt$(k.total_actuals)} />
        <KpiCard label="Available Balance"  value={fmt$(k.total_available)} color={Number(k.total_available) < 0 ? 'red' : ''} />
        <KpiCard label="Budget Overruns"    value={k.overrun_lines ?? '…'} color={Number(k.overrun_lines) > 0 ? 'red' : ''} />
        <KpiCard label="Journal Exceptions" value={k.journal_exceptions ?? '…'} color={Number(k.journal_exceptions) > 0 ? 'red' : ''} />
        <KpiCard label="Close Completion"   value={k.close_pct != null ? `${k.close_pct}%` : '…'} color={Number(k.close_pct) >= 80 ? 'green' : Number(k.close_pct) >= 50 ? 'yellow' : 'red'} />
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* ── Budget Control ── */}
      {tab === 'Budget Control' && (
        <div>
          <SectionCard title="Budget vs Actuals vs Encumbrances by Department">
            {bL ? <div className="loading">Loading…</div> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptChart} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => '$' + (v / 1000).toFixed(0) + 'K'} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => fmt$(v)} labelFormatter={(l, payload) => payload?.[0]?.payload?.fullName || l} />
                  <Legend />
                  <Bar dataKey="Budget"       fill="#1a5c9e" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Actuals"      fill="#e53e3e" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Encumbrances" fill="#d69e2e" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title={`Budget Lines — Variance Detail (${budget?.length ?? '…'})`}>
            {bL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Department</th><th>Account</th><th>Type</th><th>FY</th>
                  <th>Revised Budget</th><th>Actuals</th><th>Available</th>
                  <th>Spend %</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {(budget || []).map(b => (
                    <tr key={b.budget_id} style={{ background: b.BUDGET_STATUS === 'OVERRUN' ? '#fff5f522' : undefined }}>
                      <td style={{ fontWeight: 500 }}>{b.department}</td>
                      <td style={{ fontSize: 12 }}>{b.account_name}</td>
                      <td><Badge value={b.budget_type} /></td>
                      <td style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: 12 }}>{b.fiscal_year}</td>
                      <td style={{ textAlign: 'right' }}>{fmt$(b.revised_budget)}</td>
                      <td style={{ textAlign: 'right', color: Number(b.actuals) > Number(b.revised_budget) ? '#e53e3e' : undefined, fontWeight: Number(b.actuals) > Number(b.revised_budget) ? 700 : 400 }}>{fmt$(b.actuals)}</td>
                      <td style={{ textAlign: 'right', color: Number(b.AVAILABLE_BALANCE) < 0 ? '#e53e3e' : undefined }}>{fmt$(b.AVAILABLE_BALANCE)}</td>
                      <td style={{ minWidth: 120 }}><SpendBar pct={b.SPEND_PCT} /></td>
                      <td><Badge value={b.BUDGET_STATUS} colorMap={BUDGET_STATUS_COLOR} /></td>
                    </tr>
                  ))}
                  {!(budget || []).length && (
                    <tr><td colSpan={9} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No budget data found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Close Readiness ── */}
      {tab === 'Close Readiness' && (
        <div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 20, alignItems: 'stretch', flexWrap: 'wrap' }}>
            {/* Donut chart + completion metric */}
            <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px rgba(0,0,0,.08)', padding: '20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 280 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4a5568', marginBottom: 8 }}>Period Close Status</div>
              <div style={{ position: 'relative' }}>
                {clL ? <div className="loading">Loading…</div> : (
                  <PieChart width={200} height={200}>
                    <Pie data={pieData} cx={100} cy={100} innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                  </PieChart>
                )}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                  textAlign: 'center', pointerEvents: 'none',
                }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: completionPct >= 80 ? '#38a169' : completionPct >= 50 ? '#d69e2e' : '#e53e3e', lineHeight: 1 }}>
                    {completionPct}%
                  </div>
                  <div style={{ fontSize: 10, color: '#718096', marginTop: 2 }}>COMPLETE</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {pieData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i] }} />
                    <span style={{ color: '#4a5568' }}>{d.name}: <strong>{d.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary tiles */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <KpiCard label="Total Tasks"   value={totalTasks} />
              <KpiCard label="Complete"      value={completedT}  color="green" />
              <KpiCard label="In Progress"   value={inProgressT} />
              <KpiCard label="Overdue"       value={overdueT}    color={overdueT > 0 ? 'red' : ''} />
              <KpiCard label="Not Started"   value={notStartedT} color={notStartedT > 0 ? 'yellow' : ''} />
            </div>
          </div>

          <SectionCard title={`Close Checklist — ${firstRow.period || '—'}`}>
            {clL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Task</th><th>Category</th><th>Assigned To</th>
                  <th>Due Date</th><th>Completed</th><th>Priority</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {(close || []).map(t => (
                    <tr key={t.task_id} style={{ background: t.task_status === 'OVERDUE' ? '#fff5f522' : undefined }}>
                      <td style={{ fontWeight: 500, maxWidth: 220 }}>{t.task_name}</td>
                      <td><Badge value={t.task_category} /></td>
                      <td>{t.assigned_to}</td>
                      <td style={{ color: t.task_status === 'OVERDUE' ? '#e53e3e' : undefined, fontWeight: t.task_status === 'OVERDUE' ? 700 : 400 }}>
                        {fmtDate(t.due_date)}
                      </td>
                      <td>{t.completion_date ? fmtDate(t.completion_date) : <span style={{ color: '#a0aec0' }}>—</span>}</td>
                      <td><Badge value={t.priority} colorMap={PRIORITY_COLOR} /></td>
                      <td><Badge value={t.task_status} colorMap={TASK_STATUS_COLOR} /></td>
                    </tr>
                  ))}
                  {!(close || []).length && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No close tasks found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Journal Monitor ── */}
      {tab === 'Journal Monitor' && (
        <div>
          <div className="kpi-grid" style={{ marginBottom: 16 }}>
            <KpiCard label="Total Entries"  value={(journals || []).length} />
            <KpiCard label="Exceptions"     value={exceptions} color={exceptions > 0 ? 'red' : ''} />
            <KpiCard label="Pending/Unposted" value={pending} color={pending > 0 ? 'yellow' : ''} />
            <KpiCard label="Unusual Flags"  value={(journals || []).filter(j => j.is_unusual === 'Y').length} color="yellow" />
          </div>
          <SectionCard title={`Journal Entries (${journals?.length ?? '…'})`}>
            {jL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Date</th><th>Period</th><th>Account</th><th>Description</th>
                  <th>Debit</th><th>Credit</th><th>Entered By</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {(journals || []).map(j => (
                    <tr key={j.journal_id} style={{ background: j.entry_status === 'EXCEPTION' ? '#fff5f522' : undefined }}>
                      <td>{fmtDate(j.entry_date)}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{j.period}</td>
                      <td style={{ fontSize: 12 }}>{j.account_name}</td>
                      <td style={{ maxWidth: 200, fontSize: 12 }}>
                        {j.is_unusual === 'Y' && <span title="Unusual Entry" style={{ marginRight: 4 }}>⚠️</span>}
                        {j.description}
                      </td>
                      <td style={{ textAlign: 'right' }}>{Number(j.debit_amount) > 0 ? fmt$(j.debit_amount) : '—'}</td>
                      <td style={{ textAlign: 'right' }}>{Number(j.credit_amount) > 0 ? fmt$(j.credit_amount) : '—'}</td>
                      <td style={{ fontSize: 12 }}>{j.entered_by}</td>
                      <td><Badge value={j.entry_status} colorMap={ENTRY_STATUS_COLOR} /></td>
                    </tr>
                  ))}
                  {!(journals || []).length && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No journal entries found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Interfund Activity ── */}
      {tab === 'Interfund Activity' && (
        <div>
          <div className="kpi-grid" style={{ marginBottom: 16 }}>
            <KpiCard label="Total Transfers"   value={(interfund || []).length} />
            <KpiCard label="Approved Volume"   value={fmt$(interfundTotal)} color="green" />
            <KpiCard label="Pending Transfers" value={(interfund || []).filter(t => t.transfer_status === 'PENDING').length} color="yellow" />
            <KpiCard label="Reversed"          value={(interfund || []).filter(t => t.transfer_status === 'REVERSED').length} />
          </div>
          <SectionCard title={`Interfund Transfers (${interfund?.length ?? '…'})`}>
            {iL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Date</th><th>FY</th><th>From Fund</th><th>To Fund</th>
                  <th>Amount</th><th>Purpose</th><th>Approved By</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {(interfund || []).map(t => (
                    <tr key={t.transfer_id}>
                      <td>{fmtDate(t.transfer_date)}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, textAlign: 'center' }}>{t.fiscal_year}</td>
                      <td style={{ fontSize: 12 }}>{t.from_fund_id}</td>
                      <td style={{ fontSize: 12 }}>{t.to_fund_id}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(t.transfer_amount)}</td>
                      <td style={{ fontSize: 12, maxWidth: 220 }}>{t.transfer_purpose}</td>
                      <td style={{ fontSize: 12 }}>{t.approved_by || '—'}</td>
                      <td><Badge value={t.transfer_status} colorMap={TRANSFER_STATUS_COLOR} /></td>
                    </tr>
                  ))}
                  {!(interfund || []).length && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No interfund transfers found</td></tr>
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
