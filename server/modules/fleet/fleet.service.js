import { query } from '../../connectors/hana.js';
import { Q } from './fleet.queries.js';

export const FleetService = {
  getKPIs:       () => query(Q.kpis).then(r => r[0]),
  getVehicles:   () => query(Q.vehicles),
  getFuel:       () => query(Q.fuel),
  getInspections:() => query(Q.inspections),
  getCostByDept: () => query(Q.costByDept),
  getUtilization:() => query(Q.utilization),
};
