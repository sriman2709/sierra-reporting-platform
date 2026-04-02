import { useState } from 'react';
import useData from '../components/useData';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmt$ = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

const TABS = ['Audit Readiness', 'Evidence Chain', 'Documents', 'Approvals', 'Audit Log'];

export default function Audit() {
  const [tab, setTab] = useState('Audit Readiness');
  const { data: readiness, loading: rL } = useData('/audit/readiness');
  const { data: evidence,  loading: eL } = useData('/audit/evidence');
  const { data: docs,      loading: dL } = useData('/audit/documents');
  const { data: approvals, loading: apL } = useData('/audit/approvals');
  const { data: log,       loading: lL } = useData('/audit/log');
  const { data: kpis,      loading: kL } = useData('/audit/kpis');

  const k = kpis || {};

  return (
    <div>
      <div className="kpi-grid">
        <KpiCard label="Audit Ready"             value={k.ready              ?? '…'} color="green" />
        <KpiCard label="In Remediation"          value={k.in_remediation     ?? '…'} color="yellow" />
        <KpiCard label="Not Ready"               value={k.not_ready          ?? '…'} color="red" />
        <KpiCard label="Open Findings"           value={k.total_open_findings ?? '…'} color="orange" />
        <KpiCard label="High-Risk Subrecipients" value={k.total_high_risk    ?? '…'} color="red" />
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Audit Readiness' && (
        <SectionCard title="Grant Audit Readiness">
          {rL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Grant #</th><th>Title</th><th>Amount</th>
                <th>Open Findings</th><th>Corrective Actions</th>
                <th>Documents</th><th>Approvals</th><th>High-Risk Subs</th><th>Status</th>
              </tr></thead>
              <tbody>
                {(readiness || []).map(r => (
                  <tr key={r.grant_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.grant_number}</td>
                    <td style={{ fontWeight: 500 }}>{r.grant_title}</td>
                    <td>{fmt$(r.award_amount)}</td>
                    <td style={{ textAlign: 'center', color: (r.OPEN_FINDINGS || 0) > 0 ? 'var(--red)' : undefined }}>
                      {r.OPEN_FINDINGS ?? r.open_findings}
                    </td>
                    <td style={{ textAlign: 'center' }}>{r.OPEN_CORRECTIVE_ACTIONS ?? r.open_corrective_actions}</td>
                    <td style={{ textAlign: 'center' }}>{r.SUPPORTING_DOCUMENTS ?? r.supporting_documents}</td>
                    <td style={{ textAlign: 'center' }}>{r.COMPLETED_APPROVALS ?? r.completed_approvals}</td>
                    <td style={{ textAlign: 'center', color: (r.HIGH_RISK_SUBRECIPIENTS || 0) > 0 ? 'var(--orange)' : undefined }}>
                      {r.HIGH_RISK_SUBRECIPIENTS ?? r.high_risk_subrecipients}
                    </td>
                    <td><StatusBadge value={r.AUDIT_READINESS_STATUS ?? r.audit_readiness_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {tab === 'Evidence Chain' && (
        <SectionCard title="Control Evidence Chain">
          {eL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Grant</th><th>Control</th><th>Framework</th><th>CFR Ref</th>
                <th>Test Result</th><th>Document</th><th>Approval</th><th>Metric</th>
              </tr></thead>
              <tbody>
                {(evidence || []).slice(0, 50).map((e, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 11 }}>{e.grant_number}</td>
                    <td style={{ fontWeight: 500 }}>{e.control_name}</td>
                    <td>{e.compliance_framework}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{e.cfr_reference}</td>
                    <td><StatusBadge value={e.test_result} /></td>
                    <td style={{ fontSize: 12 }}>{e.DOCUMENT_NAME ?? e.document_name}</td>
                    <td style={{ fontSize: 12 }}>{e.APPROVED_BY ?? e.approved_by}</td>
                    <td style={{ fontSize: 12 }}>{e.metric_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {tab === 'Documents' && (
        <SectionCard title={`Supporting Documents (${docs?.length ?? '…'})`}>
          {dL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Grant #</th><th>Title</th><th>Type</th>
                <th>Date</th><th>Uploaded By</th><th>Status</th>
              </tr></thead>
              <tbody>
                {(docs || []).map(d => (
                  <tr key={d.document_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{d.grant_number}</td>
                    <td style={{ fontWeight: 500 }}>{d.document_title}</td>
                    <td>{d.document_type}</td>
                    <td>{fmtDate(d.document_date)}</td>
                    <td>{d.uploaded_by}</td>
                    <td><StatusBadge value={d.document_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {tab === 'Approvals' && (
        <SectionCard title={`Approval Records (${approvals?.length ?? '…'})`}>
          {apL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Grant #</th><th>Approval Type</th><th>Approved By</th>
                <th>Approval Date</th><th>Amount</th><th>Status</th>
              </tr></thead>
              <tbody>
                {(approvals || []).map(a => (
                  <tr key={a.approval_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{a.grant_number}</td>
                    <td style={{ fontWeight: 500 }}>{a.approval_type}</td>
                    <td>{a.approved_by}</td>
                    <td>{fmtDate(a.approval_date)}</td>
                    <td>{fmt$(a.approved_amount)}</td>
                    <td><StatusBadge value={a.approval_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {tab === 'Audit Log' && (
        <SectionCard title="System Audit Log">
          {lL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Timestamp</th><th>User</th><th>Role</th>
                <th>Module</th><th>Action</th><th>Entity</th><th>Summary</th>
              </tr></thead>
              <tbody>
                {(log || []).map(l => (
                  <tr key={l.log_id}>
                    <td style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{l.event_timestamp?.slice(0, 16)}</td>
                    <td>{l.user_name}</td>
                    <td style={{ fontSize: 11 }}>{l.user_role}</td>
                    <td>{l.application_module}</td>
                    <td><span className="badge badge-blue">{l.action}</span></td>
                    <td style={{ fontSize: 11 }}>{l.entity_type}</td>
                    <td style={{ fontSize: 12 }}>{l.change_summary}</td>
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
