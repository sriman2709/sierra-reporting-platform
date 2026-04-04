import { query } from '../../connectors/hana.js';
import { Q } from './capital.queries.js';

export const CapitalService = {
  getKPIs:         () => query(Q.kpis).then(r => r[0]),
  getProjects:     () => query(Q.projects),
  getMilestones:   () => query(Q.milestones),
  getChangeOrders: () => query(Q.changeOrders),
  getFunding:      () => query(Q.funding),
  getCIPSummary:   () => query(Q.cipSummary),
};
