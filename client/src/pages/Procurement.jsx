import { useState } from 'react';
import useData from '../components/useData';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';

const fmt$ = n =>
  n == null ? '—' : Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtN = n => n == null ? '—' : Number(n).toLocaleString('en-US', { maximumFractionDigits: 1 });

const TABS = ['Pipeline', 'Contracts', 'AP Aging', 'Vendor Risk'];

const PROC_METHOD_COLOR = {
  COMPETITIVE_BID: '#38a169',
  MICRO_PURCHASE:  '#38a169',
  COOPERATIVE:     '#3182ce',
  SOLE_SOURCE:     '#e53e3e',
  EMERGENCY:       '#e53e3e',
};

const AGING_COLORS = {
  CURRENT:      '#38a169',
  OVERDUE_30:   '#d69e2e',
  OVERDUE_60:   '#ed8936',
  OVERDUE_90PLUS: '#e53e3e',
};

const DEBARMENT_COLOR = {
  CLEAR:          '#38a169',
  PENDING_REVIEW: '#d69e2e',
  FLAGGED:        '#e53e3e',
};

const CERT_COLOR = {
  CURRENT:   '#38a169',
  EXPIRING:  '#d69e2e',
  EXPIRED:   '#e53e3e',
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

function ProgressBar({ pct, color }) {
  const p = Math.max(0, Math.min(100, Number(pct || 0)));
  const c = color || (p >= 90 ? '#e53e3e' : p >= 75 ? '#d69e2e' : '#38a169');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', minWidth: 80 }}>
        <div style={{ width: `${p}%`, height: '100%', background: c, borderRadius: 4, transition: 'width .4s' }} />
      </div>
      <span style={{ fontWeight: 700, fontSize: 12, color: c, minWidth: 38 }}>{p}%</span>
    </div>
  );
}

function CycleBadge({ days }) {
  const d = Number(days || 0);
  const color = d > 30 ? '#e53e3e' : d > 20 ? '#d69e2e' : '#38a169';
  return <span style={{ color, fontWeight: d > 20 ? 700 : 400 }}>{d}d</span>;
}

