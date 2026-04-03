import { query } from '../../connectors/hana.js';
import { Q } from './outcomes.queries.js';
export const OutcomesService = {
  getScorecard:         () => query(Q.scorecard),
  getMetrics:           () => query(Q.metrics),
  getActuals:           () => query(Q.actuals),
  getPrograms:          () => query(Q.programs),
  getCost:              () => query(Q.cost),
  getEffectiveness:     () => query(Q.effectiveness),
  getGrantLinkage:      () => query(Q.grantLinkage),
  getTrend:             () => query(Q.trend),
  getCostEffectiveness: () => query(Q.costEffectiveness),
  getKPIs:              () => query(Q.kpis).then(r => r[0]),
};
