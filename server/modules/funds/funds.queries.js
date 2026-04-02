import { SCHEMA as S } from '../../connectors/hana.js';
export const Q = {
  all: `SELECT * FROM ${S}."I_Fund"`,
  balance: `SELECT * FROM ${S}."V_FundBalance"`,
  forecast: `SELECT * FROM ${S}."V_ForecastVariance"`,
  kpis: `
    SELECT
      COUNT(*) AS "total_funds",
      SUM("ending_balance") AS "total_balance",
      SUM("restricted_amount") AS "total_restricted",
      SUM("unassigned_amount") AS "total_unassigned"
    FROM ${S}."I_Fund"`,
};
