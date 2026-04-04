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
  // NOTE: queries run sequentially — hdb single connection is not safe for
  // concurrent parameterized statements (causes "unbound parameter" errors)
  getDrilldown: async (grantId) => {
    const grant     = await query(Q.drillGrant(grantId)).then(r => r[0] || null);
    const evidence  = await query(Q.drillEvidence(grantId));
    const documents = await query(Q.drillDocuments(grantId));
    const approvals = await query(Q.drillApprovals(grantId));
    const findings  = await query(Q.drillFindings(grantId));
    const auditLog  = await query(Q.drillLog(grantId));
    return { grant, evidence, documents, approvals, findings, auditLog };
  },

  // Sprint 3 — flat export dataset
  getExport: () => query(Q.exportReadiness),
};
