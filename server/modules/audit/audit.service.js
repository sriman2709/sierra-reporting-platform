import { query } from '../../connectors/hana.js';
import { Q } from './audit.queries.js';

export const AuditService = {
  getReadiness:  () => query(Q.readiness),
  getEvidence:   () => query(Q.evidence),
  getLog:        () => query(Q.log),
  getDocuments:  () => query(Q.documents),
  getApprovals:  () => query(Q.approvals),
  getKPIs:       () => query(Q.kpis).then(r => r[0]),

  // Sprint 3 — full drilldown package for one grant
  getDrilldown: async (grantId) => {
    const [grant, evidence, documents, approvals, findings, auditLog] = await Promise.all([
      query(Q.drillGrant,    [grantId]).then(r => r[0] || null),
      query(Q.drillEvidence, [grantId]),
      query(Q.drillDocuments,[grantId]),
      query(Q.drillApprovals,[grantId]),
      query(Q.drillFindings, [grantId]),
      query(Q.drillLog,      [grantId]),
    ]);
    return { grant, evidence, documents, approvals, findings, auditLog };
  },

  // Sprint 3 — flat export dataset
  getExport: () => query(Q.exportReadiness),
};
