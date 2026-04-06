import { SCHEMA as S } from '../../connectors/hana.js';

export const Q = {
  kpis: `
    SELECT
      COUNT(*)                                                                  AS "total_employees",
      SUM(CASE WHEN "employment_type" = 'FULL_TIME'   THEN 1 ELSE 0 END)      AS "full_time",
      SUM(CASE WHEN "employment_type" = 'PART_TIME'   THEN 1 ELSE 0 END)      AS "part_time",
      SUM(CASE WHEN "employment_type" = 'CONTRACTOR'  THEN 1 ELSE 0 END)      AS "contractors",
      SUM(CASE WHEN "emp_status" = 'ON_LEAVE'         THEN 1 ELSE 0 END)      AS "on_leave",
      ROUND(AVG("annual_salary"), 0)                                           AS "avg_salary",
      SUM("annual_salary")                                                     AS "total_salary_budget",
      SUM(CASE WHEN "is_grant_funded" = 1             THEN 1 ELSE 0 END)      AS "grant_funded_fte",
      (SELECT SUM("budgeted_fte") FROM ${S}."I_Position"
       WHERE "position_status" = 'ACTIVE')                                     AS "budgeted_fte",
      (SELECT SUM("filled_fte")  FROM ${S}."I_Position"
       WHERE "position_status" = 'ACTIVE')                                     AS "filled_fte",
      (SELECT ROUND((1 - SUM("filled_fte") / NULLIF(SUM("budgeted_fte"),0)) * 100, 1)
       FROM ${S}."I_Position" WHERE "position_status" = 'ACTIVE')              AS "vacancy_rate_pct"
    FROM ${S}."I_Employee"
    WHERE "emp_status" != 'TERMINATED'`,

  employees: `SELECT * FROM ${S}."V_WorkforceHealth" ORDER BY HEALTH_STATUS ASC, "department" ASC`,

  positions: `
    SELECT
      p."position_id", p."position_code", p."position_title",
      p."department", p."budgeted_fte", p."filled_fte",
      ROUND(p."budgeted_fte" - p."filled_fte", 1)               AS "vacancy_fte",
      p."salary_budget",
      ROUND(p."salary_budget" / NULLIF(p."budgeted_fte",0), 0)  AS "avg_budgeted_salary",
      p."fund_code", p."position_status",
      CASE
        WHEN p."filled_fte" = 0                        THEN 'VACANT'
        WHEN p."filled_fte" < p."budgeted_fte"         THEN 'PARTIALLY_FILLED'
        ELSE 'FULLY_STAFFED'
      END                                                        AS FILL_STATUS
    FROM ${S}."I_Position" p
    WHERE p."position_status" = 'ACTIVE'
    ORDER BY p."department", p."position_title"`,

  turnover: `
    SELECT
      "department",
      COUNT(*)                                                                  AS "employee_count",
      ROUND(AVG("annual_salary"), 0)                                           AS "avg_salary",
      ROUND(AVG(DAYS_BETWEEN("hire_date", CURRENT_DATE) / 365.0), 1)          AS "avg_tenure_years",
      SUM(CASE WHEN "emp_status" = 'ON_LEAVE'    THEN 1 ELSE 0 END)           AS "on_leave",
      SUM(CASE WHEN "is_grant_funded" = 1        THEN 1 ELSE 0 END)           AS "grant_funded",
      SUM("annual_salary")                                                     AS "dept_salary_total"
    FROM ${S}."I_Employee"
    WHERE "emp_status" != 'TERMINATED'
    GROUP BY "department"
    ORDER BY "dept_salary_total" DESC`,

  payroll: `
    SELECT
      pr."payroll_id", pr."pay_period_start", pr."pay_period_end",
      pr."gross_pay", pr."net_pay", pr."deductions",
      pr."fund_code", pr."department",
      e."employee_id", e."employee_number", e."full_name",
      e."position_title", e."employment_type"
    FROM ${S}."I_PayrollRecord" pr
    JOIN ${S}."I_Employee"      e ON e."employee_id" = pr."employee_id"
    WHERE pr."pay_period_start" >= ADD_MONTHS(CURRENT_DATE,-3)
    ORDER BY pr."pay_period_start" DESC, pr."department"`,

  fundAllocation: `
    SELECT
      pr."fund_code",
      pr."department",
      COUNT(DISTINCT pr."employee_id")                           AS "employee_count",
      ROUND(SUM(pr."gross_pay"), 2)                              AS "total_gross_pay",
      COUNT(DISTINCT pr."payroll_id")                            AS "payroll_runs",
      ROUND(AVG(pr."gross_pay"), 2)                              AS "avg_gross_pay"
    FROM ${S}."I_PayrollRecord" pr
    WHERE pr."pay_period_start" >= ADD_MONTHS(CURRENT_DATE,-12)
    GROUP BY pr."fund_code", pr."department"
    ORDER BY "total_gross_pay" DESC`,
};
