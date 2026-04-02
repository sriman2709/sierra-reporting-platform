import { useState, useCallback } from 'react';
import useData from '../components/useData';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmt$ = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

const TABS = ['Audit Readiness', 'Evidence Chain', 'Documents', 'Approvals', 'Audit Log'];

const SEV_COLOR = { HIGH: '#e53e3e', MEDIUM: '#d69e2e', LOW: '#38a169' };
const STATUS_ICON = { PASS: '✅', FAIL: '❌', EXCEPTION: '⚠️' };

// ── CSV export helper ───────────────────────────────────────────────────────
function exportCSV(rows, filename) {
  if (!rows || !rows.length) return;
  const cols = Object.keys(rows[0]);
  const lines = [
    cols.join(','),
    ...rows.map(r =>
      cols.map(c => {
        const v = r[c] == null ? '' : String(r[c]);
        return v.includes(',') || v.includes('"') || v.includes('\n')
          ? `"${v.replace(/"/g, '""')}"` : v;
      }).join(',')
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── Drilldown Panel ─────────────────────────────────────────────────────────
function DrillPanel({ grant, onClose }) {
  const [section, setSection] = useState('evidence');
  const { data, loading, error } = useData(`/audit/drilldown/${grant.grant_id}`);

  const SECTIONS = ['evidence', 'documents', 'approvals', 'findings', 'auditLog'];

  const exportDrillCSV = () => {
    if (!data) return;
    const flat = (data.evidence || []).map(e => ({
      grant_number: grant.grant_number,
      grant_title: grant.grant_title,
      section: 'Evidence',
      control: e.control_name,
      framework: e.compliance_framework,
      cfr: e.cfr_reference,
      result: e.test_result,
      document: e.DOCUMENT_NAME,
      approver: e.APPROVED_BY,
      approval_status: e.approval_status,
      metric: e.metric_name,
      actual_value: e.actual_value,
      performance: e.performance_status,
    }));
    exportCSV(flat, `audit-drilldown-${grant.grant_number}.csv`);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 10, width: '92vw', maxWidth: 1100,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              🔍 Audit Drilldown — {grant.grant_title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {grant.grant_number} · CFDA {grant.cfda_number} · {grant.grantor_agency} · {fmt$(grant.award_amount)}
            </div>
          </div>
          <button onClick={exportDrillCSV} style={{
            padding: '6px 14px', background: 'var(--green)', color: '#fff',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}>⬇ Export CSV</button>
          <button onClick={onClose} style={{
            padding: '6px 12px', background: 'var(--surface-alt)', border: '1px solid var(--border)',
            borderRadius: 6, cursor: 'pointer', fontSize: 18, lineHeight: 1,
          }}>✕</button>
        </div>

        {/* Drill path breadcrumb */}
        <div style={{ padding: '10px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
          {SECTIONS.map((s, i) => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i > 0 && <span style={{ color: 'var(--text-muted)' }}>›</span>}
              <button onClick={() => setSection(s)} style={{
                background: section === s ? 'var(--primary)' : 'transparent',
                color: section === s ? '#fff' : 'var(--text-muted)',
                border: section === s ? 'none' : '1px solid var(--border)',
                borderRadius: 20, padding: '3px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 12,
              }}>
                {s === 'auditLog' ? 'Audit Log' : s.charAt(0).toUpperCase() + s.slice(1)}
                {data && data[s] ? ` (${Array.isArray(data[s]) ? data[s].length : 1})` : ''}
              </button>
            </span>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {loading && <div className="loading">Loading drilldown…</div>}
          {error && <div style={{ color: 'var(--red)' }}>Error: {error}</div>}

          {!loading && data && section === 'evidence' && (
            <table className="data-table">
              <thead><tr>
                <th>Control</th><th>Framework</th><th>CFR Ref</th>
                <th>Result</th><th>Document</th><th>Approved By</th><th>Metric</th><th>Performance</th>
              </tr></thead>
              <tbody>
                {(data.evidence || []).map((e, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{e.control_name}</td>
                    <td style={{ fontSize: 11 }}>{e.compliance_framework}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{e.cfr_reference}</td>
                    <td>{STATUS_ICON[e.test_result] || ''} <StatusBadge value={e.test_result} /></td>
                    <td style={{ fontSize: 12 }}>{e.DOCUMENT_NAME}</td>
                    <td style={{ fontSize: 12 }}>{e.APPROVED_BY}</td>
                    <td style={{ fontSize: 12 }}>{e.metric_name}</td>
                    <td><StatusBadge value={e.performance_status} /></td>
                  </tr>
                ))}
                {!(data.evidence || []).length && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No evidence records</td></tr>}
              </tbody>
            </table>
          )}

          {!loading && data && section === 'documents' && (
            <table className="data-table">
              <thead><tr>
                <th>Title</th><th>Type</th><th>Category</th><th>Date</th>
                <th>Amount</th><th>File</th><th>Status</th><th>Retention</th>
              </tr></thead>
              <tbody>
                {(data.documents || []).map(d => (
                  <tr key={d.document_id}>
                    <td style={{ fontWeight: 500 }}>{d.document_title}</td>
                    <td style={{ fontSize: 12 }}>{d.document_type}</td>
                    <td style={{ fontSize: 12 }}>{d.document_category}</td>
                    <td>{fmtDate(d.document_date)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt$(d.amount)}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.file_name || '—'}</td>
                    <td><StatusBadge value={d.status} /></td>
                    <td style={{ fontSize: 11 }}>{fmtDate(d.retention_date)}</td>
                  </tr>
                ))}
                {!(data.documents || []).length && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No documents</td></tr>}
              </tbody>
            </table>
          )}

          {!loading && data && section === 'approvals' && (
            <table className="data-table">
              <thead><tr>
                <th>Step</th><th>Type</th><th>Approver</th><th>Role</th>
                <th>Submitted</th><th>Decision Date</th><th>Notes</th><th>Status</th>
              </tr></thead>
              <tbody>
                {(data.approvals || []).map(a => (
                  <tr key={a.approval_id}>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{a.approval_step}</td>
                    <td>{a.approval_type}</td>
                    <td style={{ fontWeight: 500 }}>{a.approver_name}</td>
                    <td style={{ fontSize: 12 }}>{a.approver_role}</td>
                    <td>{fmtDate(a.submitted_date)}</td>
                    <td>{fmtDate(a.decision_date)}</td>
                    <td style={{ fontSize: 12, maxWidth: 200 }}>{a.decision_notes || '—'}</td>
                    <td><StatusBadge value={a.approval_status} /></td>
                  </tr>
                ))}
                {!(data.approvals || []).length && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No approval records</td></tr>}
              </tbody>
            </table>
          )}

          {!loading && data && section === 'findings' && (
            <table className="data-table">
              <thead><tr>
                <th>Severity</th><th>Category</th><th>Finding</th>
                <th>Action Required</th><th>Responsible</th><th>Due Date</th><th>Status</th>
              </tr></thead>
              <tbody>
                {(data.findings || []).map(f => (
                  <tr key={f.action_id}>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                        background: (SEV_COLOR[f.severity] || '#888') + '22',
                        color: SEV_COLOR[f.severity] || '#888',
                      }}>{f.severity}</span>
                    </td>
                    <td style={{ fontSize: 12 }}>{f.finding_category}</td>
                    <td style={{ fontWeight: 500, maxWidth: 220 }}>{f.finding_description}</td>
                    <td style={{ fontSize: 12 }}>{f.action_required}</td>
                    <td style={{ fontSize: 12 }}>{f.responsible_party || '—'}</td>
                    <td style={{ color: f.due_date && new Date(f.due_date) < new Date() ? 'var(--red)' : undefined }}>
                      {fmtDate(f.due_date)}
                    </td>
                    <td><StatusBadge value={f.status} /></td>
                  </tr>
                ))}
                {!(data.findings || []).length && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No open findings</td></tr>}
              </tbody>
            </table>
          )}

          {!loading && data && section === 'auditLog' && (
            <table className="data-table">
              <thead><tr>
                <th>Timestamp</th><th>User</th><th>Role</th>
                <th>Action</th><th>Module</th><th>Summary</th><th>Tamper-Evident</th>
              </tr></thead>
              <tbody>
                {(data.auditLog || []).map(l => (
                  <tr key={l.log_id}>
                    <td style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{l.event_timestamp?.slice(0, 16)}</td>
                    <td>{l.user_name}</td>
                    <td style={{ fontSize: 11 }}>{l.user_role}</td>
                    <td><span className="badge badge-blue">{l.action}</span></td>
                    <td style={{ fontSize: 12 }}>{l.application_module}</td>
                    <td style={{ fontSize: 12 }}>{l.change_summary}</td>
                    <td style={{ textAlign: 'center' }}>{l.is_tamper_evident ? '🔒' : '—'}</td>
                  </tr>
                ))}
                {!(data.auditLog || []).length && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No audit log entries</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Audit Page ─────────────────────────────────────────────────────────
export default function Audit() {
  const [tab, setTab]       = useState('Audit Readiness');
  const [drillGrant, setDrillGrant] = useState(null);

  const { data: readiness, loading: rL } = useData('/audit/readiness');
  const { data: evidence,  loading: eL } = useData('/audit/evidence');
  const { data: docs,      loading: dL } = useData('/audit/documents');
  const { data: approvals, loading: apL } = useData('/audit/approvals');
  const { data: log,       loading: lL } = useData('/audit/log');
  const { data: kpis,      loading: kL } = useData('/audit/kpis');

  const k = kpis || {};

  const handleExportReadiness = useCallback(() => {
    // client-side export from already-loaded readiness data
    exportCSV((readiness || []).map(r => ({
      grant_number: r.grant_number,
      grant_title: r.grant_title,
      cfda_number: r.cfda_number,
      award_amount: r.award_amount,
      award_status: r.award_status,
      open_findings: r.OPEN_FINDINGS,
      open_corrective_actions: r.OPEN_CORRECTIVE_ACTIONS,
      supporting_documents: r.SUPPORTING_DOCUMENTS,
      completed_approvals: r.COMPLETED_APPROVALS,
      high_risk_subrecipients: r.HIGH_RISK_SUBRECIPIENTS,
      audit_readiness_status: r.AUDIT_READINESS_STATUS,
    })), 'audit-readiness-package.csv');
  }, [readiness]);

  const handleExportEvidence = useCallback(() => {
    exportCSV((evidence || []).map(e => ({
      grant_number: e.grant_number,
      control_name: e.control_name,
      compliance_framework: e.compliance_framework,
      cfr_reference: e.cfr_reference,
      test_result: e.test_result,
      evidence_date: e.evidence_date,
      document_name: e.DOCUMENT_NAME,
      approved_by: e.APPROVED_BY,
      approval_status: e.approval_status,
      metric_name: e.metric_name,
      actual_value: e.actual_value,
      performance_status: e.performance_status,
    })), 'evidence-chain.csv');
  }, [evidence]);

  return (
    <div>
      {drillGrant && (
        <DrillPanel grant={drillGrant} onClose={() => setDrillGrant(null)} />
      )}

      <div className="kpi-grid">
        <KpiCard label="Audit Ready"             value={k.ready              ?? '…'} color="green" />
        <KpiCard label="In Remediation"          value={k.in_remediation     ?? '…'} color="yellow" />
        <KpiCard label="Not Ready"               value={k.not_ready          ?? '…'} color="red" />
        <KpiCard label="Open Findings"           value={k.total_open_findings ?? '…'} color="red" />
        <KpiCard label="High-Risk Subrecipients" value={k.total_high_risk    ?? '…'} color="yellow" />
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Audit Readiness' && (
        <SectionCard
          title="Grant Audit Readiness"
          action={
            <button onClick={handleExportReadiness} style={{
              padding: '5px 12px', background: 'var(--green)', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}>⬇ Export CSV</button>
          }
        >
          {rL ? <div className="loading">Loading…</div> : (
            <>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                💡 Click any row to open the full audit drilldown — Evidence → Documents → Approvals → Findings → Audit Log
              </p>
              <table className="data-table">
                <thead><tr>
                  <th>Grant #</th><th>Title</th><th>Amount</th>
                  <th>Open Findings</th><th>Corrective Actions</th>
                  <th>Documents</th><th>Approvals</th><th>High-Risk Subs</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {(readiness || []).map(r => (
                    <tr
                      key={r.grant_id}
                      onClick={() => setDrillGrant(r)}
                      style={{ cursor: 'pointer' }}
                      className="row-hover"
                    >
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.grant_number}</td>
                      <td style={{ fontWeight: 500 }}>
                        <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{r.grant_title}</span>
                      </td>
                      <td>{fmt$(r.award_amount)}</td>
                      <td style={{ textAlign: 'center', color: (r.OPEN_FINDINGS || 0) > 0 ? 'var(--red)' : undefined, fontWeight: (r.OPEN_FINDINGS || 0) > 0 ? 700 : undefined }}>
                        {r.OPEN_FINDINGS ?? 0}
                      </td>
                      <td style={{ textAlign: 'center' }}>{r.OPEN_CORRECTIVE_ACTIONS ?? 0}</td>
                      <td style={{ textAlign: 'center' }}>{r.SUPPORTING_DOCUMENTS ?? 0}</td>
                      <td style={{ textAlign: 'center' }}>{r.COMPLETED_APPROVALS ?? 0}</td>
                      <td style={{ textAlign: 'center', color: (r.HIGH_RISK_SUBRECIPIENTS || 0) > 0 ? 'var(--orange)' : undefined }}>
                        {r.HIGH_RISK_SUBRECIPIENTS ?? 0}
                      </td>
                      <td><StatusBadge value={r.AUDIT_READINESS_STATUS} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </SectionCard>
      )}

      {tab === 'Evidence Chain' && (
        <SectionCard
          title="Control Evidence Chain"
          action={
            <button onClick={handleExportEvidence} style={{
              padding: '5px 12px', background: 'var(--green)', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}>⬇ Export CSV</button>
          }
        >
          {eL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Grant</th><th>Control</th><th>Framework</th><th>CFR Ref</th>
                <th>Result</th><th>Document</th><th>Approval</th><th>Metric</th><th>Performance</th>
              </tr></thead>
              <tbody>
                {(evidence || []).slice(0, 50).map((e, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 11 }}>{e.grant_number}</td>
                    <td style={{ fontWeight: 500 }}>{e.control_name}</td>
                    <td style={{ fontSize: 11 }}>{e.compliance_framework}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{e.cfr_reference}</td>
                    <td>{STATUS_ICON[e.test_result] || ''} <StatusBadge value={e.test_result} /></td>
                    <td style={{ fontSize: 12 }}>{e.DOCUMENT_NAME}</td>
                    <td style={{ fontSize: 12 }}>{e.APPROVED_BY}</td>
                    <td style={{ fontSize: 12 }}>{e.metric_name}</td>
                    <td><StatusBadge value={e.performance_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {tab === 'Documents' && (
        <SectionCard
          title={`Supporting Documents (${docs?.length ?? '…'})`}
          action={
            <button onClick={() => exportCSV(docs || [], 'documents.csv')} style={{
              padding: '5px 12px', background: 'var(--green)', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}>⬇ Export CSV</button>
          }
        >
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
                    <td>{d.uploaded_by || d.created_by}</td>
                    <td><StatusBadge value={d.document_status || d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {tab === 'Approvals' && (
        <SectionCard
          title={`Approval Records (${approvals?.length ?? '…'})`}
          action={
            <button onClick={() => exportCSV(approvals || [], 'approvals.csv')} style={{
              padding: '5px 12px', background: 'var(--green)', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}>⬇ Export CSV</button>
          }
        >
          {apL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Grant #</th><th>Approval Type</th><th>Approved By</th>
                <th>Role</th><th>Decision Date</th><th>Notes</th><th>Status</th>
              </tr></thead>
              <tbody>
                {(approvals || []).map(a => (
                  <tr key={a.approval_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{a.grant_number}</td>
                    <td style={{ fontWeight: 500 }}>{a.approval_type}</td>
                    <td>{a.approver_name || a.approved_by}</td>
                    <td style={{ fontSize: 12 }}>{a.approver_role}</td>
                    <td>{fmtDate(a.decision_date || a.approval_date)}</td>
                    <td style={{ fontSize: 12 }}>{a.decision_notes || '—'}</td>
                    <td><StatusBadge value={a.approval_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {tab === 'Audit Log' && (
        <SectionCard
          title="System Audit Log"
          action={
            <button onClick={() => exportCSV(log || [], 'audit-log.csv')} style={{
              padding: '5px 12px', background: 'var(--green)', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}>⬇ Export CSV</button>
          }
        >
          {lL ? <div className="loading">Loading…</div> : (
            <table className="data-table">
              <thead><tr>
                <th>Timestamp</th><th>User</th><th>Role</th>
                <th>Module</th><th>Action</th><th>Entity</th><th>Summary</th><th>🔒</th>
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
                    <td style={{ textAlign: 'center' }}>{l.is_tamper_evident ? '🔒' : ''}</td>
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
