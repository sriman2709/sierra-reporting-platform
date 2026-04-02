import { SCHEMA as S } from '../../connectors/hana.js';
export const Q = {
  all: `SELECT * FROM ${S}."I_Fund"`,
  balance: `SELECT * FROM ${S}."V_FundBalance"`,
  forecast: `SELECT * FROM ${S}."V_ForecastVariance"`,

  available: `
    SELECT
      f."fund_id", f."fund_code", f."fund_name", f."fund_type", f."fiscal_year",
      f."appropriation_amount"  AS "budget",
      f."expenditures_ytd"      AS "expenditures",
      f."encumbrance_amount"    AS "encumbrances",
      (f."appropriation_amount" - f."expenditures_ytd" - f."encumbrance_amount") AS "available_to_spend",
      ROUND((f."expenditures_ytd" / NULLIF(f."appropriation_amount",0)) * 100, 1) AS "burn_pct",
      ROUND((f."encumbrance_amount" / NULLIF(f."appropriation_amount",0)) * 100, 1) AS "encumbrance_pct",
      f."ending_balance",
      f."is_grant_fund",
      f."gasb54_class",
      CASE
        WHEN (f."appropriation_amount" - f."expenditures_ytd" - f."encumbrance_amount") < 0 THEN 'OVER_BUDGET'
        WHEN ROUND((f."expenditures_ytd" / NULLIF(f."appropriation_amount",0)) * 100, 1) > 85 THEN 'CRITICAL'
        WHEN ROUND((f."expenditures_ytd" / NULLIF(f."appropriation_amount",0)) * 100, 1) > 70 THEN 'WARNING'
        ELSE 'ON_TRACK'
      END AS "budget_status"
    FROM ${S}."I_Fund" f
    ORDER BY "available_to_spend" ASC`,

  kpis: `
    SELECT
      COUNT(*) AS "total_funds",
      SUM("ending_balance")    AS "total_balance",
      SUM("restricted_amount") AS "total_restricted",
      SUM("unassigned_amount") AS "total_unassigned",
      SUM("encumbrance_amount") AS "total_encumbrances",
      SUM("appropriation_amount" - "expenditures_ytd" - "encumbrance_amount") AS "total_available",
      SUM(CASE WHEN ("appropriation_amount" - "expenditures_ytd" - "encumbrance_amount") < 0 THEN 1 ELSE 0 END) AS "over_budget_funds"
    FROM ${S}."I_Fund"`,
};
