import { query } from '../../connectors/hana.js';
import { Q } from './grants.queries.js';

export const GrantsService = {
  getAll:               ()   => query(Q.all),
  getById:              (id) => query(Q.byId(id)).then(r => r[0]),
  getCompliance:        ()   => query(Q.compliance),
  getLifecycle:         ()   => query(Q.lifecycle),
  getBurnRate:          ()   => query(Q.burnRate),
  getCompliancePosture: ()   => query(Q.compliancePosture),
  getAllowability:       ()   => query(Q.allowability),
  getSubrecipientRisk:  ()   => query(Q.subrecipientRisk),
  getKPIs:              ()   => query(Q.kpis).then(r => r[0]),
};
