import { query } from '../../connectors/hana.js';
import { Q } from './executive.queries.js';

export const ExecutiveService = {
  getCrossDomainKPIs: () => query(Q.crossDomainKPIs).then(r => r[0]),
  getAlerts:          () => query(Q.alerts),
  getBenchmarks:      () => query(Q.benchmarks),
  getGrantTrend:      () => query(Q.grantTrend),
  getDomainRisk:      () => query(Q.domainRisk),
  getBudgetActual:    () => query(Q.budgetActual),
};
