import { useState } from 'react';
import useData from '../components/useData';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';

const fmt$ = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

const TABS = ['Subaward Register', 'Subrecipients', 'Monitoring', 'Corrective Actions'];

export default function Subawards() {
  const [tab, setTab] = useState('Subaward Register');
  const { data: all,      loading: aL } = useData('/subawards');
  const { data: kpis,     loading: kL } = useData('/subawards/kpis');
  const { data: subr,     loading: sL } = useData('/subawards/subrecipients');
  const { data: monitor,  loading: mL } = useData('/subawards/monitoring');
  const { data: correct,  loading: cL } = useData('/subawards/corrective');

  const k = kpis || {};

  return (
    <div>
      <div className="kpi-grid">
        <KpiCard label="Total Subawards"  value={k.total_subawards      ?? '…'} />
        <KpiCard label="Total Obligated"  value={fmt$(k.total_subaward_amount)} color="green" />
        <KpiCard label="FFATA Reportable" value={k.ffata_reportable    ?? '…'} color="yellow" />
        <KpiCard label="Active Subawards" value={k.active_subawards    ?? '…'} color="green" />
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Subaward Register' && (
        <SectionCard title={`Subaward Register (${all?.length ?? '…'}) — FFATA Transparency`}>
          {aL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Subaward #</th><th>Subrecipient</th><th>City/State</th>
                <th>Amount</th><th>Status</th><th>FFATA</th><th>SAM.gov</th>
              </tr></thead>
              <tbody>
                {(all || []).map(s => (
                  <tr key={s.subaward_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.subaward_number}</td>
                    <td style={{ fontWeight: 500 }}>{s.subrecipient_name}</td>
                    <td>{[s.place_of_performance_city, s.place_of_performance_state].filter(Boolean).join(', ')}</td>
                    <td style={{ textAlign: 'right' }}>{fmt$(s.subaward_amount)}</td>
                    <td><StatusBadge value={s.subaward_status} /></td>
                    <td><StatusBadge value={s.FFATA_REPORTABLE ?? s.ffata_reportable} /></td>
                    <td><StatusBadge value={s.sam_gov_report_date ? 'Y' : 'N'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {tab === 'Subrecipients' && (
        <SectionCard title="Subrecipient Registry">
          {sL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Name</th><th>Type</th><th>State</th><th>UEI</th>
                <th>Risk Score</th><th>SAM Active</th><th>Status</th>
              </tr></thead>
              <tbody>
                {(subr || []).map(s => (
                  <tr key={s.subrecipient_id}>
                    <td style={{ fontWeight: 500 }}>{s.subrecipient_name}</td>
                    <td>{s.entity_type}</td>
                    <td>{s.state_of_incorporation}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.uei_number}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{s.risk_score}</td>
                    <td><StatusBadge value={s.sam_registration_active} /></td>
                    <td><StatusBadge value={s.subrecipient_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {tab === 'Monitoring' && (
        <SectionCard title="Subrecipient Monitoring">
          {mL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Subrecipient</th><th>Type</th><th>Date</th>
                <th>Findings</th><th>Questioned Costs</th><th>Status</th>
              </tr></thead>
              <tbody>
                {(monitor || []).map(m => (
                  <tr key={m.monitoring_id}>
                    <td style={{ fontWeight: 500 }}>{m.subrecipient_name}</td>
                    <td>{m.monitoring_type}</td>
                    <td>{m.monitoring_date?.slice(0, 10)}</td>
                    <td style={{ textAlign: 'center' }}>{m.findings_count}</td>
                    <td style={{ textAlign: 'right' }}>{fmt$(m.questioned_costs)}</td>
                    <td><StatusBadge value={m.monitoring_result} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {tab === 'Corrective Actions' && (
        <SectionCard title="Corrective Action Plans">
          {cL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Subrecipient</th><th>Grant #</th><th>Finding</th>
                <th>Due Date</th><th>Status</th>
              </tr></thead>
              <tbody>
                {(correct || []).map(c => (
                  <tr key={c.corrective_action_id}>
                    <td style={{ fontWeight: 500 }}>{c.subrecipient_name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.grant_number}</td>
                    <td>{c.finding_description}</td>
                    <td>{c.due_date?.slice(0, 10)}</td>
                    <td><StatusBadge value={c.corrective_action_status} /></td>
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
