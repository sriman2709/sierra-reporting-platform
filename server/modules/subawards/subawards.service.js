import { query } from '../../connectors/hana.js';
import { Q } from './subawards.queries.js';
export const SubawardsService = {
  getAll:          ()       => query(Q.all),
  getByGrant:      (id)     => query(Q.byGrant(id)),
  getSubrecipients:()       => query(Q.subrecipients),
  getMonitoring:   ()       => query(Q.monitoring),
  getCorrective:   ()       => query(Q.corrective),
  getKPIs:         ()       => query(Q.kpis).then(r => r[0]),
};
