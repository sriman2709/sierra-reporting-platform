import { SCHEMA as S } from '../../connectors/hana.js';

export const Q = {
  kpis: `
    SELECT
      COUNT(*)                                                        AS "total_projects",
      SUM("total_budget")                                             AS "total_cip_budget",
      SUM("spent_to_date")                                            AS "total_spent",
      SUM("encumbrances")                                             AS "total_encumbrances",
      SUM("total_budget") - SUM("spent_to_date") - SUM("encumbrances") AS "total_remaining",
      ROUND(SUM("spent_to_date") / NULLIF(SUM("total_budget"),0) * 100, 1) AS "overall_spend_pct",
      SUM(CASE WHEN "project_status" = 'ACTIVE'    THEN 1 ELSE 0 END) AS "active_projects",
      SUM(CASE WHEN "project_status" = 'ON_HOLD'   THEN 1 ELSE 0 END) AS "on_hold_projects",
      SUM(CASE WHEN "project_status" = 'COMPLETED' THEN 1 ELSE 0 END) AS "completed_projects",
      (SELECT COUNT(*) FROM ${S}."V_ProjectHealth" WHERE HEALTH_STATUS = 'RED')    AS "red_projects",
      (SELECT COUNT(*) FROM ${S}."V_ProjectHealth" WHERE HEALTH_STATUS = 'YELLOW') AS "yellow_projects",
      (SELECT COUNT(*) FROM ${S}."V_ProjectHealth" WHERE HEALTH_STATUS = 'GREEN')  AS "green_projects",
      (SELECT COUNT(*) FROM ${S}."I_ChangeOrder" WHERE "status" = 'PENDING')       AS "pending_change_orders",
      (SELECT SUM("cost_impact") FROM ${S}."I_ChangeOrder" WHERE "status" = 'APPROVED') AS "approved_co_impact"
    FROM ${S}."I_CapitalProject"`,

  projects: `SELECT * FROM ${S}."V_ProjectHealth" ORDER BY HEALTH_STATUS ASC, "total_budget" DESC`,

  milestones: `
    SELECT
      m."milestone_id", m."milestone_name", m."milestone_type",
      m."planned_date", m."actual_date", m."status", m."completion_pct",
      m."responsible_party", m."notes",
      p."project_id", p."project_name", p."project_number", p."project_type", p."department"
    FROM ${S}."I_Milestone" m
    JOIN ${S}."I_CapitalProject" p ON p."project_id" = m."project_id"
    ORDER BY
      CASE m."status"
        WHEN 'AT_RISK'     THEN 1
        WHEN 'IN_PROGRESS' THEN 2
        WHEN 'NOT_STARTED' THEN 3
        WHEN 'COMPLETED'   THEN 4
        ELSE 5
      END,
      m."planned_date" ASC`,

  changeOrders: `
    SELECT
      co."change_order_id", co."co_number", co."description", co."reason",
      co."cost_impact", co."schedule_impact_days",
      co."approved_by", co."approved_date", co."submitted_date", co."status",
      p."project_id", p."project_name", p."project_number", p."project_type"
    FROM ${S}."I_ChangeOrder" co
    JOIN ${S}."I_CapitalProject" p ON p."project_id" = co."project_id"
    ORDER BY
      CASE co."status" WHEN 'PENDING' THEN 1 WHEN 'APPROVED' THEN 2 ELSE 3 END,
      co."submitted_date" DESC`,

  funding: `
    SELECT
      pf."funding_id", pf."project_id", pf."source_type", pf."source_name",
      pf."allocated_amount", pf."drawn_amount",
      ROUND(pf."drawn_amount" / NULLIF(pf."allocated_amount",0) * 100, 1) AS DRAW_PCT,
      pf."allocated_amount" - pf."drawn_amount" AS UNDRAWN_AMOUNT,
      p."project_name", p."project_number", p."project_type", p."department",
      f."fund_name"
    FROM ${S}."I_ProjectFunding" pf
    JOIN ${S}."I_CapitalProject" p ON p."project_id" = pf."project_id"
    LEFT JOIN ${S}."I_Fund" f ON f."fund_id" = pf."fund_id"
    ORDER BY pf."allocated_amount" DESC`,

  cipSummary: `SELECT * FROM ${S}."V_CIPSummary" ORDER BY "TOTAL_BUDGET" DESC`,
};
