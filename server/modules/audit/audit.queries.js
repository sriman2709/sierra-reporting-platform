import { SCHEMA as S } from '../../connectors/hana.js';
export const Q = {
  readiness:  `SELECT * FROM ${S}."V_AuditReadiness"`,
  evidence:   `SELECT * FROM ${S}."V_EvidenceChain" LIMIT 200`,
  log:        `SELECT * FROM ${S}."I_AuditLog" ORDER BY "event_timestamp" DESC`,
  documents:  `SELECT d.*, g."grant_number" FROM ${S}."I_Document" d LEFT JOIN ${S}."I_GrantMaster" g ON g."grant_id"=d."grant_id" ORDER BY d."document_date" DESC`,
  approvals:  `SELECT ar.*, g."grant_number" FROM ${S}."I_ApprovalRecord" ar LEFT JOIN ${S}."I_GrantMaster" g ON g."grant_id"=ar."grant_id"`,
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
