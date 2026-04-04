import { SCHEMA as S } from '../../connectors/hana.js';
export const Q = {
  readiness:  `SELECT * FROM ${S}."V_AuditReadiness"`,
  evidence:   `SELECT * FROM ${S}."V_EvidenceChain" LIMIT 200`,
  log:        `SELECT * FROM ${S}."I_AuditLog" ORDER BY "event_timestamp" DESC`,
  documents:  `SELECT d.*, g."grant_number" FROM ${S}."I_Document" d LEFT JOIN ${S}."I_GrantMaster" g ON g."grant_id"=d."grant_id" ORDER BY d."document_date" DESC`,
  approvals:  `SELECT ar.*, g."grant_number" FROM ${S}."I_ApprovalRecord" ar LEFT JOIN ${S}."I_GrantMaster" g ON g."grant_id"=ar."grant_id"`,

  // ── Sprint 3: Drilldown by grant ─────────────────────────────────────────
  // NOTE: grant_id is always a 20-char hex string [0-9a-f] — safe to embed directly.
  // hdb driver on HANA Cloud does not reliably support ? parameter binding.
  drillGrant: (id) => `
    SELECT g."grant_id", g."grant_number", g."grant_title", g."grantor_agency",
           g."cfda_number", g."award_amount", g."award_start_date", g."award_end_date",
           g."award_status", g."indirect_cost_rate", g."match_required_pct",
           p."program_name", f."fund_name", f."fund_type"
    FROM ${S}."I_GrantMaster" g
    LEFT JOIN ${S}."I_Program" p ON p."program_id" = g."program_id"
    LEFT JOIN ${S}."I_Fund"    f ON f."fund_id"    = g."fund_id"
    WHERE g."grant_id" = '${id}'`,

  drillEvidence: (id) => `
    SELECT * FROM ${S}."V_EvidenceChain"
    WHERE "grant_id" = '${id}'
    ORDER BY "evidence_date" DESC`,

  drillDocuments: (id) => `
    SELECT "document_id", "document_number", "document_type", "document_title",
           "document_category", "document_date", "amount", "description",
           "file_name", "file_size_kb", "status", "created_by",
           "is_confidential", "access_level", "retention_date"
    FROM ${S}."I_Document"
    WHERE "grant_id" = '${id}'
    ORDER BY "document_date" DESC`,

  drillApprovals: (id) => `
    SELECT "approval_id", "approval_type", "approver_name", "approver_role",
           "approval_status", "approval_step", "submitted_date", "decision_date",
           "decision_notes", "delegation_from"
    FROM ${S}."I_ApprovalRecord"
    WHERE "grant_id" = '${id}'
    ORDER BY "decision_date" DESC NULLS LAST`,

  drillFindings: (id) => `
    SELECT "action_id", "finding_description", "finding_category", "severity",
           "action_required", "action_taken", "responsible_party",
           "due_date", "completion_date", "status", "verified_by", "verified_date"
    FROM ${S}."I_CorrectiveAction"
    WHERE "grant_id" = '${id}'
    ORDER BY
      CASE "severity" WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
      "due_date" ASC NULLS LAST`,

  drillLog: (id) => `
    SELECT "log_id", "event_timestamp", "user_name", "user_role",
           "action", "entity_type", "change_summary", "application_module",
           "is_tamper_evident", "hash_value"
    FROM ${S}."I_AuditLog"
    WHERE "grant_id" = '${id}'
    ORDER BY "event_timestamp" DESC
    LIMIT 50`,

  // ── Sprint 3: Flat export package ────────────────────────────────────────
  exportReadiness: `
    SELECT
      r."grant_id", r."grant_number", r."grant_title", r."cfda_number",
      r."award_amount", r."award_status",
      r.OPEN_FINDINGS, r.OPEN_CORRECTIVE_ACTIONS,
      r.SUPPORTING_DOCUMENTS, r.COMPLETED_APPROVALS,
      r.HIGH_RISK_SUBRECIPIENTS, r.AUDIT_READINESS_STATUS,
      g."grantor_agency", g."award_start_date", g."award_end_date",
      g."indirect_cost_rate", g."match_required_pct",
      p."program_name", f."fund_name"
    FROM ${S}."V_AuditReadiness" r
    JOIN ${S}."I_GrantMaster" g ON g."grant_id" = r."grant_id"
    LEFT JOIN ${S}."I_Program" p ON p."program_id" = g."program_id"
    LEFT JOIN ${S}."I_Fund"    f ON f."fund_id"    = g."fund_id"
    ORDER BY r.AUDIT_READINESS_STATUS, r."grant_number"`,

  kpis: `
    SELECT
      SUM(CASE WHEN AUDIT_READINESS_STATUS='READY'         THEN 1 ELSE 0 END) AS "ready",
      SUM(CASE WHEN AUDIT_READINESS_STATUS='NOT_READY'     THEN 1 ELSE 0 END) AS "not_ready",
      SUM(CASE WHEN AUDIT_READINESS_STATUS='IN_REMEDIATION'THEN 1 ELSE 0 END) AS "in_remediation",
      SUM(CASE WHEN AUDIT_READINESS_STATUS='INCOMPLETE'    THEN 1 ELSE 0 END) AS "incomplete",
      SUM(OPEN_FINDINGS) AS "total_open_findings",
      SUM(HIGH_RISK_SUBRECIPIENTS) AS "total_high_risk"
    FROM ${S}."V_AuditReadiness"`,
};
