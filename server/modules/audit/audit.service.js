import { query } from '../../connectors/hana.js';
import { Q } from './audit.queries.js';
export const AuditService = {
  getReadiness:  () => query(Q.readiness),
  getEvidence:   () => query(Q.evidence),
  getLog:        () => query(Q.log),
  getDocuments:  () => query(Q.documents),
  getApprovals:  () => query(Q.approvals),
  getKPIs:       () => query(Q.kpis).then(r => r[0]),
};
