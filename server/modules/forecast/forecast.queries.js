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

  // ── Sprint 6: What-If base data ────────────────────────────────────────────
  whatIfBase: `
    SELECT
      f."fund_id", f."fund_code", f."fund_name", f."fund_type", f."fiscal_year",
      f."appropriation_amount"  AS "budget",
      f."expenditures_ytd"      AS "expenditures",
      f."encumbrance_amount"    AS "encumbrances",
      (f."appropriation_amount" - f."expenditures_ytd" - f."encumbrance_amount") AS "available",
      f."ending_balance",
      f."is_grant_fund",
      f."gasb54_class",
      ROUND(f."expenditures_ytd" / NULLIF(f."appropriation_amount",0) * 100, 1) AS "spend_pct"
    FROM ${S}."I_Fund" f
    ORDER BY f."fund_name"`,

  // ── Sprint 6: Sensitivity analysis ────────────────────────────────────────
  sensitivity: `
    SELECT
      f."fund_id", f."fund_name", f."fund_type",
      f."appropriation_amount"  AS "budget",
      f."expenditures_ytd"      AS "expenditures",
      f."encumbrance_amount"    AS "encumbrances",
      (f."appropriation_amount" - f."expenditures_ytd" - f."encumbrance_amount") AS "current_available",
      ROUND(f."appropriation_amount" * 0.10, 0)  AS "impact_10pct_budget_cut",
      ROUND(f."expenditures_ytd"     * 0.10, 0)  AS "impact_10pct_cost_increase",
      ROUND(f."appropriation_amount" * 0.05, 0)  AS "impact_5pct_budget_cut",
      ROUND(f."expenditures_ytd"     * 0.05, 0)  AS "impact_5pct_cost_increase",
      ROUND(f."expenditures_ytd" / NULLIF(f."appropriation_amount",0) * 100, 1) AS "spend_pct",
      CASE
        WHEN (f."appropriation_amount" - f."expenditures_ytd" - f."encumbrance_amount")
             < f."appropriation_amount" * 0.10 THEN 'HIGH'
        WHEN (f."appropriation_amount" - f."expenditures_ytd" - f."encumbrance_amount")
             < f."appropriation_amount" * 0.25 THEN 'MEDIUM'
        ELSE 'LOW'
      END AS "sensitivity_rating"
    FROM ${S}."I_Fund" f
    ORDER BY "impact_10pct_budget_cut" DESC`,
};
