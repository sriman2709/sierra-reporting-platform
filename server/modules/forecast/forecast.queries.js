import { SCHEMA as S } from '../../connectors/hana.js';
export const Q = {
  variance:  `SELECT * FROM ${S}."V_ForecastVariance" ORDER BY "fiscal_year","period"`,
  scenarios: `SELECT * FROM ${S}."I_ScenarioVersion" ORDER BY "created_at" DESC`,
  entries:   `SELECT fe.*, sv."scenario_name" FROM ${S}."I_ForecastEntry" fe LEFT JOIN ${S}."I_ScenarioVersion" sv ON sv."scenario_id"=fe."scenario_id"`,
  kpis: `
    SELECT
      COUNT(DISTINCT "scenario_id") AS "total_scenarios",
      SUM(CASE WHEN "early_warning_flag"='Y' THEN 1 ELSE 0 END) AS "early_warnings",
      AVG(CAST("confidence_level" AS DECIMAL)) AS "avg_confidence"
    FROM ${S}."I_ForecastEntry"`,
};
