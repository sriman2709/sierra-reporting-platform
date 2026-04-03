import { query } from '../../connectors/hana.js';
import { Q } from './forecast.queries.js';
export const ForecastService = {
  getVariance:    () => query(Q.variance),
  getScenarios:   () => query(Q.scenarios),
  getEntries:     () => query(Q.entries),
  getKPIs:        () => query(Q.kpis).then(r => r[0]),
  getWhatIfBase:  () => query(Q.whatIfBase),
  getSensitivity: () => query(Q.sensitivity),
};
