import { query } from '../../connectors/hana.js';
import { Q } from './treasury.queries.js';

export const TreasuryService = {
  getKPIs:             () => query(Q.kpis).then(r => r[0]),
  getCashAccounts:     () => query(Q.cashAccounts),
  getInvestments:      () => query(Q.investments),
  getDebtService:      () => query(Q.debtService),
  getTaxTrend:         () => query(Q.taxTrend),
  getRevenueByType:    () => query(Q.revenueByType),
  getCashByType:       () => query(Q.cashByType),
  getInvestmentsByType:() => query(Q.investmentsByType),
};
