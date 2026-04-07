/**
 * Transparency.jsx — Phase 5: Public Transparency Portal
 * NO authentication required. Standalone layout (no AppShell).
 * Route: /transparency  (outside RequireAuth in App.jsx)
 */
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts';

/* ── API base ─────────────────────────────────────────────────────────────── */
const API = import.meta.env.PROD
  ? '/api/public'
  : 'http://localhost:4000/api/public';

/* ── Data hook (no auth token) ──────────────────────────────────────────────  */
function usePub(path) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${API}${path}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [path]);
  return { data, loading };
}

/* ── Formatters ──────────────────────────────────────────────────────────── */
const fmt$ = n =>
  n == null ? '—' : Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtM = n =>
  n == null ? '—' : `$${(Number(n) / 1_000_000).toFixed(2)}M`;
const fmtPct = n => n == null ? '—' : `${Number(n).toFixed(1)}%`;
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

/* ── Colour palette ──────────────────────────────────────────────────────── */
const GOV_BLUE    = '#1a5c9e';
const GOV_BLUE2   = '#0d3b6e';
const GOV_GREEN   = '#276749';
const GOV_AMBER   = '#744210';
const CHART_COLORS = ['#1a5c9e','#276749','#805ad5','#d69e2e','#e53e3e','#0097a7'];
const FUND_COLORS  = { GENERAL: '#1a5c9e', SPECIAL_REVENUE: '#276749', CAPITAL: '#805ad5', DEBT_SERVICE: '#e53e3e', ENTERPRISE: '#d69e2e' };
const PERF_COLOR   = { ON_TRACK: '#276749', EXCEEDS: '#1a5c9e', AT_RISK: '#d69e2e', BELOW_TARGET: '#e53e3e' };
const STATUS_COLOR = { ACTIVE: '#276749', EXPIRING: '#d69e2e', CLOSED: '#718096' };

const TABS = [
  { id: 'overview',  label: '📊 Overview',         desc: 'City financial snapshot' },
  { id: 'grants',    label: '🏛 Grant Awards',      desc: 'Federal & state funding' },
  { id: 'spending',  label: '💰 Fund Spending',     desc: 'Budget vs. actual' },
  { id: 'tax',       label: '🧾 Tax Revenue',       desc: 'Revenue collection' },
  { id: 'outcomes',  label: '📈 Program Outcomes',  desc: 'Service performance' },
  { id: 'cafr',      label: '📋 CAFR Summary',      desc: 'Financial statements' },
];

/* ── Reusable components ─────────────────────────────────────────────────── */
function HeroKPI({ label, value, sub, color = GOV_BLUE }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: `4px solid ${color}`, minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function PubCard({ title, children, style }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      overflow: 'hidden', ...style }}>
      {title && (
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0',
          fontWeight: 700, fontSize: 14, color: '#1a202c' }}>
          {title}
        </div>
      )}
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

function ProgressBar({ value, max = 100, color = GOV_BLUE, height = 8 }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  return (
    <div style={{ background: '#e2e8f0', borderRadius: 4, height, overflow: 'hidden', width: '100%' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
    </div>
  );
}

function StatusBadge({ value }) {
  const color = STATUS_COLOR[value] || '#718096';
  return (
    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
      background: color + '18', color, border: `1px solid ${color}33` }}>
      {value}
    </span>
  );
}

function Loading() {
  return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: '#718096' }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
      Loading data from HANA Cloud…
    </div>
  );
}

