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
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtNum = n => n == null ? '—' : Number(n).toLocaleString();

const TABS = ['Overview', 'Vehicles', 'Fuel Log', 'Inspections'];

const HEALTH_COLOR  = { CRITICAL: '#e53e3e', POOR: '#ed8936', FAIR: '#d69e2e', GOOD: '#38a169' };
const STATUS_COLOR  = { ACTIVE: '#38a169', OUT_OF_SERVICE: '#e53e3e', MAINTENANCE: '#d69e2e', RETIRED: '#718096' };
const FUEL_COLORS   = ['#3182ce','#38a169','#d69e2e','#805ad5','#e53e3e'];
const INSP_COLOR    = { PASSED: '#38a169', FAILED: '#e53e3e', SCHEDULED: '#3182ce', OVERDUE: '#e53e3e' };

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

export default function Fleet() {
  const [tab, setTab] = useState('Overview');

  const { data: kpis,        loading: kL } = useData('/fleet/kpis');
  const { data: vehicles,    loading: vL } = useData('/fleet/vehicles');
  const { data: fuel,        loading: fuL } = useData('/fleet/fuel');
  const { data: inspections, loading: iL } = useData('/fleet/inspections');
  const { data: costByDept,  loading: cL } = useData('/fleet/cost-by-dept');
  const { data: utilization, loading: uL } = useData('/fleet/utilization');

  const k           = (kpis && typeof kpis === 'object' && !Array.isArray(kpis)) ? kpis : {};
  const safeVehs    = Array.isArray(vehicles)    ? vehicles    : [];
  const safeFuel    = Array.isArray(fuel)         ? fuel         : [];
  const safeInsp    = Array.isArray(inspections)  ? inspections  : [];
  const safeCost    = Array.isArray(costByDept)   ? costByDept   : [];
  const safeUtil    = Array.isArray(utilization)  ? utilization  : [];

  // Status pie
  const statusPie = ['ACTIVE','MAINTENANCE','OUT_OF_SERVICE'].map(s => ({
    name: s.replace(/_/g,' '),
    value: safeVehs.filter(v => v.vehicle_status === s).length,
  })).filter(d => d.value > 0);

  // Dept cost chart
  const deptChart = safeCost.map(r => ({
    name: r.department,
    'Fuel Cost': Number(r.fuel_cost_ytd || 0),
  }));

  return (
    <div>
      {/* KPI Row */}
      <div className="kpi-grid">
        <KpiCard label="Total Vehicles"     value={k.total_vehicles ?? '…'} />
        <KpiCard label="Active"             value={k.active_vehicles ?? '…'} color="green" />
        <KpiCard label="Out of Service"     value={k.out_of_service ?? '…'} color={Number(k.out_of_service) > 0 ? 'red' : ''} />
        <KpiCard label="In Maintenance"     value={k.in_maintenance ?? '…'} color={Number(k.in_maintenance) > 0 ? 'yellow' : ''} />
        <KpiCard label="Fuel Cost YTD"      value={fmt$(k.fuel_cost_ytd)} color="blue" />
        <KpiCard label="Inspections Overdue" value={k.inspections_overdue ?? '…'} color={Number(k.inspections_overdue) > 0 ? 'red' : ''} />
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
          {Number(k.out_of_service) > 0 && (
            <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8, padding: '12px 16px', marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>🚨</span>
              <span style={{ color: '#c53030', fontWeight: 600 }}>
                {k.out_of_service} vehicle(s) out of service — fleet capacity reduced
              </span>
            </div>
          )}
          {Number(k.inspections_overdue) > 0 && (
            <div style={{ background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>⚠</span>
              <span style={{ color: '#744210', fontWeight: 600 }}>
                {k.inspections_overdue} inspection(s) overdue — compliance risk
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <SectionCard title="Fleet Status Distribution">
              {kL ? <div className="loading">Loading…</div> : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={statusPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                        {statusPie.map((d, i) => <Cell key={i} fill={STATUS_COLOR[d.name.replace(/ /g,'_')] || FUEL_COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    {statusPie.map(d => {
                      const color = STATUS_COLOR[d.name.replace(/ /g,'_')] || '#718096';
                      return (
                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 13, color }}>{d.name}</span>
                          <span style={{ fontWeight: 700, color }}>{d.value}</span>
                        </div>
                      );
                    })}
                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #e2e8f0', fontSize: 12, color: '#718096' }}>
                      Avg Odometer: <strong>{fmtNum(k.avg_odometer)} mi</strong>
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Fuel Cost YTD by Department">
              {cL ? <div className="loading">Loading…</div> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={deptChart} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CHART_TOOLTIP />} />
                    <Bar dataKey="Fuel Cost" fill="#3182ce" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </SectionCard>
          </div>

          {/* Cost by dept table */}
          <SectionCard title="Fleet Operating Cost by Department (YTD)" style={{ marginTop: 20 }}>
            {cL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Department</th><th>Vehicles</th><th>Fleet Value</th>
                  <th>Fuel Cost YTD</th><th>Gallons YTD</th><th>Avg Mileage</th>
                </tr></thead>
                <tbody>
                  {safeCost.map(r => (
                    <tr key={r.department}>
                      <td style={{ fontWeight: 600 }}>{r.department}</td>
                      <td style={{ textAlign: 'center' }}>{r.vehicle_count}</td>
                      <td style={{ textAlign: 'right' }}>{fmt$(r.fleet_value)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(r.fuel_cost_ytd)}</td>
                      <td style={{ textAlign: 'right' }}>{fmtNum(r.gallons_ytd)} gal</td>
                      <td style={{ textAlign: 'right' }}>{fmtNum(r.avg_mileage)} mi</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Vehicles ── */}
      {tab === 'Vehicles' && (
        <SectionCard title={`Fleet Health Dashboard (${safeVehs.length || '…'} vehicles)`}>
          {vL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Vehicle #</th><th>Make / Model</th><th>Year</th><th>Department</th>
                <th>Fuel Type</th><th>Odometer</th><th>Acq. Cost</th>
                <th>Fuel Cost YTD</th><th>Status</th><th>Health</th>
              </tr></thead>
              <tbody>
                {safeVehs.map(v => {
                  const hColor = HEALTH_COLOR[v.HEALTH_STATUS] || '#718096';
                  return (
                    <tr key={v.vehicle_id} style={{ background: v.vehicle_status === 'OUT_OF_SERVICE' ? '#fff5f5' : undefined }}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{v.vehicle_number}</td>
                      <td style={{ fontWeight: 600 }}>{v.make} {v.model}</td>
                      <td style={{ textAlign: 'center' }}>{v.year}</td>
                      <td style={{ fontSize: 12 }}>{v.department}</td>
                      <td><Badge value={v.fuel_type} colorMap={{ GASOLINE: '#3182ce', DIESEL: '#805ad5', HYBRID: '#38a169', ELECTRIC: '#2c7a7b' }} /></td>
                      <td style={{ textAlign: 'right' }}>{fmtNum(v.odometer_miles)} mi</td>
                      <td style={{ textAlign: 'right' }}>{fmt$(v.acquisition_cost)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(v.FUEL_COST_YTD)}</td>
                      <td><Badge value={v.vehicle_status} colorMap={STATUS_COLOR} /></td>
                      <td>
                        <span style={{ padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: hColor + '22', color: hColor }}>
                          {v.HEALTH_STATUS}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!safeVehs.length && (
                  <tr><td colSpan={10} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No vehicle data found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* ── Fuel Log ── */}
      {tab === 'Fuel Log' && (
        <SectionCard title={`Fuel Records — Last 90 Days (${safeFuel.length || '…'})`}>
          {fuL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Date</th><th>Vehicle</th><th>Department</th><th>Fuel Type</th>
                <th>Gallons</th><th>$/Gallon</th><th>Total Cost</th><th>Odometer</th><th>MPG</th>
              </tr></thead>
              <tbody>
                {safeFuel.map(r => (
                  <tr key={r.record_id}>
                    <td style={{ fontSize: 12 }}>{fmtDate(r.fuel_date)}</td>
                    <td style={{ fontSize: 12 }}>
                      <span style={{ fontFamily: 'monospace', color: '#718096', fontSize: 11 }}>{r.vehicle_number}</span>
                      <div style={{ fontWeight: 500 }}>{r.make} {r.model} ({r.year})</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{r.department}</td>
                    <td><Badge value={r.fuel_type} colorMap={{ GASOLINE: '#3182ce', DIESEL: '#805ad5', HYBRID: '#38a169', ELECTRIC: '#2c7a7b' }} /></td>
                    <td style={{ textAlign: 'right' }}>{Number(r.gallons || 0).toFixed(1)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt$(r.cost_per_gallon)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(r.total_cost)}</td>
                    <td style={{ textAlign: 'right' }}>{fmtNum(r.odometer_reading)} mi</td>
                    <td style={{ textAlign: 'center', color: r.mpg < 15 ? '#e53e3e' : r.mpg > 25 ? '#38a169' : undefined, fontWeight: 600 }}>
                      {r.mpg ? `${r.mpg} mpg` : '—'}
                    </td>
                  </tr>
                ))}
                {!safeFuel.length && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No fuel records in last 90 days</td></tr>
                )}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* ── Inspections ── */}
      {tab === 'Inspections' && (
        <SectionCard title={`Vehicle Inspections (${safeInsp.length || '…'})`}>
          {iL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Vehicle</th><th>Department</th><th>Type</th>
                <th>Last Inspected</th><th>Next Due</th><th>Days Overdue</th>
                <th>Mileage</th><th>Cost</th><th>Inspector</th><th>Status</th>
              </tr></thead>
              <tbody>
                {safeInsp.map(i => {
                  const overdue = Number(i.days_overdue || 0);
                  const statusColor = INSP_COLOR[i.inspection_status] || '#718096';
                  return (
                    <tr key={i.inspection_id} style={{ background: i.inspection_status === 'OVERDUE' ? '#fff5f5' : undefined }}>
                      <td style={{ fontSize: 12 }}>
                        <span style={{ fontFamily: 'monospace', color: '#718096', fontSize: 11 }}>{i.vehicle_number}</span>
                        <div style={{ fontWeight: 500 }}>{i.make} {i.model}</div>
                      </td>
                      <td style={{ fontSize: 12 }}>{i.department}</td>
                      <td><Badge value={i.inspection_type} /></td>
                      <td style={{ fontSize: 12 }}>{fmtDate(i.inspection_date)}</td>
                      <td style={{ fontSize: 12, color: i.inspection_status === 'OVERDUE' ? '#e53e3e' : undefined, fontWeight: i.inspection_status === 'OVERDUE' ? 700 : 400 }}>
                        {fmtDate(i.next_due_date)}
                      </td>
                      <td style={{ textAlign: 'center', color: overdue > 0 ? '#e53e3e' : '#38a169', fontWeight: overdue > 0 ? 700 : 400 }}>
                        {overdue > 0 ? `+${overdue}d` : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>{fmtNum(i.mileage_at_inspection)} mi</td>
                      <td style={{ textAlign: 'right' }}>{fmt$(i.inspection_cost)}</td>
                      <td style={{ fontSize: 12 }}>{i.inspector}</td>
                      <td>
                        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: statusColor + '22', color: statusColor }}>
                          {i.inspection_status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!safeInsp.length && (
                  <tr><td colSpan={10} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No inspection records found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}
    </div>
  );
}
