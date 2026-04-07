import { query } from '../../connectors/hana.js';
import { Q } from './transparency.queries.js';

export const TransparencyService = {
  getKPIs:           () => query(Q.kpis).then(r => r[0]),
  getGrantAwards:    () => query(Q.grantAwards),
  getSpendingByFund: () => query(Q.spendingByFund),
  getCafrSummary:    () => query(Q.cafrSummary),
  getTaxRevenue:     () => query(Q.taxRevenue),
  getTaxTrend:       () => query(Q.taxTrend),
  getOutcomes:       () => query(Q.outcomes),
  getGrantsByAgency: () => query(Q.grantsByAgency),
  getContracts:      () => query(Q.contracts),
};
