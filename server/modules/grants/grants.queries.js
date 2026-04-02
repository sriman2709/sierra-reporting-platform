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

  kpis: `
    SELECT
      COUNT(*) AS "total_grants",
      SUM("award_amount") AS "total_award_amount",
      SUM(CASE WHEN "award_status"='ACTIVE' THEN 1 ELSE 0 END) AS "active_grants",
      SUM(CASE WHEN "award_status"='EXPIRING' THEN 1 ELSE 0 END) AS "expiring_grants"
    FROM ${S}."I_GrantMaster"`,
};
