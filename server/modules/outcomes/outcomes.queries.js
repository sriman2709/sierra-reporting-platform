import { SCHEMA as S } from '../../connectors/hana.js';
export const Q = {
  scorecard: `SELECT * FROM ${S}."V_OutcomeScorecard"`,
  metrics:   `SELECT m.*, p."program_name" FROM ${S}."I_OutcomeMetric" m LEFT JOIN ${S}."I_Program" p ON p."program_id"=m."program_id"`,
  actuals:   `SELECT a.*, m."metric_name", m."unit_of_measure" FROM ${S}."I_OutcomeActual" a LEFT JOIN ${S}."I_OutcomeMetric" m ON m."metric_id"=a."metric_id" ORDER BY a."measurement_date" DESC`,
  programs:  `SELECT * FROM ${S}."I_Program"`,
  cost:      `SELECT c.*, p."program_name" FROM ${S}."I_CostToServeUnit" c LEFT JOIN ${S}."I_Program" p ON p."program_id"=c."program_id"`,
  kpis: `
    SELECT
      COUNT(DISTINCT "metric_id") AS "total_metrics",
      SUM(CASE WHEN "performance_status"='ON_TRACK' THEN 1 ELSE 0 END) AS "on_track",
      SUM(CASE WHEN "performance_status"='AT_RISK'  THEN 1 ELSE 0 END) AS "at_risk"
    FROM ${S}."I_OutcomeActual"`,
};
