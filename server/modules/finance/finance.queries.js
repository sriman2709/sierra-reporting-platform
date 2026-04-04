import { SCHEMA as S } from '../../connectors/hana.js';

export const Q = {
  budgetVariance: `SELECT * FROM ${S}."V_BudgetVariance" ORDER BY SPEND_PCT DESC`,

  closeReadiness: `SELECT * FROM ${S}."V_CloseReadiness" ORDER BY "due_date" ASC`,

  journals: `SELECT * FROM ${S}."I_JournalEntry" ORDER BY "entry_date" DESC`,

  interfund: `SELECT * FROM ${S}."I_InterfundTransfer" ORDER BY "transfer_date" DESC`,

  kpis: `
    SELECT
      SUM("revised_budget") AS "total_budget",
      SUM("actuals") AS "total_actuals",
      SUM("encumbrances") AS "total_encumbrances",
      SUM("revised_budget" - "encumbrances" - "actuals") AS "total_available",
      SUM(CASE WHEN "actuals" > "revised_budget" THEN 1 ELSE 0 END) AS "overrun_lines",
      (SELECT COUNT(*) FROM ${S}."I_JournalEntry" WHERE "entry_status" IN ('EXCEPTION','PENDING')) AS "journal_exceptions",
      (SELECT COUNT(*) FROM ${S}."I_CloseTask" WHERE "task_status" = 'OVERDUE') AS "overdue_tasks",
      (SELECT ROUND(SUM(CASE WHEN "task_status"='COMPLETE' THEN 1 ELSE 0 END)*100.0/COUNT(*),1) FROM ${S}."I_CloseTask") AS "close_pct"
    FROM ${S}."I_BudgetLine"`,
};
