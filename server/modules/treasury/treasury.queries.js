import { SCHEMA as S } from '../../connectors/hana.js';

export const Q = {

  kpis: `
    SELECT
      (SELECT ROUND(SUM("balance"), 2)
         FROM ${S}."I_CashAccount")                                            AS "total_cash_position",
      (SELECT ROUND(SUM("balance"), 2)
         FROM ${S}."I_CashAccount"
        WHERE "account_type" = 'OPERATING')                                    AS "operating_cash",
      (SELECT ROUND(SUM("balance"), 2)
         FROM ${S}."I_CashAccount"
        WHERE "account_type" = 'RESERVE')                                      AS "reserve_cash",
      (SELECT ROUND(SUM("current_value"), 2)
         FROM ${S}."I_Investment"
        WHERE "status" = 'ACTIVE')                                             AS "total_investments",
      (SELECT ROUND(SUM("outstanding_balance"), 2)
         FROM ${S}."I_DebtService")                                            AS "total_debt_outstanding",
      (SELECT ROUND(SUM("annual_payment"), 2)
         FROM ${S}."I_DebtService")                                            AS "annual_debt_service",
      (SELECT ROUND(SUM("amount_collected"), 2)
         FROM ${S}."I_TaxRevenue"
        WHERE "fiscal_year" = YEAR(CURRENT_DATE))                              AS "tax_revenue_ytd",
      (SELECT ROUND(SUM("amount_budgeted"), 2)
         FROM ${S}."I_TaxRevenue"
        WHERE "fiscal_year" = YEAR(CURRENT_DATE))                              AS "tax_budget_ytd",
      (SELECT COUNT(*)
         FROM ${S}."I_Investment"
        WHERE "maturity_date" <= ADD_MONTHS(CURRENT_DATE, 90)
          AND "status" = 'ACTIVE')                                             AS "investments_maturing_90d"
    FROM DUMMY`,

  cashAccounts: `
    SELECT
      "account_id", "account_name", "account_type",
      "fund_id", "balance", "as_of_date",
      "bank_name", "account_number_last4"
    FROM ${S}."I_CashAccount"
    ORDER BY "account_type" ASC, "balance" DESC`,

  investments: `
    SELECT
      "investment_id", "investment_type", "issuer",
      "par_value", "current_value",
      ROUND("current_value" - "par_value", 2)                                  AS "unrealized_gain",
      ROUND(("current_value" - "par_value") / NULLIF("par_value", 0) * 100, 2) AS "gain_pct",
      "purchase_date", "maturity_date",
      DAYS_BETWEEN(CURRENT_DATE, "maturity_date")                              AS "days_to_maturity",
      "yield_rate", "rating", "status"
    FROM ${S}."I_Investment"
    ORDER BY
      CASE "status" WHEN 'ACTIVE' THEN 0 ELSE 1 END,
      "maturity_date" ASC`,

  debtService: `
    SELECT
      "debt_id", "bond_description", "bond_type",
      "original_principal", "outstanding_balance",
      ROUND("outstanding_balance" / NULLIF("original_principal", 0) * 100, 1) AS "pct_remaining",
      "interest_rate", "next_payment_date",
      DAYS_BETWEEN(CURRENT_DATE, "next_payment_date")                         AS "days_to_payment",
      "annual_payment", "maturity_year"
    FROM ${S}."I_DebtService"
    ORDER BY "next_payment_date" ASC`,

  taxTrend: `
    SELECT
      "tax_type",
      "period_label",
      "fiscal_year",
      "fiscal_month",
      ROUND("amount_collected", 2)                                             AS "amount_collected",
      ROUND("amount_budgeted", 2)                                              AS "amount_budgeted",
      ROUND(
        CASE WHEN "amount_budgeted" > 0
             THEN "amount_collected" / "amount_budgeted" * 100
             ELSE 0 END, 1)                                                    AS "pct_of_budget"
    FROM ${S}."I_TaxRevenue"
    ORDER BY "fiscal_year" ASC, "fiscal_month" ASC`,

  revenueByType: `
    SELECT
      "tax_type",
      ROUND(SUM("amount_collected"), 2)                                        AS "total_collected",
      ROUND(SUM("amount_budgeted"), 2)                                         AS "total_budgeted",
      ROUND(SUM("amount_collected") / NULLIF(SUM("amount_budgeted"), 0) * 100, 1) AS "pct_of_budget"
    FROM ${S}."I_TaxRevenue"
    WHERE "fiscal_year" = YEAR(CURRENT_DATE)
    GROUP BY "tax_type"
    ORDER BY "total_collected" DESC`,

  cashByType: `
    SELECT
      "account_type",
      COUNT(*)                                                                  AS "account_count",
      ROUND(SUM("balance"), 2)                                                 AS "total_balance"
    FROM ${S}."I_CashAccount"
    GROUP BY "account_type"
    ORDER BY "total_balance" DESC`,

  investmentsByType: `
    SELECT
      "investment_type",
      COUNT(*)                                                                  AS "count",
      ROUND(SUM("par_value"), 2)                                               AS "total_par",
      ROUND(SUM("current_value"), 2)                                           AS "total_market",
      ROUND(AVG("yield_rate"), 3)                                              AS "avg_yield"
    FROM ${S}."I_Investment"
    WHERE "status" = 'ACTIVE'
    GROUP BY "investment_type"
    ORDER BY "total_market" DESC`,
};
