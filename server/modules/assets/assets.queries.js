import { SCHEMA as S } from '../../connectors/hana.js';

export const Q = {
  kpis: `
    SELECT
      COUNT(*)                                                            AS "total_assets",
      SUM("acquisition_cost")                                             AS "total_replacement_value",
      ROUND(SUM("current_value") / NULLIF(SUM("acquisition_cost"),0) * 100, 1) AS "avg_depreciation_pct",
      SUM(CASE WHEN "condition_rating" <= 2                THEN 1 ELSE 0 END) AS "critical_poor_assets",
      SUM(CASE WHEN "condition_rating" = 1                 THEN 1 ELSE 0 END) AS "critical_assets",
      SUM(CASE WHEN "asset_status" = 'UNDER_REPAIR'        THEN 1 ELSE 0 END) AS "under_repair",
      (SELECT COUNT(*) FROM ${S}."I_WorkOrder"
       WHERE "wo_status" IN ('OPEN','IN_PROGRESS'))                           AS "open_work_orders",
      (SELECT COUNT(*) FROM ${S}."I_WorkOrder"
       WHERE "wo_type" = 'EMERGENCY' AND "wo_status" != 'COMPLETED')          AS "emergency_work_orders",
      (SELECT COUNT(*) FROM ${S}."I_PMPlan"
       WHERE "next_due_date" < CURRENT_DATE AND "plan_status" = 'ACTIVE')     AS "overdue_pms",
      (SELECT SUM("total_cost") FROM ${S}."I_WorkOrder"
       WHERE "wo_status" = 'COMPLETED' AND "completed_date" >= ADD_MONTHS(CURRENT_DATE,-12)) AS "maintenance_cost_ytd"
    FROM ${S}."I_Asset"`,

  assets: `SELECT * FROM ${S}."V_AssetHealth" ORDER BY HEALTH_STATUS ASC, "condition_rating" ASC`,

  workOrders: `
    SELECT
      wo."work_order_id", wo."wo_number", wo."wo_type", wo."priority",
      wo."description", wo."reported_by", wo."assigned_to", wo."department",
      wo."reported_date", wo."scheduled_date", wo."completed_date",
      wo."labor_hours", wo."labor_cost", wo."parts_cost", wo."total_cost",
      wo."wo_status", wo."failure_type",
      a."asset_id", a."asset_name", a."asset_number", a."asset_type", a."location",
      DAYS_BETWEEN(wo."reported_date", COALESCE(wo."completed_date", CURRENT_DATE)) AS AGE_DAYS
    FROM ${S}."I_WorkOrder" wo
    JOIN ${S}."I_Asset" a ON a."asset_id" = wo."asset_id"
    ORDER BY
      CASE wo."priority" WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END,
      CASE wo."wo_status" WHEN 'IN_PROGRESS' THEN 1 WHEN 'OPEN' THEN 2 WHEN 'ON_HOLD' THEN 3 ELSE 4 END,
      wo."reported_date" DESC`,

  pmPlans: `
    SELECT
      pm."plan_id", pm."plan_name", pm."frequency", pm."last_performed_date",
      pm."next_due_date", pm."estimated_hours", pm."estimated_cost",
      pm."assigned_to", pm."task_description", pm."plan_status", pm."compliance_required",
      a."asset_id", a."asset_name", a."asset_number", a."asset_type",
      a."department", a."location",
      DAYS_BETWEEN(pm."next_due_date", CURRENT_DATE) AS DAYS_OVERDUE,
      CASE
        WHEN pm."next_due_date" < CURRENT_DATE THEN 'OVERDUE'
        WHEN DAYS_BETWEEN(CURRENT_DATE, pm."next_due_date") <= 14 THEN 'DUE_SOON'
        ELSE 'ON_SCHEDULE'
      END AS PM_STATUS
    FROM ${S}."I_PMPlan" pm
    JOIN ${S}."I_Asset" a ON a."asset_id" = pm."asset_id"
    WHERE pm."plan_status" = 'ACTIVE'
    ORDER BY pm."next_due_date" ASC`,

  failures: `
    SELECT
      fe."failure_id", fe."failure_date", fe."failure_type", fe."failure_description",
      fe."downtime_hours", fe."repair_cost", fe."root_cause",
      fe."is_recurring", fe."prevented_by_pm",
      a."asset_id", a."asset_name", a."asset_number", a."asset_type", a."department",
      wo."wo_number", wo."total_cost" AS wo_cost
    FROM ${S}."I_FailureEvent" fe
    JOIN ${S}."I_Asset" a  ON a."asset_id"       = fe."asset_id"
    LEFT JOIN ${S}."I_WorkOrder" wo ON wo."work_order_id" = fe."work_order_id"
    ORDER BY fe."failure_date" DESC`,

  costByType: `
    SELECT
      a."asset_type",
      COUNT(DISTINCT a."asset_id")               AS "asset_count",
      SUM(wo."total_cost")                        AS "total_maint_cost",
      ROUND(AVG(wo."total_cost"),2)               AS "avg_wo_cost",
      COUNT(wo."work_order_id")                   AS "wo_count",
      SUM(CASE WHEN wo."wo_type" = 'EMERGENCY' THEN wo."total_cost" ELSE 0 END) AS "emergency_cost"
    FROM ${S}."I_Asset" a
    LEFT JOIN ${S}."I_WorkOrder" wo ON wo."asset_id" = a."asset_id"
    GROUP BY a."asset_type"
    ORDER BY "total_maint_cost" DESC NULLS LAST`,
};
