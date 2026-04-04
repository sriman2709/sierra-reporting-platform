import { query } from '../../connectors/hana.js';
import { Q } from './assets.queries.js';

export const AssetsService = {
  getKPIs:       () => query(Q.kpis).then(r => r[0]),
  getAssets:     () => query(Q.assets),
  getWorkOrders: () => query(Q.workOrders),
  getPMPlans:    () => query(Q.pmPlans),
  getFailures:   () => query(Q.failures),
  getCostByType: () => query(Q.costByType),
};