function AgingBucket({ label, count, amount, color }) {
  return (
    <div style={{
      background: '#fff', border: `2px solid ${color}22`, borderRadius: 10,
      padding: '16px 20px', textAlign: 'center', minWidth: 140,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#718096', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: 12, color: '#4a5568', marginTop: 4 }}>{fmt$(amount)}</div>
    </div>
  );
}

function RiskBar({ score }) {
  const s = Math.max(0, Math.min(100, Number(score || 0)));
  const color = s >= 70 ? '#e53e3e' : s >= 40 ? '#d69e2e' : '#38a169';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', minWidth: 80 }}>
        <div style={{ width: `${s}%`, height: '100%', background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontWeight: 700, fontSize: 12, color, minWidth: 28 }}>{s}</span>
    </div>
  );
}

export default function Procurement() {
  const [tab, setTab] = useState('Pipeline');

  const { data: kpis,      loading: kL  } = useData('/procurement/kpis');
  const { data: pipeline,  loading: piL } = useData('/procurement/pipeline');
  const { data: contracts, loading: cL  } = useData('/procurement/contracts');
  const { data: apAging,   loading: aL  } = useData('/procurement/ap-aging');
  const { data: vendors,   loading: vL  } = useData('/procurement/vendors');

  const k = kpis || {};

  // Aging bucket summaries
  const agingBuckets = (apAging || []).reduce((acc, inv) => {
    const b = inv.AGING_BUCKET || 'CURRENT';
    if (!acc[b]) acc[b] = { count: 0, amount: 0 };
    acc[b].count++;
    acc[b].amount += Number(inv.amount || 0);
    return acc;
  }, {});

  // Open POs count
  const openPOs = (pipeline || []).filter(p => p.po_status === 'OPEN' || p.po_status === 'PARTIAL').length;

  return (
    <div>
      {/* KPI Row */}
      <div className="kpi-grid">
        <KpiCard label="Total Contract Value" value={fmt$(k.total_contract_value)} color="green" />
        <KpiCard label="Avg Cycle Days"        value={k.avg_cycle_days ? `${Number(k.avg_cycle_days).toFixed(1)}d` : '…'} color={Number(k.avg_cycle_days) > 20 ? 'red' : ''} />
        <KpiCard label="Open POs"              value={openPOs ?? '…'} />
        <KpiCard label="AP Backlog"            value={fmt$(k.ap_backlog)} color={Number(k.ap_backlog) > 500000 ? 'red' : 'yellow'} />
        <KpiCard label="Expiring Contracts"    value={k.expiring_contracts ?? '…'} color={Number(k.expiring_contracts) > 0 ? 'yellow' : ''} />
        <KpiCard label="Flagged Vendors"       value={k.flagged_vendors ?? '…'} color={Number(k.flagged_vendors) > 0 ? 'red' : ''} />
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* ── Pipeline ── */}
      {tab === 'Pipeline' && (
        <SectionCard title={`Procurement Pipeline — Purchase Orders (${pipeline?.length ?? '…'})`}>
          {piL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>PO #</th><th>Vendor</th><th>Department</th>
                <th>Amount</th><th>PO Date</th><th>Cycle Days</th>
                <th>Invoices</th><th>Invoiced Total</th><th>Status</th>
              </tr></thead>
              <tbody>
                {(pipeline || []).map(p => (
                  <tr key={p.po_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.po_number}</td>
                    <td style={{ fontWeight: 500 }}>
                      {p.vendor_name}
                      {Number(p.risk_score) >= 70 && <span title="High Risk Vendor" style={{ marginLeft: 4, color: '#e53e3e' }}>⚠</span>}
                    </td>
                    <td>{p.department}</td>
                    <td style={{ textAlign: 'right' }}>{fmt$(p.amount)}</td>
                    <td>{fmtDate(p.po_date)}</td>
                    <td style={{ textAlign: 'center' }}><CycleBadge days={p.req_to_po_days} /></td>
                    <td style={{ textAlign: 'center' }}>{p.INVOICE_COUNT ?? 0}</td>
                    <td style={{ textAlign: 'right', color: Number(p.OVERDUE_INVOICES) > 0 ? '#e53e3e' : undefined }}>
                      {fmt$(p.INVOICED_TOTAL)}
                      {Number(p.OVERDUE_INVOICES) > 0 && <span style={{ marginLeft: 4, fontSize: 10, fontWeight: 700, color: '#e53e3e' }}>({p.OVERDUE_INVOICES} OVD)</span>}
                    </td>
                    <td><StatusBadge value={p.po_status} /></td>
                  </tr>
                ))}
                {!(pipeline || []).length && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No PO data found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* ── Contracts ── */}
      {tab === 'Contracts' && (
        <SectionCard title={`Contract Utilization & Expiry Monitor (${contracts?.length ?? '…'})`}>
          {cL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Contract #</th><th>Title</th><th>Vendor</th><th>Type</th>
                <th>Method</th><th>Utilization</th><th>Days to Expiry</th><th>Status</th>
              </tr></thead>
              <tbody>
                {(contracts || []).map(c => {
                  const daysLeft = Number(c.DAYS_TO_EXPIRY);
                  const expiryColor = daysLeft < 0 ? '#e53e3e' : daysLeft <= 60 ? '#d69e2e' : '#38a169';
                  return (
                    <tr key={c.contract_id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.contract_number}</td>
                      <td style={{ fontWeight: 500, maxWidth: 180 }}>{c.contract_title}</td>
                      <td>{c.vendor_name}</td>
                      <td><Badge value={c.contract_type} /></td>
                      <td>
                        <Badge value={c.procurement_method} colorMap={PROC_METHOD_COLOR} />
                      </td>
                      <td style={{ minWidth: 130 }}>
                        <ProgressBar pct={c.UTILIZATION_PCT} />
                      </td>
                      <td style={{ textAlign: 'right', color: expiryColor, fontWeight: daysLeft <= 60 ? 700 : 400 }}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` : `${daysLeft}d`}
                      </td>
                      <td><StatusBadge value={c.contract_status} /></td>
                    </tr>
                  );
                })}
                {!(contracts || []).length && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No contract data found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* ── AP Aging ── */}
      {tab === 'AP Aging' && (
        <div>
          {/* Aging bucket summary cards */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <AgingBucket label="CURRENT (≤30d)"   count={agingBuckets.CURRENT?.count || 0}      amount={agingBuckets.CURRENT?.amount || 0}      color={AGING_COLORS.CURRENT} />
            <AgingBucket label="30-DAY (31-60d)"  count={agingBuckets.OVERDUE_30?.count || 0}   amount={agingBuckets.OVERDUE_30?.amount || 0}   color={AGING_COLORS.OVERDUE_30} />
            <AgingBucket label="60-DAY (61-90d)"  count={agingBuckets.OVERDUE_60?.count || 0}   amount={agingBuckets.OVERDUE_60?.amount || 0}   color={AGING_COLORS.OVERDUE_60} />
            <AgingBucket label="90-DAY+ (>90d)"   count={agingBuckets.OVERDUE_90PLUS?.count || 0} amount={agingBuckets.OVERDUE_90PLUS?.amount || 0} color={AGING_COLORS.OVERDUE_90PLUS} />
          </div>

          <SectionCard title={`Open Invoices by Aging (${apAging?.length ?? '…'})`}>
            {aL ? <div className="loading">Loading…</div> : (
              <table className="data-table">
                <thead><tr>
                  <th>Invoice #</th><th>Vendor</th><th>Fund</th>
                  <th>Amount</th><th>Invoice Date</th><th>Aging Days</th>
                  <th>Bucket</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {(apAging || []).map(inv => {
                    const agingColor = AGING_COLORS[inv.AGING_BUCKET] || '#718096';
                    return (
                      <tr key={inv.invoice_id}>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                          {inv.invoice_number}
                          {inv.is_duplicate_risk === 'Y' && <span title="Duplicate Risk" style={{ marginLeft: 4 }}>⚠️</span>}
                        </td>
                        <td style={{ fontWeight: 500 }}>{inv.vendor_name}</td>
                        <td>{inv.fund_name}</td>
                        <td style={{ textAlign: 'right' }}>{fmt$(inv.amount)}</td>
                        <td>{fmtDate(inv.invoice_date)}</td>
                        <td style={{ textAlign: 'right', color: agingColor, fontWeight: 700 }}>
                          {inv.aging_days}d
                        </td>
                        <td>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: agingColor + '22', color: agingColor }}>
                            {inv.AGING_BUCKET}
                          </span>
                        </td>
                        <td><StatusBadge value={inv.invoice_status} /></td>
                      </tr>
                    );
                  })}
                  {!(apAging || []).length && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No open invoices found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Vendor Risk ── */}
      {tab === 'Vendor Risk' && (
        <SectionCard title={`Vendor Risk Registry (${vendors?.length ?? '…'})`}>
          {vL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Vendor</th><th>Type</th><th>City, State</th>
                <th>Risk Score</th><th>Debarment</th><th>Certification</th><th>Diversity</th>
              </tr></thead>
              <tbody>
                {(vendors || []).map(v => (
                  <tr key={v.vendor_id}>
                    <td style={{ fontWeight: 500 }}>{v.vendor_name}</td>
                    <td><Badge value={v.vendor_type} /></td>
                    <td style={{ fontSize: 12 }}>{v.city}{v.city && v.state ? ', ' : ''}{v.state}</td>
                    <td style={{ minWidth: 140 }}><RiskBar score={v.risk_score} /></td>
                    <td><Badge value={v.debarment_status} colorMap={DEBARMENT_COLOR} /></td>
                    <td><Badge value={v.certification_status} colorMap={CERT_COLOR} /></td>
                    <td>
                      {v.diversity_category && v.diversity_category !== 'NONE' ? (
                        <Badge value={v.diversity_category} colorMap={{ MBE: '#3182ce', WBE: '#805ad5', SDVOSB: '#2b6cb0', HUBZone: '#2c7a7b' }} defaultColor='#3182ce' />
                      ) : <span style={{ color: '#a0aec0', fontSize: 12 }}>—</span>}
                    </td>
                  </tr>
                ))}
                {!(vendors || []).length && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: '#718096', padding: 24 }}>No vendor data found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}
    </div>
  );
}
