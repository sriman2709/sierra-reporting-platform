import { SCHEMA as S } from '../../connectors/hana.js';

export const Q = {
  pipeline: `SELECT * FROM ${S}."V_ProcurementPipeline" ORDER BY "po_date" DESC`,

  contracts: `SELECT * FROM ${S}."V_ContractUtilization" ORDER BY DAYS_TO_EXPIRY ASC`,

  apAging: `SELECT * FROM ${S}."V_APAging" ORDER BY "aging_days" DESC`,

  vendors: `SELECT * FROM ${S}."I_Vendor" ORDER BY "risk_score" DESC`,

  kpis: `
    SELECT
      COUNT(DISTINCT c."contract_id") AS "total_contracts",
      SUM(c."original_amount") AS "total_contract_value",
      SUM(CASE WHEN c."contract_status" = 'EXPIRING' THEN 1 ELSE 0 END) AS "expiring_contracts",
      SUM(CASE WHEN c."contract_status" = 'SUSPENDED' THEN 1 ELSE 0 END) AS "suspended_contracts",
      (SELECT COUNT(*) FROM ${S}."I_Invoice" WHERE "invoice_status" = 'OVERDUE') AS "overdue_invoices",
      (SELECT SUM("amount") FROM ${S}."I_Invoice" WHERE "invoice_status" IN ('PENDING','OVERDUE')) AS "ap_backlog",
      (SELECT COUNT(*) FROM ${S}."I_Vendor" WHERE "debarment_status" = 'FLAGGED') AS "flagged_vendors",
      (SELECT AVG("req_to_po_days") FROM ${S}."I_PurchaseOrder") AS "avg_cycle_days"
    FROM ${S}."I_Contract" c`,
};
