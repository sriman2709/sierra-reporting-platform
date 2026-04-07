import { SCHEMA as S } from '../../connectors/hana.js';

export const Q = {

  // ── Headline KPIs for citizens ─────────────────────────────────────────────
  kpis: `
    SELECT
      (SELECT COUNT(*)
         FROM ${S}."I_GrantMaster"
        WHERE "award_status" IN ('ACTIVE','EXPIRING'))                         AS "active_grants",
      (SELECT ROUND(SUM("award_amount"), 2)
         FROM ${S}."I_GrantMaster"
        WHERE "award_status" IN ('ACTIVE','EXPIRING'))                         AS "total_grant_funding",
      (SELECT ROUND(SUM("expenditures_ytd"), 2)
         FROM ${S}."I_Fund"
        WHERE "fiscal_year" = (SELECT MAX("fiscal_year") FROM ${S}."I_Fund")) AS "total_spending_ytd",
      (SELECT ROUND(SUM("revenues_ytd"), 2)
         FROM ${S}."I_Fund"
        WHERE "fiscal_year" = (SELECT MAX("fiscal_year") FROM ${S}."I_Fund")) AS "total_revenue_ytd",
      (SELECT ROUND(SUM("balance"), 2)
         FROM ${S}."I_CashAccount")                                            AS "cash_reserves",
      (SELECT ROUND(SUM("amount_collected"), 2)
         FROM ${S}."I_TaxRevenue"
        WHERE "fiscal_year" = YEAR(CURRENT_DATE))                              AS "tax_revenue_ytd",
      (SELECT COUNT(DISTINCT "grantor_agency")
         FROM ${S}."I_GrantMaster"
        WHERE "award_status" = 'ACTIVE')                                       AS "funding_agencies",
      (SELECT COUNT(DISTINCT "department")
         FROM ${S}."I_PurchaseOrder")                                          AS "departments_served"
    FROM DUMMY`,

  // ── Public grant awards (no internal IDs) ─────────────────────────────────
  grantAwards: `
    SELECT
      "grant_number", "grant_title", "grantor_agency",
      "cfda_number", "award_amount",
      "award_start_date", "award_end_date",
      "award_status", "reporting_frequency"
    FROM ${S}."I_GrantMaster"
    WHERE "award_status" IN ('ACTIVE','EXPIRING','CLOSED')
    ORDER BY "award_amount" DESC`,

  // ── Spending by fund ───────────────────────────────────────────────────────
  spendingByFund: `
    SELECT
      "fund_name", "fund_type", "fiscal_year",
      "beginning_balance", "revenues_ytd", "expenditures_ytd",
      "ending_balance",
      ROUND("expenditures_ytd" / NULLIF("beginning_balance", 0) * 100, 1)     AS "utilization_pct"
    FROM ${S}."I_Fund"
    WHERE "fiscal_year" = (SELECT MAX("fiscal_year") FROM ${S}."I_Fund")
    ORDER BY "expenditures_ytd" DESC`,

  // ── CAFR-style summary by fund type ──────────────────────────────────────
  cafrSummary: `
    SELECT
      "fund_type",
      COUNT(*)                                                                  AS "fund_count",
      ROUND(SUM("beginning_balance"), 2)                                       AS "total_appropriation",
      ROUND(SUM("revenues_ytd"), 2)                                            AS "total_revenues",
      ROUND(SUM("expenditures_ytd"), 2)                                        AS "total_expenditures",
      ROUND(SUM("ending_balance"), 2)                                          AS "fund_balance",
      ROUND(SUM("expenditures_ytd") / NULLIF(SUM("beginning_balance"), 0) * 100, 1) AS "spend_pct"
    FROM ${S}."I_Fund"
    WHERE "fiscal_year" = (SELECT MAX("fiscal_year") FROM ${S}."I_Fund")
    GROUP BY "fund_type"
    ORDER BY "total_expenditures" DESC`,

  // ── Tax revenue by type (current year) ───────────────────────────────────
  taxRevenue: `
    SELECT
      "tax_type",
      ROUND(SUM("amount_collected"), 2)                                        AS "total_collected",
      ROUND(SUM("amount_budgeted"), 2)                                         AS "total_budgeted",
      ROUND(SUM("amount_collected") / NULLIF(SUM("amount_budgeted"), 0) * 100, 1) AS "pct_of_budget"
    FROM ${S}."I_TaxRevenue"
    WHERE "fiscal_year" = YEAR(CURRENT_DATE)
    GROUP BY "tax_type"
    ORDER BY "total_collected" DESC`,

  // ── Monthly tax trend (current year) ─────────────────────────────────────
  taxTrend: `
    SELECT
      "period_label",
      "fiscal_month",
      ROUND(SUM("amount_collected"), 2)                                        AS "total_collected",
      ROUND(SUM("amount_budgeted"), 2)                                         AS "total_budgeted"
    FROM ${S}."I_TaxRevenue"
    WHERE "fiscal_year" = YEAR(CURRENT_DATE)
    GROUP BY "period_label", "fiscal_month"
    ORDER BY "fiscal_month" ASC`,

  // ── Program outcomes (public-facing, active metrics only) ────────────────
  outcomes: `
    SELECT
      m."metric_name",
      m."unit_of_measure",
      m."measurement_frequency",
      a."fiscal_year",
      a."period",
      a."actual_value",
      a."performance_status"
    FROM ${S}."I_OutcomeActual"  a
    JOIN ${S}."I_OutcomeMetric"  m ON m."metric_id" = a."metric_id"
    WHERE m."is_active" = 'Y'
    ORDER BY a."fiscal_year" DESC, a."period" DESC, m."metric_name" ASC`,

  // ── Grants by funding agency (summary chart) ──────────────────────────────
  grantsByAgency: `
    SELECT
      "grantor_agency",
      COUNT(*)                                                                  AS "grant_count",
      ROUND(SUM("award_amount"), 2)                                            AS "total_awards"
    FROM ${S}."I_GrantMaster"
    WHERE "award_status" IN ('ACTIVE','EXPIRING')
    GROUP BY "grantor_agency"
    ORDER BY "total_awards" DESC`,

  // ── Active contracts summary (public procurement transparency) ────────────
  contracts: `
    SELECT
      "contract_number", "contract_type",
      ROUND("original_amount", 2)                                              AS "contract_value",
      "start_date", "end_date", "contract_status"
    FROM ${S}."I_Contract"
    WHERE "contract_status" IN ('ACTIVE','EXPIRING')
    ORDER BY "original_amount" DESC`,
};
