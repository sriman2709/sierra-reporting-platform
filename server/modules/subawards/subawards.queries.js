import { SCHEMA as S } from '../../connectors/hana.js';
export const Q = {
  all: `SELECT * FROM ${S}."V_SubawardTransparency"`,
  byGrant: (id) => `SELECT * FROM ${S}."V_SubawardTransparency" WHERE PRIME_GRANT_ID = '${id}'`,
  subrecipients: `SELECT * FROM ${S}."I_Subrecipient" ORDER BY CAST("risk_score" AS INTEGER) DESC`,
  monitoring: `
    SELECT m.*, sr."subrecipient_name"
    FROM ${S}."I_SubrecipientMonitoring" m
    JOIN ${S}."I_Subrecipient" sr ON sr."subrecipient_id" = m."subrecipient_id"`,
  corrective: `
    SELECT ca.*, sr."subrecipient_name", g."grant_number"
    FROM ${S}."I_CorrectiveAction" ca
    LEFT JOIN ${S}."I_Subrecipient" sr ON sr."subrecipient_id" = ca."subrecipient_id"
    LEFT JOIN ${S}."I_GrantMaster"  g  ON g."grant_id"         = ca."grant_id"`,
  kpis: `
    SELECT
      COUNT(*) AS "total_subawards",
      SUM("subaward_amount") AS "total_subaward_amount",
      SUM(CASE WHEN FFATA_REPORTABLE='Y' THEN 1 ELSE 0 END) AS "ffata_reportable",
      SUM(CASE WHEN "subaward_status"='ACTIVE' THEN 1 ELSE 0 END) AS "active_subawards"
    FROM ${S}."V_SubawardTransparency"`,
};
