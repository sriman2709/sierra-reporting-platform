import { query } from '../../connectors/hana.js';
import { Q } from './finance.queries.js';

export const FinanceService = {
  getKPIs:          () => query(Q.kpis).then(r => r[0]),
  getBudgetVariance: () => query(Q.budgetVariance),
  getCloseReadiness: () => query(Q.closeReadiness),
  getJournals:       () => query(Q.journals),
  getInterfund:      () => query(Q.interfund),
};
