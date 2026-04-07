import { SCHEMA as S } from '../../connectors/hana.js';

export const Q = {

  // ── Cross-domain executive scorecard ──────────────────────────────────────
  // Column names verified against each module's queries:
  //   I_GrantMaster  : award_status, award_amount
  //   I_PurchaseOrder: po_status='OPEN'
  //   I_Invoice      : invoice_status IN ('PENDING','OVERDUE'), amount
  //   I_CapitalProject: project_status='ACTIVE', actual_cost → use revised_budget from I_BudgetLine
  //   I_Asset        : asset_status='ACTIVE'
  //   I_WorkOrder    : wo_status='OPEN'
  //   I_Employee     : emp_status (not 'TERMINATED')
  //   I_Position     : position_status='VACANT'
  //   I_Vehicle      : vehicle_status
  //   I_InventoryItem: quantity_on_hand, reorder_point
  //   I_BudgetLine   : revised_budget, actuals, fiscal_year
  crossDomainKPIs: `
    SELECT
      /* Grants */
      (SELECT COUNT(*)
         FROM ${S}."I_GrantMaster"
        WHERE "award_status" = 'ACTIVE')                                       AS "active_grants",
      (SELECT ROUND(SUM("award_amount"), 2)
         FROM ${S}."I_GrantMaster"
        WHERE "award_status" = 'ACTIVE')                                       AS "total_grant_awards",

      /* Procurement */
      (SELECT COUNT(*)
         FROM ${S}."I_PurchaseOrder"
        WHERE "po_status" = 'OPEN')                                            AS "open_pos",
      (SELECT ROUND(SUM("amount"), 2)
         FROM ${S}."I_Invoice"
        WHERE "invoice_status" IN ('PENDING','OVERDUE'))                       AS "pending_invoice_value",

      /* Capital Projects */
      (SELECT COUNT(*)
         FROM ${S}."I_CapitalProject"
        WHERE "project_status" = 'ACTIVE')                                     AS "active_projects",
      (SELECT ROUND(SUM("spent_to_date"), 2)
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
        WHERE "emp_status" != 'TERMINATED')                                    AS "active_employees",
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
        WHERE "current_stock" <= "reorder_point")                              AS "low_stock_items",

      /* Finance — use actuals from BudgetLine (fiscal_year stored as 'FY2026') */
      (SELECT ROUND(SUM("actuals"), 2)
         FROM ${S}."I_BudgetLine"
        WHERE "fiscal_year" = CONCAT('FY', TO_VARCHAR(YEAR(CURRENT_DATE))))   AS "total_expenditures_ytd",

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

  // ── Multi-period grant spend trend — derived from I_BudgetLine actuals ─────
  // Shows actuals per fiscal year for the last 2 years as a simplified trend
  grantTrend: `
    SELECT
      "fiscal_year"                                                             AS "period",
      ROUND(SUM("actuals"), 2)                                                 AS "grant_spend"
    FROM ${S}."I_BudgetLine"
    WHERE "fiscal_year" IN (
      CONCAT('FY', TO_VARCHAR(YEAR(CURRENT_DATE))),
      CONCAT('FY', TO_VARCHAR(YEAR(CURRENT_DATE) - 1)),
      CONCAT('FY', TO_VARCHAR(YEAR(CURRENT_DATE) - 2))
    )
    GROUP BY "fiscal_year"
    ORDER BY "fiscal_year" ASC`,

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

  // ── Budget vs actual by dept — using verified column names ───────────────
  budgetActual: `
    SELECT
      "department",
      ROUND(SUM("revised_budget"), 2)                                         AS "total_budget",
      ROUND(SUM("actuals"), 2)                                                AS "total_actual",
      ROUND(SUM("revised_budget") - SUM("actuals"), 2)                        AS "variance",
      ROUND(SUM("actuals") / NULLIF(SUM("revised_budget"), 0) * 100, 1)       AS "utilization_pct"
    FROM ${S}."I_BudgetLine"
    GROUP BY "department"
    ORDER BY "utilization_pct" DESC`,
};