const ChartTip = ({ active, payload, label }) => {
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

/* ── Search input ────────────────────────────────────────────────────────── */
function SearchBox({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0',
        fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 14,
        fontFamily: 'inherit', color: '#1a202c' }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function Transparency() {
  const [tab, setTab]       = useState('overview');
  const [grantSearch, setGrantSearch] = useState('');

  const { data: kpis,      loading: kL }  = usePub('/kpis');
  const { data: grants,    loading: grL } = usePub('/grants');
  const { data: spending,  loading: spL } = usePub('/spending');
  const { data: cafr,      loading: cL }  = usePub('/cafr');
  const { data: tax,       loading: tL }  = usePub('/tax');
  const { data: taxTrend,  loading: ttL } = usePub('/tax-trend');
  const { data: outcomes,  loading: oL }  = usePub('/outcomes');
  const { data: agencies,  loading: aL }  = usePub('/grants-by-agency');
  const { data: contracts, loading: ctL } = usePub('/contracts');

  const k          = kpis && !Array.isArray(kpis) ? kpis : {};
  const safeGrants = Array.isArray(grants)    ? grants    : [];
  const safeSpend  = Array.isArray(spending)  ? spending  : [];
  const safeCafr   = Array.isArray(cafr)      ? cafr      : [];
  const safeTax    = Array.isArray(tax)        ? tax        : [];
  const safeTrend  = Array.isArray(taxTrend)  ? taxTrend  : [];
  const safeOut    = Array.isArray(outcomes)  ? outcomes  : [];
  const safeAgency = Array.isArray(agencies)  ? agencies  : [];
  const safeCont   = Array.isArray(contracts) ? contracts : [];

  const filteredGrants = safeGrants.filter(g =>
    !grantSearch ||
    g.grant_title?.toLowerCase().includes(grantSearch.toLowerCase()) ||
    g.grantor_agency?.toLowerCase().includes(grantSearch.toLowerCase()) ||
    g.grant_number?.toLowerCase().includes(grantSearch.toLowerCase())
  );

  const agencyChart = safeAgency.slice(0, 6).map(r => ({
    name: r.grantor_agency?.split(' ').slice(-2).join(' '),
    'Total Awards': Number(r.total_awards || 0),
  }));

  const taxTrendChart = safeTrend.map(r => ({
    period: r.period_label,
    Collected: Number(r.total_collected || 0),
    Budgeted:  Number(r.total_budgeted  || 0),
  }));

  const fundPie = safeSpend.map(r => ({
    name: r.fund_name,
    value: Number(r.expenditures_ytd || 0),
  }));

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── Government banner bar ── */}
      <div style={{ background: GOV_BLUE2, color: '#fff', padding: '6px 0', fontSize: 11,
        textAlign: 'center', letterSpacing: 0.5 }}>
        🏛&nbsp; Official City Government Open Data Portal &nbsp;·&nbsp; sierradigitalinc.gov
      </div>

      {/* ── Header ── */}
      <header style={{ background: GOV_BLUE, color: '#fff', padding: '28px 40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, opacity: 0.75, marginBottom: 4 }}>
                SIERRA DIGITAL INC — PUBLIC SECTOR
              </div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>
                Open Government Data Portal
              </h1>
              <p style={{ margin: '6px 0 0', opacity: 0.8, fontSize: 14 }}>
                Transparent, accountable, and accessible financial information for all citizens
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 6,
                fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
                🟢 LIVE DATA · HANA CLOUD
              </span>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 6,
                fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
                🔓 PUBLIC ACCESS
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero KPI strip ── */}
      <div style={{ background: '#f0f4f8', borderBottom: '1px solid #e2e8f0', padding: '20px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <HeroKPI label="Active Grant Awards"    value={kL ? '…' : (k.active_grants ?? 0)}    color={GOV_BLUE} sub="Federal & state grants" />
          <HeroKPI label="Total Grant Funding"    value={kL ? '…' : fmtM(k.total_grant_funding)} color={GOV_BLUE} sub="Active award value" />
          <HeroKPI label="City Spending YTD"      value={kL ? '…' : fmtM(k.total_spending_ytd)}  color={GOV_BLUE2} sub="Current fiscal year" />
          <HeroKPI label="Tax Revenue YTD"        value={kL ? '…' : fmtM(k.tax_revenue_ytd)}     color={GOV_GREEN} sub="All tax types" />
          <HeroKPI label="Cash Reserves"          value={kL ? '…' : fmtM(k.cash_reserves)}       color={GOV_GREEN} sub="All accounts" />
          <HeroKPI label="Funding Agencies"       value={kL ? '…' : (k.funding_agencies ?? 0)}   color={GOV_AMBER} sub="Unique grantors" />
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 40px 60px' }}>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap',
          background: '#fff', borderRadius: 10, padding: 6, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: '1 1 auto', padding: '10px 14px', border: 'none', borderRadius: 7,
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                background: tab === t.id ? GOV_BLUE : 'transparent',
                color: tab === t.id ? '#fff' : '#4a5568',
                fontWeight: tab === t.id ? 700 : 500, fontSize: 13 }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            OVERVIEW TAB
        ════════════════════════════════════════════════════════════════════ */}
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              {/* Spending by fund pie */}
              <PubCard title="City Spending by Fund (Current FY)">
                {spL ? <Loading /> : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie data={fundPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                          {fundPie.map((d, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={v => fmt$(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ flex: 1 }}>
                      {safeSpend.slice(0, 6).map((r, i) => (
                        <div key={r.fund_name} style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: CHART_COLORS[i % CHART_COLORS.length] }}>
                              {r.fund_name}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700 }}>{fmt$(r.expenditures_ytd)}</span>
                          </div>
                          <ProgressBar value={Number(r.expenditures_ytd)} max={Number(r.beginning_balance)} color={CHART_COLORS[i % CHART_COLORS.length]} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </PubCard>

              {/* Grants by agency bar */}
              <PubCard title="Grant Funding by Agency">
                {aL ? <Loading /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={agencyChart} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                      <XAxis type="number" tickFormatter={v => `$${(v/1_000_000).toFixed(1)}M`} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                      <Tooltip formatter={v => [fmt$(v), 'Awards']} />
                      <Bar dataKey="Total Awards" fill={GOV_BLUE} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </PubCard>
            </div>

            {/* Tax trend mini */}
            <PubCard title="Tax Revenue Trend — Current Year">
              {ttL ? <Loading /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={taxTrendChart} margin={{ top: 8, right: 16, left: 16, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                    <Tooltip content={<ChartTip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="Collected" stroke={GOV_GREEN} strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Budgeted"  stroke="#90cdf4" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </PubCard>

            {/* Notice */}
            <div style={{ marginTop: 20, padding: '14px 18px', background: '#ebf8ff',
              border: '1px solid #90cdf4', borderRadius: 8, fontSize: 13, color: '#2b6cb0' }}>
              <strong>📌 Data Transparency Notice:</strong> All financial data is sourced directly from the City's
              SAP HANA Cloud database in real time. Figures represent the current fiscal year unless otherwise noted.
              For questions or FOIA requests, contact <strong>opendata@sierradigitalinc.gov</strong>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            GRANT AWARDS TAB
        ════════════════════════════════════════════════════════════════════ */}
        {tab === 'grants' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
              <div style={{ background: '#ebf8ff', border: '1px solid #90cdf4', borderRadius: 8, padding: '14px 18px' }}>
                <div style={{ fontSize: 11, color: '#718096', marginBottom: 4 }}>Active Grants</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: GOV_BLUE }}>
                  {safeGrants.filter(g => g.award_status === 'ACTIVE').length}
                </div>
              </div>
              <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: 8, padding: '14px 18px' }}>
                <div style={{ fontSize: 11, color: '#718096', marginBottom: 4 }}>Total Award Value</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: GOV_GREEN }}>
                  {fmtM(safeGrants.reduce((s, g) => s + Number(g.award_amount || 0), 0))}
                </div>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: 8, padding: '14px 18px' }}>
                <div style={{ fontSize: 11, color: '#718096', marginBottom: 4 }}>Funding Agencies</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: GOV_AMBER }}>
                  {new Set(safeGrants.map(g => g.grantor_agency)).size}
                </div>
              </div>
            </div>

            <PubCard title={`Federal & State Grant Awards (${filteredGrants.length})`}>
              <SearchBox
                value={grantSearch}
                onChange={setGrantSearch}
                placeholder="Search by grant title, agency, or number…"
              />
              {grL ? <Loading /> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f7f8fa' }}>
                        {['Grant Number','Title','Grantor Agency','CFDA #','Award Amount','Period','Status'].map(h => (
                          <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700,
                            fontSize: 11, color: '#718096', borderBottom: '2px solid #e2e8f0',
                            textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGrants.map((g, i) => (
                        <tr key={g.grant_number}
                          style={{ background: i % 2 === 0 ? '#fff' : '#fafafa',
                            borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, color: '#718096' }}>
                            {g.grant_number}
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 600, maxWidth: 260 }}>
                            {g.grant_title}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: 12 }}>{g.grantor_agency}</td>
                          <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12 }}>{g.cfda_number || '—'}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: GOV_BLUE }}>
                            {fmt$(g.award_amount)}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: 12, whiteSpace: 'nowrap' }}>
                            {fmtDate(g.award_start_date)} – {fmtDate(g.award_end_date)}
                          </td>
                          <td style={{ padding: '10px 12px' }}><StatusBadge value={g.award_status} /></td>
                        </tr>
                      ))}
                      {!filteredGrants.length && (
                        <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#718096' }}>
                          No grants match your search
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </PubCard>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            FUND SPENDING TAB
        ════════════════════════════════════════════════════════════════════ */}
        {tab === 'spending' && (
          <div>
            <PubCard title="Budget vs. Actual Spending by Fund" style={{ marginBottom: 20 }}>
              {spL ? <Loading /> : (
                safeSpend.map((r, i) => {
                  const color = FUND_COLORS[r.fund_type] || CHART_COLORS[i % CHART_COLORS.length];
                  const pct   = Number(r.utilization_pct || 0);
                  const barColor = pct > 100 ? '#e53e3e' : pct >= 85 ? GOV_AMBER : color;
                  return (
                    <div key={r.fund_name} style={{ marginBottom: 20, paddingBottom: 20,
                      borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a202c' }}>{r.fund_name}</div>
                          <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>
                            <span style={{ background: color + '18', color, padding: '1px 8px', borderRadius: 4,
                              fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>
                              {r.fund_type?.replace(/_/g, ' ')}
                            </span>
                            &nbsp;· FY {r.fiscal_year}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: barColor }}>{fmt$(r.expenditures_ytd)}</div>
                          <div style={{ fontSize: 11, color: '#718096' }}>of {fmt$(r.beginning_balance)} budget</div>
                        </div>
                      </div>
                      <ProgressBar value={Number(r.expenditures_ytd)} max={Number(r.beginning_balance)} color={barColor} height={10} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: '#718096' }}>
                        <span>Revenue YTD: <strong style={{ color: GOV_GREEN }}>{fmt$(r.revenues_ytd)}</strong></span>
                        <span>Utilization: <strong style={{ color: barColor }}>{fmtPct(pct)}</strong></span>
                        <span>Ending Balance: <strong>{fmt$(r.ending_balance)}</strong></span>
                      </div>
                    </div>
                  );
                })
              )}
            </PubCard>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAX REVENUE TAB
        ════════════════════════════════════════════════════════════════════ */}
        {tab === 'tax' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <PubCard title="Tax Revenue vs. Budget — Year to Date">
                {tL ? <Loading /> : (
                  safeTax.map(r => {
                    const pct = Number(r.pct_of_budget || 0);
                    const barColor = pct >= 100 ? GOV_GREEN : pct >= 85 ? GOV_AMBER : '#e53e3e';
                    return (
                      <div key={r.tax_type} style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{r.tax_type?.replace(/_/g, ' ')}</span>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                            background: barColor + '18', color: barColor }}>
                            {fmtPct(pct)} collected
                          </span>
                        </div>
                        <ProgressBar value={Number(r.total_collected)} max={Number(r.total_budgeted)} color={barColor} height={10} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 12, color: '#718096' }}>
                          <span>Collected: <strong style={{ color: GOV_GREEN }}>{fmt$(r.total_collected)}</strong></span>
                          <span>Budget: {fmt$(r.total_budgeted)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </PubCard>

              <PubCard title="Monthly Collection Trend">
                {ttL ? <Loading /> : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={taxTrendChart} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                      <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                      <Tooltip content={<ChartTip />} />
                      <Bar dataKey="Collected" fill={GOV_GREEN} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Budgeted"  fill="#90cdf4"  radius={[3, 3, 0, 0]} opacity={0.6} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </PubCard>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            PROGRAM OUTCOMES TAB
        ════════════════════════════════════════════════════════════════════ */}
        {tab === 'outcomes' && (
          <PubCard title="City Program Performance Metrics">
            {oL ? <Loading /> : (
              safeOut.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#718096', padding: '40px 0' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
                  Program outcome data will appear here once loaded from source systems.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f7f8fa' }}>
                      {['Metric','Measurement','Period','Fiscal Year','Actual Value','Status'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700,
                          fontSize: 11, color: '#718096', borderBottom: '2px solid #e2e8f0',
                          textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safeOut.map((r, i) => {
                      const color = PERF_COLOR[r.performance_status] || '#718096';
                      return (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa',
                          borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.metric_name}</td>
                          <td style={{ padding: '10px 12px', fontSize: 12, color: '#718096' }}>{r.measurement_frequency}</td>
                          <td style={{ padding: '10px 12px' }}>{r.period}</td>
                          <td style={{ padding: '10px 12px' }}>{r.fiscal_year}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>
                            {Number(r.actual_value).toFixed(1)} <span style={{ fontSize: 11, color: '#718096' }}>{r.unit_of_measure}</span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ padding: '3px 10px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                              background: color + '18', color }}>
                              {r.performance_status?.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            )}
          </PubCard>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            CAFR SUMMARY TAB
        ════════════════════════════════════════════════════════════════════ */}
        {tab === 'cafr' && (
          <div>
            <div style={{ background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: 8,
              padding: '12px 18px', marginBottom: 20, fontSize: 13, color: GOV_AMBER }}>
              <strong>📋 Comprehensive Annual Financial Report (CAFR):</strong> The following data summarizes
              the City's financial position in accordance with GASB standards. Full CAFR documents are
              available upon request from the Finance Department.
            </div>

            <PubCard title="Government-Wide Financial Summary by Fund Type">
              {cL ? <Loading /> : (
                <div>
                  {/* CAFR table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f7f8fa' }}>
                        {['Fund Type','# Funds','Total Appropriation','Revenue YTD','Expenditures YTD','Fund Balance','Utilization'].map(h => (
                          <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Fund Type' || h === '# Funds' ? 'left' : 'right',
                            fontWeight: 700, fontSize: 11, color: '#718096', borderBottom: '2px solid #e2e8f0',
                            textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {safeCafr.map((r, i) => {
                        const color = FUND_COLORS[r.fund_type] || CHART_COLORS[i % CHART_COLORS.length];
                        const pct   = Number(r.spend_pct || 0);
                        return (
                          <tr key={r.fund_type} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa',
                            borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '12px 12px', fontWeight: 700 }}>
                              <span style={{ display: 'inline-block', width: 10, height: 10,
                                borderRadius: 2, background: color, marginRight: 8, verticalAlign: 'middle' }} />
                              {r.fund_type?.replace(/_/g, ' ')}
                            </td>
                            <td style={{ padding: '12px 12px', textAlign: 'left' }}>{r.fund_count}</td>
                            <td style={{ padding: '12px 12px', textAlign: 'right' }}>{fmt$(r.total_appropriation)}</td>
                            <td style={{ padding: '12px 12px', textAlign: 'right', color: GOV_GREEN, fontWeight: 600 }}>{fmt$(r.total_revenues)}</td>
                            <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 700 }}>{fmt$(r.total_expenditures)}</td>
                            <td style={{ padding: '12px 12px', textAlign: 'right', color: Number(r.fund_balance) >= 0 ? GOV_GREEN : '#e53e3e', fontWeight: 700 }}>
                              {fmt$(r.fund_balance)}
                            </td>
                            <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                              <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                                background: (pct > 100 ? '#e53e3e' : pct >= 85 ? '#d69e2e' : GOV_GREEN) + '18',
                                color: pct > 100 ? '#e53e3e' : pct >= 85 ? '#d69e2e' : GOV_GREEN }}>
                                {fmtPct(pct)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {/* Totals row */}
                      {safeCafr.length > 0 && (
                        <tr style={{ background: '#f0f4f8', fontWeight: 800, borderTop: '2px solid #e2e8f0' }}>
                          <td style={{ padding: '12px 12px' }}>TOTAL</td>
                          <td style={{ padding: '12px 12px' }}>{safeCafr.reduce((s, r) => s + Number(r.fund_count), 0)}</td>
                          <td style={{ padding: '12px 12px', textAlign: 'right' }}>{fmt$(safeCafr.reduce((s, r) => s + Number(r.total_appropriation || 0), 0))}</td>
                          <td style={{ padding: '12px 12px', textAlign: 'right', color: GOV_GREEN }}>{fmt$(safeCafr.reduce((s, r) => s + Number(r.total_revenues || 0), 0))}</td>
                          <td style={{ padding: '12px 12px', textAlign: 'right' }}>{fmt$(safeCafr.reduce((s, r) => s + Number(r.total_expenditures || 0), 0))}</td>
                          <td style={{ padding: '12px 12px', textAlign: 'right', color: GOV_GREEN }}>{fmt$(safeCafr.reduce((s, r) => s + Number(r.fund_balance || 0), 0))}</td>
                          <td />
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </PubCard>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: GOV_BLUE2, color: 'rgba(255,255,255,0.75)', padding: '24px 40px',
        fontSize: 12, textAlign: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 8, fontWeight: 600, color: '#fff' }}>
            Sierra Digital Inc — Open Government Data Portal
          </div>
          <div>
            Data refreshed in real time from SAP HANA Cloud (Datasphere) &nbsp;·&nbsp;
            Schema: PUBLIC_SECTOR &nbsp;·&nbsp; All amounts in USD &nbsp;·&nbsp;
            Current Fiscal Year data unless otherwise noted
          </div>
          <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.5)' }}>
            For inquiries: opendata@sierradigitalinc.gov &nbsp;·&nbsp;
            Powered by Sierra SLED Intelligence Platform
          </div>
        </div>
      </footer>
    </div>
  );
}
