import { query } from '../../connectors/hana.js';
import { Q } from './funds.queries.js';
export const FundsService = {
  getAll:       () => query(Q.all),
  getBalance:   () => query(Q.balance),
  getForecast:  () => query(Q.forecast),
  getAvailable: () => query(Q.available),
  getKPIs:      () => query(Q.kpis).then(r => r[0]),
};
