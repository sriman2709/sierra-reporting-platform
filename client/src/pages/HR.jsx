import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import useData from '../components/useData';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';

const fmt$ = n =>
  n == null ? '—' : Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtM = n =>
  n == null ? '—' : `$${(Number(n) / 1_000_000).toFixed(2)}M`;
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtPct = n => n == null ? '—' : `${Number(n).toFixed(1)}%`;

const TABS = ['Overview', 'Employees', 'Positions', 'Payroll'];

const HEALTH_COLOR  = { CRITICAL: '#e53e3e', AT_RISK: '#ed8936', ADEQUATE: '#d69e2e', GOOD: '#38a169' };
const EMP_TYPE_COLOR= { FULL_TIME: '#3182ce', PART_TIME: '#805ad5', CONTRACTOR: '#d69e2e' };
const FILL_COLOR    = { VACANT: '#e53e3e', PARTIALLY_FILLED: '#d69e2e', FULLY_STAFFED: '#38a169' };
const DEPT_COLORS   = ['#3182ce','#805ad5','#2c7a7b','#d69e2e','#e53e3e','#38a169','#ed8936'];

function Badge({ value, colorMap, defaultColor = '#718096' }) {
  const color = (colorMap?.[value]) || defaultColor;
  return (
    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: color + '22', color }}>
      {value?.replace(/_/g, ' ') || '—'}
    </span>
  );
}

