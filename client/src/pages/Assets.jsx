import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import useData from '../components/useData';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';

const fmt$ = n =>
  n == null ? '—' : Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtM = n =>
  n == null ? '—' : `$${(Number(n) / 1_000_000).toFixed(1)}M`;
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const TABS = ['Overview', 'Asset Registry', 'Work Orders', 'PM Compliance'];

const HEALTH_COLOR  = { GOOD: '#38a169', FAIR: '#d69e2e', POOR: '#ed8936', CRITICAL: '#e53e3e' };
const PRIORITY_COLOR = { CRITICAL: '#e53e3e', HIGH: '#ed8936', MEDIUM: '#d69e2e', LOW: '#38a169' };
const WO_TYPE_COLOR  = { EMERGENCY: '#e53e3e', CORRECTIVE: '#ed8936', PREVENTIVE: '#38a169', INSPECTION: '#3182ce' };
const PM_STATUS_COLOR= { OVERDUE: '#e53e3e', DUE_SOON: '#d69e2e', ON_SCHEDULE: '#38a169' };

const CONDITION_LABEL = { 1: 'Critical', 2: 'Poor', 3: 'Fair', 4: 'Good', 5: 'Excellent' };
const CONDITION_COLOR = { 1: '#e53e3e', 2: '#ed8936', 3: '#d69e2e', 4: '#38a169', 5: '#2f855a' };

const TYPE_COLOR = {
  VEHICLE: '#3182ce', BUILDING: '#805ad5', EQUIPMENT: '#2c7a7b',
  INFRASTRUCTURE: '#2b6cb0', IT: '#d69e2e', FLEET: '#3182ce',
};

function Badge({ value, colorMap, defaultColor = '#718096' }) {
  const color = colorMap?.[value] || defaultColor;
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
      background: color + '22', color,
    }}>{value || '—'}</span>
  );
}

function ConditionStars({ rating }) {
  const r = Number(rating || 0);
  const color = CONDITION_COLOR[r] || '#718096';
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ color, fontWeight: 800, fontSize: 15 }}>{'●'.repeat(r)}{'○'.repeat(5 - r)}</span>
      <span style={{ fontSize: 11, color, fontWeight: 700 }}>{CONDITION_LABEL[r] || '—'}</span>
    </span>
  );
}

function ProgressBar({ pct, color, thin }) {
  const p = Math.max(0, Math.min(100, Number(pct || 0)));
  const c = color || (p >= 80 ? '#e53e3e' : p >= 60 ? '#d69e2e' : '#38a169');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: thin ? 6 : 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', minWidth: 80 }}>
        <div style={{ width: `${p}%`, height: '100%', background: c, borderRadius: 4, transition: 'width .4s' }} />
      </div>
      <span style={{ fontWeight: 700, fontSize: 12, color: c, minWidth: 38 }}>{p}%</span>
    </div>
  );
}

