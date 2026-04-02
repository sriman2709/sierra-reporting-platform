import { SCHEMA as S } from '../../connectors/hana.js';

export const Q = {
  all: `
    SELECT g."grant_id", g."grant_number", g."grant_title", g."grantor_agency",
           g."cfda_number", g."award_amount", g."award_start_date", g."award_end_date",
           g."award_status", g."reporting_frequency",
           p."program_name", f."fund_name", f."fund_type"
    FROM ${S}."I_GrantMaster" g
    LEFT JOIN ${S}."I_Program" p ON p."program_id" = g."program_id"
    LEFT JOIN ${S}."I_Fund"    f ON f."fund_id"    = g."fund_id"`,

  byId: `
    SELECT g.*, p."program_name", p."program_type", f."fund_name", f."fund_type"
    FROM ${S}."I_GrantMaster" g
    LEFT JOIN ${S}."I_Program" p ON p."program_id" = g."program_id"
    LEFT JOIN ${S}."I_Fund"    f ON f."fund_id"    = g."fund_id"
    WHERE g."grant_id" = ?`,

  compliance: `SELECT * FROM ${S}."V_GrantCompliance"`,

  lifecycle: `SELECT * FROM ${S}."V_GrantAwardLifecycle"`,

  burnRate: `
    SELECT
      g."grant_id", g."grant_number", g."grant_title", g."grantor_agency",
      g."cfda_number", g."award_amount", g."award_start_date", g."award_end_date",
      g."award_status",
      p."program_name",
      f."fund_name",
      f."expenditures_ytd"   AS "fund_expenditures",
      f."appropriation_amount" AS "fund_budget",
      f."encumbrance_amount" AS "fund_encumbrances",
      ROUND((f."expenditures_ytd" / NULLIF(f."appropriation_amount",0)) * 100, 1) AS "spend_pct",
      ROUND(
        DAYS_BETWEEN(g."award_start_date", CURRENT_DATE) * 100.0 /
        NULLIF(DAYS_BETWEEN(g."award_start_date", g."award_end_date"),0),
        1
      ) AS "time_elapsed_pct",
      CASE
        WHEN g."award_status" = 'CLOSED' THEN 'CLOSED'
        WHEN ROUND((f."expenditures_ytd" / NULLIF(f."appropriation_amount",0)) * 100, 1) >
             ROUND(DAYS_BETWEEN(g."award_start_date", CURRENT_DATE) * 100.0 /
             NULLIF(DAYS_BETWEEN(g."award_start_date", g."award_end_date"),0), 1) + 15
             THEN 'OVER_BURNING'
        WHEN ROUND((f."expenditures_ytd" / NULLIF(f."appropriation_amount",0)) * 100, 1) <
             ROUND(DAYS_BETWEEN(g."award_start_date", CURRENT_DATE) * 100.0 /
             NULLIF(DAYS_BETWEEN(g."award_start_date", g."award_end_date"),0), 1) - 20
             THEN 'UNDER_BURNING'
        ELSE 'ON_TRACK'
      END AS "burn_status"
    FROM ${S}."I_GrantMaster" g
    LEFT JOIN ${S}."I_Program" p ON p."program_id" = g."program_id"
    LEFT JOIN ${S}."I_Fund"    f ON f."fund_id"    = g."fund_id"
    ORDER BY "spend_pct" DESC`,

  kpis: `
    SELECT
      COUNT(*) AS "total_grants",
      SUM("award_amount") AS "total_award_amount",
      SUM(CASE WHEN "award_status"='ACTIVE' THEN 1 ELSE 0 END) AS "active_grants",
      SUM(CASE WHEN "award_status"='EXPIRING' THEN 1 ELSE 0 END) AS "expiring_grants"
    FROM ${S}."I_GrantMaster"`,
};