const CHART_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 999 ? fmt$(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

export default function HR() {
  const [tab, setTab] = useState('Overview');

  const { data: kpis,          loading: kL } = useData('/hr/kpis');
  const { data: employees,     loading: eL } = useData('/hr/employees');
  const { data: positions,     loading: pL } = useData('/hr/positions');
  const { data: turnover,      loading: tL } = useData('/hr/turnover');
  const { data: payroll,       loading: yL } = useData('/hr/payroll');
  const { data: fundAlloc,     loading: fL } = useData('/hr/fund-allocation');

  const k          = (kpis && typeof kpis === 'object' && !Array.isArray(kpis)) ? kpis : {};
  const safeEmps   = Array.isArray(employees)   ? employees   : [];
  const safePos    = Array.isArray(positions)   ? positions   : [];
  const safeTurn   = Array.isArray(turnover)    ? turnover    : [];
  const safePay    = Array.isArray(payroll)     ? payroll     : [];
  const safeFund   = Array.isArray(fundAlloc)   ? fundAlloc   : [];

  const vacancyPct = Number(k.vacancy_rate_pct || 0);

  // Dept salary chart
  const deptChart = safeTurn.map(r => ({
    name: r.department,
    'Salary Total': Number(r.dept_salary_total || 0),
    'Avg Salary':   Number(r.avg_salary || 0),
  }));

  // Emp type pie
  const empTypePie = [
    { name: 'Full Time',   value: Number(k.full_time   || 0) },
    { name: 'Part Time',   value: Number(k.part_time   || 0) },
    { name: 'Contractor',  value: Number(k.contractors || 0) },
  ].filter(d => d.value > 0);

  return (
    <div>
      {/* KPI Row */}
      <div className="kpi-grid">
        <KpiCard label="Total Employees"   value={k.total_employees ?? '…'} />
        <KpiCard label="Total Salary Cost" value={fmtM(k.total_salary_budget)} color="green" />
        <KpiCard label="Grant-Funded FTEs" value={k.grant_funded_fte ?? '…'} color="blue" />
        <KpiCard label="Vacancy Rate"      value={fmtPct(k.vacancy_rate_pct)} color={vacancyPct > 10 ? 'red' : vacancyPct > 5 ? 'yellow' : ''} />
        <KpiCard label="Avg Salary"        value={fmt$(k.avg_salary)} />
        <KpiCard label="On Leave"          value={k.on_leave ?? '…'} color={Number(k.on_leave) > 0 ? 'yellow' : ''} />
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'Overview' && (
        <div>
          {vacancyPct > 10 && (
            <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>🚨</span>
              <span style={{ color: '#c53030', fontWeight: 600 }}>
                Vacancy rate at {fmtPct(k.vacancy_rate_pct)} — {Number(k.budgeted_fte || 0) - Number(k.filled_fte || 0)} FTE positions unfilled
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Employment type pie */}
            <SectionCard title="Workforce Composition">
              {kL ? <div className="loading">Loading…</div> : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={empTypePie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                        {empTypePie.map((_, i) => <Cell key={i} fill={Object.values(EMP_TYPE_COLOR)[i]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    {empTypePie.map((d, i) => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: Object.values(EMP_TYPE_COLOR)[i], flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 13 }}>{d.name}</span>
                        <span style={{ fontWeight: 700 }}>{d.value}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #e2e8f0', fontSize: 12, color: '#718096' }}>
                      <div>Budgeted FTE: <strong>{k.budgeted_fte}</strong></div>
                      <div>Filled FTE: <strong>{k.filled_fte}</strong></div>
                      <div style={{ color: vacancyPct > 10 ? '#e53e3e' : '#718096' }}>
                        Grant-Funded: <strong>{k.grant_funded_fte}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Dept salary chart */}
            <SectionCard title="Salary Budget by Department">
              {tL ? <div className="loading">Loading…</div> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={deptChart} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CHART_TOOLTIP />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Salary Total" fill="#3182ce" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </SectionCard>
          </div>

          {/* Dept summary */}
          <SectionCard title="Workforce Summary by Department" style={{ marginTop: 20 }}>
            {tL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Department</th><th>Employees</th><th>Avg Salary</th>
                  <th>Salary Total</th><th>Avg Tenure</th><th>Grant-Funded</th><th>On Leave</th>
                </tr></thead>
                <tbody>
                  {safeTurn.map(r => (
                    <tr key={r.department}>
                      <td style={{ fontWeight: 600 }}>{r.department}</td>
                      <td style={{ textAlign: 'center' }}>{r.employee_count}</td>
                      <td style={{ textAlign: 'right' }}>{fmt$(r.avg_salary)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(r.dept_salary_total)}</td>
                      <td style={{ textAlign: 'center' }}>{r.avg_tenure_years}y</td>
                      <td style={{ textAlign: 'center', color: r.grant_funded > 0 ? '#3182ce' : undefined, fontWeight: r.grant_funded > 0 ? 700 : 400 }}>
                        {r.grant_funded || 0}
                      </td>
                      <td style={{ textAlign: 'center', color: r.on_leave > 0 ? '#d69e2e' : undefined }}>{r.on_leave || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>

          {/* Fund allocation */}
          <SectionCard title="Salary Cost by Fund (YTD)" style={{ marginTop: 20 }}>
            {fL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Fund</th><th>Department</th><th>Employees</th>
                  <th>Payroll Runs</th><th>Total Gross Pay</th><th>Avg per Run</th>
                </tr></thead>
                <tbody>
                  {safeFund.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{r.fund_code}</td>
                      <td>{r.department}</td>
                      <td style={{ textAlign: 'center' }}>{r.employee_count}</td>
                      <td style={{ textAlign: 'center' }}>{r.payroll_runs}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(r.total_gross_pay)}</td>
                      <td style={{ textAlign: 'right' }}>{fmt$(r.avg_gross_pay)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Employees ── */}
      {tab === 'Employees' && (
        <SectionCard title={`Employee Health Dashboard (${safeEmps.length || '…'} active)`}>
          {eL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Emp #</th><th>Name</th><th>Position</th><th>Department</th>
                <th>Type</th><th>Annual Salary</th><th>Tenure</th>
                <th>Grant-Funded</th><th>Status</th><th>Health</th>
              </tr></thead>
              <tbody>
                {safeEmps.map(e => {
                  const hColor = HEALTH_COLOR[e.HEALTH_STATUS] || '#718096';
                  return (
                    <tr key={e.employee_id} style={{ background: e.HEALTH_STATUS === 'CRITICAL' ? '#fff5f5' : undefined }}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{e.employee_number}</td>
                      <td style={{ fontWeight: 600 }}>{e.full_name}</td>
                      <td style={{ fontSize: 12 }}>{e.position_title}</td>
                      <td style={{ fontSize: 12 }}>{e.department}</td>
                      <td><Badge value={e.employment_type} colorMap={EMP_TYPE_COLOR} /></td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(e.annual_salary)}</td>
                      <td style={{ textAlign: 'center', fontSize: 12 }}>{e.TENURE_YEARS}y</td>
                      <td style={{ textAlign: 'center' }}>
                        {e.is_grant_funded === 1
                          ? <span style={{ color: '#3182ce', fontWeight: 700 }}>✓</span>
                          : <span style={{ color: '#a0aec0' }}>—</span>}
                      </td>
                      <td><Badge value={e.emp_status} colorMap={{ ACTIVE: '#38a169', ON_LEAVE: '#d69e2e', TERMINATED: '#e53e3e' }} /></td>
                      <td>
                        <span style={{ padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: hColor + '22', color: hColor }}>
                          {e.HEALTH_STATUS}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!safeEmps.length && (
                  <tr><td colSpan={10} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No employee data found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* ── Positions ── */}
      {tab === 'Positions' && (
        <SectionCard title={`Position Control (${safePos.length || '…'} active positions)`}>
          {pL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Code</th><th>Title</th><th>Department</th><th>Fund</th>
                <th>Budgeted FTE</th><th>Filled FTE</th><th>Vacancy</th>
                <th>Salary Budget</th><th>Avg Budgeted Salary</th><th>Status</th>
              </tr></thead>
              <tbody>
                {safePos.map(p => {
                  const fillColor = FILL_COLOR[p.FILL_STATUS] || '#718096';
                  return (
                    <tr key={p.position_id} style={{ background: p.FILL_STATUS === 'VACANT' ? '#fff5f5' : undefined }}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.position_code}</td>
                      <td style={{ fontWeight: 600 }}>{p.position_title}</td>
                      <td style={{ fontSize: 12 }}>{p.department}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.fund_code}</td>
                      <td style={{ textAlign: 'center' }}>{p.budgeted_fte}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{p.filled_fte}</td>
                      <td style={{ textAlign: 'center', color: Number(p.vacancy_fte) > 0 ? '#e53e3e' : '#38a169', fontWeight: 700 }}>
                        {Number(p.vacancy_fte) > 0 ? `${p.vacancy_fte} open` : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>{fmt$(p.salary_budget)}</td>
                      <td style={{ textAlign: 'right' }}>{fmt$(p.avg_budgeted_salary)}</td>
                      <td>
                        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: fillColor + '22', color: fillColor }}>
                          {p.FILL_STATUS?.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!safePos.length && (
                  <tr><td colSpan={10} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No position data found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* ── Payroll ── */}
      {tab === 'Payroll' && (
        <SectionCard title={`Payroll Records — Last 90 Days (${safePay.length || '…'})`}>
          {yL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Pay Period</th><th>Employee</th><th>Position</th>
                <th>Department</th><th>Fund</th><th>Type</th>
                <th>Gross Pay</th><th>Deductions</th><th>Net Pay</th>
              </tr></thead>
              <tbody>
                {safePay.map(r => (
                  <tr key={r.payroll_id}>
                    <td style={{ fontSize: 12 }}>
                      <div>{fmtDate(r.pay_period_start)}</div>
                      <div style={{ color: '#718096', fontSize: 11 }}>→ {fmtDate(r.pay_period_end)}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <span style={{ fontFamily: 'monospace', color: '#718096', fontSize: 11 }}>{r.employee_number}</span>
                      <div style={{ fontWeight: 500 }}>{r.full_name}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{r.position_title}</td>
                    <td style={{ fontSize: 12 }}>{r.department}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.fund_code}</td>
                    <td><Badge value={r.employment_type} colorMap={EMP_TYPE_COLOR} /></td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(r.gross_pay)}</td>
                    <td style={{ textAlign: 'right', color: '#e53e3e' }}>{fmt$(r.deductions)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#38a169' }}>{fmt$(r.net_pay)}</td>
                  </tr>
                ))}
                {!safePay.length && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No payroll records found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}
    </div>
  );
}
