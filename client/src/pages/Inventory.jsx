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

const TABS = ['Overview', 'Inventory', 'Transactions', 'Warehouses'];

const STOCK_COLOR = {
  OUT_OF_STOCK: '#e53e3e',
  LOW_STOCK:    '#d69e2e',
  ADEQUATE:     '#38a169',
  OVERSTOCKED:  '#3182ce',
};

const TX_COLOR = {
  RECEIPT:    '#38a169',
  ISSUE:      '#e53e3e',
  ADJUSTMENT: '#d69e2e',
  TRANSFER:   '#3182ce',
  RETURN:     '#805ad5',
};

const CAT_COLORS = ['#3182ce','#805ad5','#2c7a7b','#d69e2e','#e53e3e','#38a169','#ed8936','#2b6cb0'];

function Badge({ value, colorMap, defaultColor = '#718096' }) {
  const color = (colorMap && colorMap[value]) || defaultColor;
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
      background: color + '22', color,
    }}>{value?.replace(/_/g, ' ') || '—'}</span>
  );
}

function StockBar({ current, reorder, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  const reorderPct = max > 0 ? Math.min(100, Math.round((reorder / max) * 100)) : 0;
  const color = current === 0 ? '#e53e3e' : current <= reorder ? '#d69e2e' : '#38a169';
  return (
    <div style={{ position: 'relative', height: 8, background: '#e2e8f0', borderRadius: 4, minWidth: 80 }}>
      {/* reorder point marker */}
      <div style={{ position: 'absolute', left: `${reorderPct}%`, top: -2, width: 2, height: 12, background: '#718096', borderRadius: 1, zIndex: 2 }} />
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4 }} />
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
          {p.name}: {typeof p.value === 'number' && p.value > 999 ? fmt$(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

export default function Inventory() {
  const [tab, setTab] = useState('Overview');

  const { data: kpis,         loading: kL } = useData('/inventory/kpis');
  const { data: items,        loading: iL } = useData('/inventory/items');
  const { data: transactions, loading: tL } = useData('/inventory/transactions');
  const { data: warehouses,   loading: wL } = useData('/inventory/warehouses');
  const { data: alerts,       loading: aL } = useData('/inventory/alerts');
  const { data: turnover,     loading: rL } = useData('/inventory/turnover');

  const k             = (kpis && typeof kpis === 'object' && !Array.isArray(kpis)) ? kpis : {};
  const safeItems     = Array.isArray(items)        ? items        : [];
  const safeTxns      = Array.isArray(transactions) ? transactions : [];
  const safeWHs       = Array.isArray(warehouses)   ? warehouses   : [];
  const safeAlerts    = Array.isArray(alerts)        ? alerts       : [];
  const safeTurnover  = Array.isArray(turnover)      ? turnover     : [];

  // Stock status distribution for pie
  const stockDist = ['OUT_OF_STOCK','LOW_STOCK','ADEQUATE','OVERSTOCKED'].map(s => ({
    name: s.replace(/_/g, ' '),
    value: safeItems.filter(i => i.STOCK_STATUS === s).length,
  })).filter(d => d.value > 0);

  // Turnover chart
  const turnoverChart = safeTurnover.map(r => ({
    name: r.category?.replace(/_/g, ' '),
    'Stock Value': Number(r.stock_value || 0),
    'Issues YTD':  Number(r.issue_value_ytd || 0),
  }));

  return (
    <div>
      {/* KPI Row */}
      <div className="kpi-grid">
        <KpiCard label="Total Items"        value={k.total_items ?? '…'} />
        <KpiCard label="Inventory Value"    value={fmt$(k.total_inventory_value)} color="green" />
        <KpiCard label="Out of Stock"       value={k.out_of_stock ?? '…'} color={Number(k.out_of_stock) > 0 ? 'red' : ''} />
        <KpiCard label="Low Stock"          value={k.low_stock ?? '…'} color={Number(k.low_stock) > 0 ? 'yellow' : ''} />
        <KpiCard label="Receipts (30d)"     value={k.receipts_last_30d ?? '…'} />
        <KpiCard label="Issues Value YTD"   value={fmt$(k.issues_value_ytd)} color="blue" />
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
          {Number(k.out_of_stock) > 0 && (
            <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8, padding: '12px 16px', marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>🚨</span>
              <span style={{ color: '#c53030', fontWeight: 600 }}>
                {k.out_of_stock} item(s) are completely out of stock — immediate procurement required
              </span>
            </div>
          )}
          {Number(k.low_stock) > 0 && (
            <div style={{ background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>⚠</span>
              <span style={{ color: '#744210', fontWeight: 600 }}>
                {k.low_stock} item(s) below reorder point — review procurement schedule
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Stock status pie */}
            <SectionCard title="Stock Status Distribution">
              {iL ? <div className="loading">Loading…</div> : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={stockDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                        {stockDist.map((d, i) => (
                          <Cell key={i} fill={STOCK_COLOR[d.name.replace(/ /g,'_')] || CAT_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    {['OUT_OF_STOCK','LOW_STOCK','ADEQUATE','OVERSTOCKED'].map(s => {
                      const count = safeItems.filter(i => i.STOCK_STATUS === s).length;
                      if (!count) return null;
                      const color = STOCK_COLOR[s];
                      return (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 13, color }}>{s.replace(/_/g,' ')}</span>
                          <span style={{ fontWeight: 700, color }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Turnover chart */}
            <SectionCard title="Stock Value vs Issues YTD by Category">
              {rL ? <div className="loading">Loading…</div> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={turnoverChart} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CHART_TOOLTIP />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Stock Value" fill="#3182ce" radius={[3,3,0,0]} />
                    <Bar dataKey="Issues YTD"  fill="#e53e3e" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </SectionCard>
          </div>

          {/* Reorder alerts summary */}
          {safeAlerts.length > 0 && (
            <SectionCard title={`Reorder Alerts (${safeAlerts.length})`} style={{ marginTop: 20 }}>
              {aL ? <div className="loading">Loading…</div> : (
                <table className="data-table">
                  <thead><tr>
                    <th>Item #</th><th>Name</th><th>Category</th><th>Warehouse</th>
                    <th>Current Stock</th><th>Reorder Point</th><th>Reorder Qty</th>
                    <th>Lead Time</th><th>Reorder Cost</th><th>Alert</th>
                  </tr></thead>
                  <tbody>
                    {safeAlerts.map(a => (
                      <tr key={a.item_id} style={{ background: a.ALERT_TYPE === 'OUT_OF_STOCK' ? '#fff5f5' : '#fffbeb' }}>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{a.item_number}</td>
                        <td style={{ fontWeight: 600 }}>{a.item_name}</td>
                        <td><Badge value={a.category} /></td>
                        <td style={{ fontSize: 12 }}>{a.warehouse_name}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: a.current_stock === 0 ? '#e53e3e' : '#d69e2e' }}>
                          {a.current_stock} {a.unit}
                        </td>
                        <td style={{ textAlign: 'center', color: '#718096' }}>{a.reorder_point}</td>
                        <td style={{ textAlign: 'center' }}>{a.reorder_qty}</td>
                        <td style={{ textAlign: 'center' }}>{a.lead_time_days}d</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(a.reorder_cost)}</td>
                        <td><Badge value={a.ALERT_TYPE} colorMap={STOCK_COLOR} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </SectionCard>
          )}

          {/* Turnover table */}
          <SectionCard title="Category Turnover Analysis" style={{ marginTop: 20 }}>
            {rL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Category</th><th>Items</th><th>Stock Value</th>
                  <th>Units Issued YTD</th><th>Issue Value YTD</th><th>Turnover Ratio</th>
                </tr></thead>
                <tbody>
                  {safeTurnover.map((r, i) => {
                    const ratio = Number(r.turnover_ratio || 0);
                    const ratioColor = ratio > 4 ? '#38a169' : ratio > 2 ? '#d69e2e' : '#e53e3e';
                    return (
                      <tr key={r.category}>
                        <td><Badge value={r.category} colorMap={Object.fromEntries(CAT_COLORS.map((c,j) => [safeTurnover[j]?.category, c]))} defaultColor={CAT_COLORS[i % CAT_COLORS.length]} /></td>
                        <td style={{ textAlign: 'center' }}>{r.item_count}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(r.stock_value)}</td>
                        <td style={{ textAlign: 'center' }}>{Number(r.units_issued_ytd || 0).toLocaleString()}</td>
                        <td style={{ textAlign: 'right' }}>{fmt$(r.issue_value_ytd)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: ratioColor }}>
                          {ratio > 0 ? ratio.toFixed(2) + 'x' : '—'}
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

      {/* ── Inventory ── */}
      {tab === 'Inventory' && (
        <SectionCard title={`Inventory Health Dashboard (${safeItems.length || '…'} active items)`}>
          {iL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Item #</th><th>Name</th><th>Category</th><th>Warehouse</th>
                <th>Unit Cost</th><th>Current Stock</th><th>Stock Level</th>
                <th>Stock Value</th><th>Supplier</th><th>Status</th>
              </tr></thead>
              <tbody>
                {safeItems.map(item => {
                  const maxStock = Number(item.reorder_point || 0) * 3;
                  return (
                    <tr key={item.item_id} style={{
                      background: item.STOCK_STATUS === 'OUT_OF_STOCK' ? '#fff5f5'
                               : item.STOCK_STATUS === 'LOW_STOCK'    ? '#fffbeb' : undefined,
                    }}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{item.item_number}</td>
                      <td style={{ fontWeight: 600 }}>
                        {item.item_name}
                        <div style={{ fontSize: 11, color: '#718096', fontWeight: 400 }}>{item.unit}</div>
                      </td>
                      <td><Badge value={item.category} /></td>
                      <td style={{ fontSize: 12 }}>{item.warehouse_name}</td>
                      <td style={{ textAlign: 'right' }}>{fmt$(item.unit_cost)}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: STOCK_COLOR[item.STOCK_STATUS] || '#718096' }}>
                        {item.current_stock}
                      </td>
                      <td style={{ minWidth: 120 }}>
                        <StockBar current={Number(item.current_stock)} reorder={Number(item.reorder_point)} max={maxStock || Number(item.reorder_point) * 3} />
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(Number(item.current_stock) * Number(item.unit_cost))}</td>
                      <td style={{ fontSize: 12 }}>{item.supplier}</td>
                      <td><Badge value={item.STOCK_STATUS} colorMap={STOCK_COLOR} /></td>
                    </tr>
                  );
                })}
                {!safeItems.length && (
                  <tr><td colSpan={10} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No inventory data found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* ── Transactions ── */}
      {tab === 'Transactions' && (
        <SectionCard title={`Stock Transactions — Last 90 Days (${safeTxns.length || '…'})`}>
          {tL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Date</th><th>Type</th><th>Item</th><th>Category</th>
                <th>Warehouse</th><th>Qty</th><th>Unit Cost</th>
                <th>Line Value</th><th>Reference</th><th>Performed By</th>
              </tr></thead>
              <tbody>
                {safeTxns.map(t => {
                  const isOut = ['ISSUE'].includes(t.transaction_type);
                  return (
                    <tr key={t.transaction_id}>
                      <td style={{ fontSize: 12 }}>{fmtDate(t.transaction_date)}</td>
                      <td><Badge value={t.transaction_type} colorMap={TX_COLOR} /></td>
                      <td style={{ fontSize: 12 }}>
                        <span style={{ fontFamily: 'monospace', color: '#718096', fontSize: 11 }}>{t.item_number}</span>
                        <div style={{ fontWeight: 500 }}>{t.item_name}</div>
                      </td>
                      <td><Badge value={t.category} /></td>
                      <td style={{ fontSize: 12 }}>{t.warehouse_name}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: isOut ? '#e53e3e' : '#38a169' }}>
                        {isOut ? '-' : '+'}{Math.abs(t.quantity)}
                      </td>
                      <td style={{ textAlign: 'right' }}>{fmt$(t.unit_cost)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt$(t.line_value)}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#718096' }}>{t.reference_number}</td>
                      <td style={{ fontSize: 12 }}>{t.performed_by}</td>
                    </tr>
                  );
                })}
                {!safeTxns.length && (
                  <tr><td colSpan={10} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No transactions in last 90 days</td></tr>
                )}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* ── Warehouses ── */}
      {tab === 'Warehouses' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
            {safeWHs.map(w => {
              const alertCount = Number(w.out_of_stock_items || 0) + Number(w.low_stock_items || 0);
              return (
                <div key={w.warehouse_id} style={{
                  background: '#fff', border: `2px solid ${alertCount > 0 ? '#feb2b2' : '#e2e8f0'}`,
                  borderRadius: 12, padding: 20,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{w.warehouse_name}</div>
                      <div style={{ fontSize: 12, color: '#718096', fontFamily: 'monospace' }}>{w.warehouse_code}</div>
                      <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>{w.location}</div>
                    </div>
                    <Badge value={w.warehouse_status} colorMap={{ ACTIVE: '#38a169', INACTIVE: '#e53e3e' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'Items',        val: w.item_count },
                      { label: 'Total Units',  val: Number(w.total_units || 0).toLocaleString() },
                      { label: 'Value',        val: fmt$(w.inventory_value) },
                      { label: 'Capacity',     val: w.capacity_sqft ? `${Number(w.capacity_sqft).toLocaleString()} sqft` : '—' },
                    ].map(({ label, val }) => (
                      <div key={label} style={{ background: '#f7fafc', borderRadius: 6, padding: '6px 10px' }}>
                        <div style={{ fontSize: 11, color: '#718096' }}>{label}</div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  {alertCount > 0 && (
                    <div style={{ marginTop: 10, fontSize: 12, color: '#c53030', fontWeight: 600 }}>
                      ⚠ {w.out_of_stock_items > 0 ? `${w.out_of_stock_items} out of stock` : ''}
                      {w.out_of_stock_items > 0 && w.low_stock_items > 0 ? ', ' : ''}
                      {w.low_stock_items > 0 ? `${w.low_stock_items} low stock` : ''}
                    </div>
                  )}
                  <div style={{ marginTop: 8, fontSize: 12, color: '#718096' }}>Manager: {w.manager}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