const CHART_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 1000 ? fmt$(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

const PIE_COLORS = ['#e53e3e','#ed8936','#d69e2e','#38a169','#2f855a'];

export default function Assets() {
  const [tab, setTab] = useState('Overview');

  const { data: kpis,      loading: kL } = useData('/assets/kpis');
  const { data: assets,    loading: aL } = useData('/assets/assets');
  const { data: workOrders,loading: wL } = useData('/assets/work-orders');
  const { data: pmPlans,   loading: pL } = useData('/assets/pm-plans');
  const { data: failures,  loading: fL } = useData('/assets/failures');
  const { data: costByType,loading: cL } = useData('/assets/cost-by-type');

  const k = (kpis && typeof kpis === 'object' && !Array.isArray(kpis)) ? kpis : {};
  const safeAssets     = Array.isArray(assets)     ? assets     : [];
  const safeWOs        = Array.isArray(workOrders) ? workOrders : [];
  const safePMs        = Array.isArray(pmPlans)    ? pmPlans    : [];
  const safeFailures   = Array.isArray(failures)   ? failures   : [];
  const safeCostByType = Array.isArray(costByType) ? costByType : [];

  // Condition distribution for pie chart
  const conditionDist = [1,2,3,4,5].map(r => ({
    name: CONDITION_LABEL[r],
    value: safeAssets.filter(a => Number(a.condition_rating) === r).length,
  })).filter(d => d.value > 0);

  // PM compliance rate
  const totalPMs = safePMs.length;
  const overduePMs = safePMs.filter(p => p.PM_STATUS === 'OVERDUE').length;
  const compliancePct = totalPMs > 0 ? Math.round(((totalPMs - overduePMs) / totalPMs) * 100) : 0;

  // Cost by type chart
  const costChart = safeCostByType.map(r => ({
    name: r.asset_type,
    'Maint. Cost': Number(r.total_maint_cost || 0),
    'Emergency Cost': Number(r.emergency_cost || 0),
  }));

  return (
    <div>
      {/* KPI Row */}
      <div className="kpi-grid">
        <KpiCard label="Total Assets"          value={k.total_assets ?? '…'} />
        <KpiCard label="Replacement Value"     value={fmtM(k.total_replacement_value)} color="green" />
        <KpiCard label="Critical / Poor"       value={k.critical_poor_assets ?? '…'} color={Number(k.critical_poor_assets) > 0 ? 'red' : ''} />
        <KpiCard label="Open Work Orders"      value={k.open_work_orders ?? '…'} color={Number(k.open_work_orders) > 5 ? 'yellow' : ''} />
        <KpiCard label="Emergency WOs"         value={k.emergency_work_orders ?? '…'} color={Number(k.emergency_work_orders) > 0 ? 'red' : ''} />
        <KpiCard label="Overdue PMs"           value={k.overdue_pms ?? '…'} color={Number(k.overdue_pms) > 0 ? 'red' : ''} />
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
          {/* Alert banners */}
          {Number(k.emergency_work_orders) > 0 && (
            <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>🚨</span>
              <span style={{ color: '#c53030', fontWeight: 600 }}>
                {k.emergency_work_orders} emergency work order(s) open — immediate attention required
              </span>
            </div>
          )}
          {Number(k.overdue_pms) > 0 && (
            <div style={{ background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>⚠</span>
              <span style={{ color: '#744210', fontWeight: 600 }}>
                {k.overdue_pms} preventive maintenance task(s) overdue — PM compliance at {compliancePct}%
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Condition distribution */}
            <SectionCard title="Asset Condition Distribution">
              {aL ? <div className="loading">Loading…</div> : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={conditionDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                        {conditionDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    {[1,2,3,4,5].map(r => {
                      const count = safeAssets.filter(a => Number(a.condition_rating) === r).length;
                      if (!count) return null;
                      const color = CONDITION_COLOR[r];
                      return (
                        <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 13, color }}>{CONDITION_LABEL[r]}</span>
                          <span style={{ fontWeight: 700, color }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Maintenance cost by type */}
            <SectionCard title="Maintenance Cost by Asset Type">
              {cL ? <div className="loading">Loading…</div> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={costChart} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CHART_TOOLTIP />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Maint. Cost"    fill="#3182ce" radius={[3,3,0,0]} />
                    <Bar dataKey="Emergency Cost" fill="#e53e3e" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </SectionCard>
          </div>

          {/* Maintenance cost summary */}
          <SectionCard title="Maintenance Cost YTD Summary" style={{ marginTop: 20 }}>
            {cL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Asset Type</th><th>Assets</th><th>Work Orders</th>
                  <th>Total Maint. Cost</th><th>Emergency Cost</th><th>Avg WO Cost</th>
                </tr></thead>
                <tbody>
                  {safeCostByType.map(r => (
                    <tr key={r.asset_type}>
                      <td><Badge value={r.asset_type} colorMap={TYPE_COLOR} /></td>
                      <td style={{ textAlign: 'center' }}>{r.asset_count}</td>
                      <td style={{ textAlign: 'center' }}>{r.wo_count || 0}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(r.total_maint_cost)}</td>
                      <td style={{ textAlign: 'right', color: Number(r.emergency_cost) > 0 ? '#e53e3e' : undefined, fontWeight: Number(r.emergency_cost) > 0 ? 700 : 400 }}>
                        {fmt$(r.emergency_cost)}
                      </td>
                      <td style={{ textAlign: 'right' }}>{fmt$(r.avg_wo_cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Asset Registry ── */}
      {tab === 'Asset Registry' && (
        <SectionCard title={`Asset Registry — Health Dashboard (${safeAssets.length || '…'} assets)`}>
          {aL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Asset #</th><th>Name</th><th>Type</th><th>Department</th>
                <th>Condition</th><th>Open WOs</th><th>Overdue PMs</th>
                <th>Failures</th><th>Maint. Cost YTD</th><th>Health</th>
              </tr></thead>
              <tbody>
                {safeAssets.map(a => {
                  const health = a.HEALTH_STATUS || 'GOOD';
                  const hColor = HEALTH_COLOR[health] || '#718096';
                  return (
                    <tr key={a.asset_id} style={{
                      background: health === 'CRITICAL' ? '#fff5f5' : health === 'POOR' ? '#fff8f1' : undefined,
                    }}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{a.asset_number}</td>
                      <td style={{ fontWeight: 600 }}>
                        {a.asset_name}
                        <div style={{ fontSize: 11, color: '#718096', fontWeight: 400 }}>{a.location}</div>
                      </td>
                      <td><Badge value={a.asset_type} colorMap={TYPE_COLOR} /></td>
                      <td style={{ fontSize: 12 }}>{a.department}</td>
                      <td><ConditionStars rating={a.condition_rating} /></td>
                      <td style={{ textAlign: 'center', color: Number(a.OPEN_WO_COUNT) > 0 ? '#e53e3e' : undefined, fontWeight: Number(a.OPEN_WO_COUNT) > 0 ? 700 : 400 }}>
                        {a.OPEN_WO_COUNT || 0}
                      </td>
                      <td style={{ textAlign: 'center', color: Number(a.OVERDUE_PM_COUNT) > 0 ? '#e53e3e' : undefined, fontWeight: Number(a.OVERDUE_PM_COUNT) > 0 ? 700 : 400 }}>
                        {a.OVERDUE_PM_COUNT || 0}
                      </td>
                      <td style={{ textAlign: 'center' }}>{a.TOTAL_FAILURES || 0}</td>
                      <td style={{ textAlign: 'right' }}>{fmt$(a.MAINT_COST_YTD)}</td>
                      <td>
                        <span style={{ padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: hColor + '22', color: hColor }}>
                          {health}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!safeAssets.length && (
                  <tr><td colSpan={10} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No asset data found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* ── Work Orders ── */}
      {tab === 'Work Orders' && (
        <div>
          {/* Emergency banner */}
          {safeWOs.some(wo => wo.wo_type === 'EMERGENCY' && wo.wo_status !== 'COMPLETED') && (
            <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>🚨</span>
              <span style={{ color: '#c53030', fontWeight: 600 }}>
                {safeWOs.filter(wo => wo.wo_type === 'EMERGENCY' && wo.wo_status !== 'COMPLETED').length} emergency work order(s) open — total open value: {fmt$(safeWOs.filter(wo => wo.wo_status !== 'COMPLETED').reduce((s, wo) => s + Number(wo.total_cost || 0), 0))}
              </span>
            </div>
          )}

          <SectionCard title={`Work Orders (${safeWOs.length || '…'})`}>
            {wL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>WO #</th><th>Asset</th><th>Type</th><th>Priority</th>
                  <th>Description</th><th>Assigned To</th>
                  <th>Age</th><th>Labor</th><th>Parts</th><th>Total</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {safeWOs.map(wo => {
                    const priColor = PRIORITY_COLOR[wo.priority] || '#718096';
                    return (
                      <tr key={wo.work_order_id} style={{
                        background: wo.wo_type === 'EMERGENCY' && wo.wo_status !== 'COMPLETED' ? '#fff5f5' : undefined,
                      }}>
                        <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{wo.wo_number}</td>
                        <td style={{ fontSize: 12 }}>
                          <span style={{ fontFamily: 'monospace', color: '#718096', fontSize: 11 }}>{wo.asset_number}</span>
                          <div style={{ fontWeight: 500 }}>{wo.asset_name}</div>
                        </td>
                        <td><Badge value={wo.wo_type} colorMap={WO_TYPE_COLOR} /></td>
                        <td>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: priColor + '22', color: priColor }}>
                            {wo.priority}
                          </span>
                        </td>
                        <td style={{ maxWidth: 180, fontSize: 12 }}>{wo.description}</td>
                        <td style={{ fontSize: 12 }}>{wo.assigned_to}</td>
                        <td style={{ textAlign: 'center', color: Number(wo.AGE_DAYS) > 14 ? '#e53e3e' : undefined, fontWeight: Number(wo.AGE_DAYS) > 14 ? 700 : 400 }}>
                          {wo.AGE_DAYS}d
                        </td>
                        <td style={{ textAlign: 'right' }}>{fmt$(wo.labor_cost)}</td>
                        <td style={{ textAlign: 'right' }}>{fmt$(wo.parts_cost)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(wo.total_cost)}</td>
                        <td><StatusBadge value={wo.wo_status} /></td>
                      </tr>
                    );
                  })}
                  {!safeWOs.length && (
                    <tr><td colSpan={11} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No work orders found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── PM Compliance ── */}
      {tab === 'PM Compliance' && (
        <div>
          {/* Compliance summary cards */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'OVERDUE',     color: '#e53e3e', count: safePMs.filter(p => p.PM_STATUS==='OVERDUE').length },
              { label: 'DUE SOON',    color: '#d69e2e', count: safePMs.filter(p => p.PM_STATUS==='DUE_SOON').length },
              { label: 'ON SCHEDULE', color: '#38a169', count: safePMs.filter(p => p.PM_STATUS==='ON_SCHEDULE').length },
            ].map(s => (
              <div key={s.label} style={{ background: s.color + '15', border: `2px solid ${s.color}33`, borderRadius: 10, padding: '14px 28px', textAlign: 'center', minWidth: 130 }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.count}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#718096', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
            <div style={{ background: '#ebf8ff', border: '2px solid #bee3f8', borderRadius: 10, padding: '14px 28px', textAlign: 'center', minWidth: 130 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#2b6cb0', lineHeight: 1 }}>{compliancePct}%</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#718096', marginTop: 4 }}>PM COMPLIANCE</div>
            </div>
          </div>

          <SectionCard title={`Preventive Maintenance Plans (${safePMs.length || '…'} active)`}>
            {pL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Asset</th><th>PM Task</th><th>Frequency</th>
                  <th>Last Performed</th><th>Next Due</th><th>Days Overdue</th>
                  <th>Est. Cost</th><th>Assigned To</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {safePMs.map(pm => {
                    const color = PM_STATUS_COLOR[pm.PM_STATUS] || '#718096';
                    const overdue = Number(pm.DAYS_OVERDUE || 0);
                    return (
                      <tr key={pm.plan_id} style={{ background: pm.PM_STATUS === 'OVERDUE' ? '#fff5f5' : pm.PM_STATUS === 'DUE_SOON' ? '#fffbeb' : undefined }}>
                        <td style={{ fontSize: 12 }}>
                          <span style={{ fontFamily: 'monospace', color: '#718096', fontSize: 11 }}>{pm.asset_number}</span>
                          <div style={{ fontWeight: 500 }}>{pm.asset_name}</div>
                          <div style={{ fontSize: 11, color: '#718096' }}>{pm.location}</div>
                        </td>
                        <td style={{ maxWidth: 160, fontSize: 12, fontWeight: 500 }}>{pm.plan_name}</td>
                        <td><Badge value={pm.frequency} /></td>
                        <td>{fmtDate(pm.last_performed_date)}</td>
                        <td style={{ color: pm.PM_STATUS === 'OVERDUE' ? '#e53e3e' : undefined, fontWeight: pm.PM_STATUS !== 'ON_SCHEDULE' ? 700 : 400 }}>
                          {fmtDate(pm.next_due_date)}
                        </td>
                        <td style={{ textAlign: 'center', color: overdue > 0 ? '#e53e3e' : '#38a169', fontWeight: overdue > 0 ? 700 : 400 }}>
                          {overdue > 0 ? `+${overdue}d` : '—'}
                        </td>
                        <td style={{ textAlign: 'right' }}>{fmt$(pm.estimated_cost)}</td>
                        <td style={{ fontSize: 12 }}>{pm.assigned_to}</td>
                        <td>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: color + '22', color }}>
                            {pm.PM_STATUS?.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {!safePMs.length && (
                    <tr><td colSpan={9} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No PM plans found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </SectionCard>

          {/* Failure analysis */}
          {safeFailures.length > 0 && (
            <SectionCard title={`Failure Event Log (${safeFailures.length || '…'})`} style={{ marginTop: 20 }}>
              {fL ? <div className="loading">Loading…</div> : (
                <table className="data-table">
                  <thead><tr>
                    <th>Date</th><th>Asset</th><th>Failure Type</th>
                    <th>Downtime</th><th>Repair Cost</th><th>Recurring</th><th>PM Preventable</th>
                  </tr></thead>
                  <tbody>
                    {safeFailures.map(f => (
                      <tr key={f.failure_id} style={{ background: f.is_recurring === 'Y' ? '#fff5f5' : undefined }}>
                        <td>{fmtDate(f.failure_date)}</td>
                        <td style={{ fontSize: 12 }}>
                          <span style={{ fontFamily: 'monospace', color: '#718096', fontSize: 11 }}>{f.asset_number}</span>
                          <div style={{ fontWeight: 500 }}>{f.asset_name}</div>
                        </td>
                        <td><Badge value={f.failure_type} colorMap={{ MECHANICAL:'#e53e3e', ELECTRICAL:'#ed8936', STRUCTURAL:'#d69e2e', WEAR:'#718096', OPERATOR_ERROR:'#805ad5', UNKNOWN:'#a0aec0' }} /></td>
                        <td style={{ textAlign: 'center', color: Number(f.downtime_hours) > 8 ? '#e53e3e' : undefined, fontWeight: Number(f.downtime_hours) > 8 ? 700 : 400 }}>
                          {f.downtime_hours}h
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(f.repair_cost)}</td>
                        <td style={{ textAlign: 'center' }}>
                          {f.is_recurring === 'Y' ? <span style={{ color: '#e53e3e', fontWeight: 700 }}>YES ⚠</span> : <span style={{ color: '#38a169' }}>No</span>}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {f.prevented_by_pm === 'Y' ? <span style={{ color: '#38a169', fontWeight: 700 }}>YES</span> : <span style={{ color: '#e53e3e' }}>No</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </SectionCard>
          )}
        </div>
      )}
    </div>
  );
}
