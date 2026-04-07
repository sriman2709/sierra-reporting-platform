import { SCHEMA as S } from '../../connectors/hana.js';

export const Q = {

  // ── Cross-domain executive scorecard ──────────────────────────────────────
  crossDomainKPIs: `
    SELECT
      /* Grants */
      (SELECT COUNT(*)
         FROM ${S}."I_GrantMaster"
        WHERE "grant_status" = 'ACTIVE')                                       AS "active_grants",
      (SELECT ROUND(SUM("award_amount"), 2)
         FROM ${S}."I_GrantMaster"
        WHERE "grant_status" = 'ACTIVE')                                       AS "total_grant_awards",

      /* Procurement */
      (SELECT COUNT(*)
         FROM ${S}."I_PurchaseOrder"
        WHERE "po_status" = 'OPEN')                                            AS "open_pos",
      (SELECT ROUND(SUM("invoice_amount"), 2)
         FROM ${S}."I_Invoice"
        WHERE "payment_status" = 'PENDING')                                    AS "pending_invoice_value",

      /* Capital Projects */
      (SELECT COUNT(*)
         FROM ${S}."I_CapitalProject"
        WHERE "project_status" = 'IN_PROGRESS')                               AS "active_projects",
      (SELECT ROUND(SUM("actual_cost"), 2)
         FROM ${S}."I_CapitalProject")                                         AS "capital_spend_ytd",

      /* Assets */
      (SELECT COUNT(*)
         FROM ${S}."I_Asset"
        WHERE "asset_status" = 'ACTIVE')                                       AS "total_assets",
      (SELECT COUNT(*)
         FROM ${S}."I_WorkOrder"
        WHERE "wo_status" = 'OPEN')                                            AS "open_work_orders",

      /* HR */
      (SELECT COUNT(*)
         FROM ${S}."I_Employee"
        WHERE "employment_status" = 'ACTIVE')                                  AS "active_employees",
      (SELECT COUNT(*)
         FROM ${S}."I_Position"
        WHERE "position_status" = 'VACANT')                                    AS "open_positions",

      /* Fleet */
      (SELECT COUNT(*)
         FROM ${S}."I_Vehicle"
        WHERE "vehicle_status" = 'ACTIVE')                                     AS "active_vehicles",
      (SELECT COUNT(*)
         FROM ${S}."I_Vehicle"
        WHERE "vehicle_status" = 'OUT_OF_SERVICE')                             AS "vehicles_oos",

      /* Inventory */
      (SELECT COUNT(*)
         FROM ${S}."I_InventoryItem"
        WHERE "quantity_on_hand" <= "reorder_point")                           AS "low_stock_items",

      /* Finance */
      (SELECT ROUND(SUM("actual_amount"), 2)
         FROM ${S}."I_BudgetLine"
        WHERE "fiscal_year" = YEAR(CURRENT_DATE))                              AS "total_expenditures_ytd",

      /* Treasury */
      (SELECT ROUND(SUM("balance"), 2)
         FROM ${S}."I_CashAccount")                                            AS "total_cash_position",
      (SELECT ROUND(SUM("amount_collected"), 2)
         FROM ${S}."I_TaxRevenue"
        WHERE "fiscal_year" = YEAR(CURRENT_DATE))                              AS "tax_revenue_ytd"

    FROM DUMMY`,

  // ── Alerts & exceptions ──────────────────────────────────────────────────
  alerts: `
    SELECT
      "alert_id", "domain", "severity", "title",
      "description", "created_date", "status", "assigned_to"
    FROM ${S}."I_ExecutiveAlert"
    WHERE "status" IN ('OPEN', 'ACKNOWLEDGED')
    ORDER BY
      CASE "severity" WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
      "created_date" DESC`,

  // ── KPI benchmarks (city-level) ──────────────────────────────────────────
  benchmarks: `
    SELECT
      "benchmark_id", "domain", "kpi_name",
      "current_value", "target_value", "peer_avg",
      "unit", "trend", "period"
    FROM ${S}."I_KPIBenchmark"
    ORDER BY "domain" ASC, "kpi_name" ASC`,

  // ── Multi-period grant spend trend (last 6 months) ────────────────────────
  grantTrend: `
    SELECT
      TO_VARCHAR("expenditure_date", 'YYYY-MM')                               AS "period",
      ROUND(SUM("expenditure_amount"), 2)                                     AS "grant_spend"
    FROM ${S}."I_Document"
    WHERE "doc_type" = 'EXPENDITURE'
      AND "expenditure_date" >= ADD_MONTHS(CURRENT_DATE, -6)
    GROUP BY TO_VARCHAR("expenditure_date", 'YYYY-MM')
    ORDER BY "period" ASC`,

  // ── Domain risk summary ──────────────────────────────────────────────────
  domainRisk: `
    SELECT
      "domain",
      COUNT(*)                                                                  AS "total_alerts",
      SUM(CASE WHEN "severity" = 'HIGH'   THEN 1 ELSE 0 END)                  AS "high_count",
      SUM(CASE WHEN "severity" = 'MEDIUM' THEN 1 ELSE 0 END)                  AS "medium_count",
      SUM(CASE WHEN "severity" = 'LOW'    THEN 1 ELSE 0 END)                  AS "low_count"
    FROM ${S}."I_ExecutiveAlert"
    WHERE "status" IN ('OPEN', 'ACKNOWLEDGED')
    GROUP BY "domain"
    ORDER BY "high_count" DESC, "total_alerts" DESC`,

  // ── Budget vs actual by dept (Finance) ──────────────────────────────────
  budgetActual: `
    SELECT
      "department",
      ROUND(SUM("budget_amount"), 2)                                          AS "total_budget",
      ROUND(SUM("actual_amount"), 2)                                          AS "total_actual",
      ROUND(SUM("budget_amount") - SUM("actual_amount"), 2)                   AS "variance",
      ROUND(SUM("actual_amount") / NULLIF(SUM("budget_amount"), 0) * 100, 1)  AS "utilization_pct"
    FROM ${S}."I_BudgetLine"
    WHERE "fiscal_year" = YEAR(CURRENT_DATE)
    GROUP BY "department"
    ORDER BY "utilization_pct" DESC`,
};
