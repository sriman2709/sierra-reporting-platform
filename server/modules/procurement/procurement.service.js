import { query } from '../../connectors/hana.js';
import { Q } from './procurement.queries.js';

export const ProcurementService = {
  getKPIs:      () => query(Q.kpis).then(r => r[0]),
  getPipeline:  () => query(Q.pipeline),
  getContracts: () => query(Q.contracts),
  getAPAging:   () => query(Q.apAging),
  getVendors:   () => query(Q.vendors),
};
