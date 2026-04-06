import { query } from '../../connectors/hana.js';
import { Q } from './hr.queries.js';

export const HRService = {
  getKPIs:          () => query(Q.kpis).then(r => r[0]),
  getEmployees:     () => query(Q.employees),
  getPositions:     () => query(Q.positions),
  getTurnover:      () => query(Q.turnover),
  getPayroll:       () => query(Q.payroll),
  getFundAllocation:() => query(Q.fundAllocation),
};
