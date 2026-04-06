import { query } from '../../connectors/hana.js';
import { Q } from './inventory.queries.js';

export const InventoryService = {
  getKPIs:        () => query(Q.kpis).then(r => r[0]),
  getItems:       () => query(Q.items),
  getTransactions:() => query(Q.transactions),
  getWarehouses:  () => query(Q.warehouses),
  getAlerts:      () => query(Q.alerts),
  getTurnover:    () => query(Q.turnover),
};
