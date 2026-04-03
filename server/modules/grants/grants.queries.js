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
      f."expenditures_ytd"     AS "fund_expenditures",
      f."appropriation_amount" AS "fund_budget",
      f."encumbrance_amount"   AS "fund_encumbrances",
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

  // ── Sprint 4: Compliance Posture Score ───────────────────────────────────
  // Scores each grant 0-100 across 5 dimensions:
  //   Document coverage (25pts), Approval completeness (20pts),
  //   Evidence coverage (20pts), Open findings penalty (-15 per HIGH, -8 per other),
  //   Subrecipient monitoring (15pts), Indirect cost compliance (10pts)
  compliancePosture: `
    WITH findings AS (
      SELECT
        "grant_id",
        COUNT(*) AS total_findings,
        SUM(CASE WHEN "severity" = 'HIGH'   THEN 1 ELSE 0 END) AS high_findings,
        SUM(CASE WHEN "severity" = 'MEDIUM' THEN 1 ELSE 0 END) AS medium_findings,
        SUM(CASE WHEN "status" IN ('OPEN','IN_PROGRESS') THEN 1 ELSE 0 END) AS open_findings
      FROM ${S}."I_CorrectiveAction"
      GROUP BY "grant_id"
    ),
    monitoring AS (
      SELECT
        "grant_id",
        COUNT(*) AS monitoring_count,
        SUM(CASE WHEN "monitoring_status" = 'HIGH_RISK' THEN 1 ELSE 0 END) AS high_risk_count,
        SUM(CASE WHEN "monitoring_status" = 'COMPLIANT' THEN 1 ELSE 0 END) AS compliant_count
      FROM ${S}."I_SubrecipientMonitoring"
      GROUP BY "grant_id"
    ),
    allowability AS (
      SELECT
        "grant_id",
        COUNT(*) AS rule_count,
        SUM(CASE WHEN "is_allowable" = 1 THEN 1 ELSE 0 END) AS allowed_count
      FROM ${S}."I_AllowabilityRule"
      GROUP BY "grant_id"
    )
    SELECT
      g."grant_id",
      g."grant_number",
      g."grant_title",
      g."grantor_agency",
      g."cfda_number",
      g."award_amount",
      g."award_status",
      g."indirect_cost_rate",
      g."match_required_pct",
      g."reporting_frequency",
      vc.DOCUMENT_COUNT,
      vc.APPROVAL_COUNT,
      vc.EVIDENCE_COUNT,
      vc.SUBAWARD_COUNT,
      vc.COMPLIANCE_STATUS,
      COALESCE(f.total_findings, 0)  AS total_findings,
      COALESCE(f.high_findings,  0)  AS high_findings,
      COALESCE(f.open_findings,  0)  AS open_findings,
      COALESCE(m.monitoring_count, 0) AS monitoring_count,
      COALESCE(m.high_risk_count,  0) AS high_risk_count,
      COALESCE(m.compliant_count,  0) AS compliant_count,
      COALESCE(a.rule_count,    0)   AS rule_count,
      COALESCE(a.allowed_count, 0)   AS allowed_count,
      -- Posture score (0-100)
      GREATEST(0, LEAST(100,
        -- Document coverage: up to 25pts (5pts per doc, cap at 5 docs)
        LEAST(25, COALESCE(vc.DOCUMENT_COUNT, 0) * 5)
        -- Approval completeness: up to 20pts
        + LEAST(20, COALESCE(vc.APPROVAL_COUNT, 0) * 5)
        -- Evidence coverage: up to 20pts
        + LEAST(20, COALESCE(vc.EVIDENCE_COUNT, 0) * 4)
        -- Open findings penalty
        - (COALESCE(f.high_findings, 0) * 15)
        - (COALESCE(f.open_findings, 0) - COALESCE(f.high_findings, 0)) * 8
        -- Monitoring: up to 15pts (5pts each, max 3)
        + LEAST(15, COALESCE(m.compliant_count, 0) * 5)
        -- High-risk subrecipients penalty
        - (COALESCE(m.high_risk_count, 0) * 10)
        -- Base 20pts for having any allowability rules reviewed
        + CASE WHEN COALESCE(a.rule_count, 0) > 0 THEN 20 ELSE 0 END
      )) AS posture_score,
      -- Risk tier
      CASE
        WHEN GREATEST(0, LEAST(100,
          LEAST(25, COALESCE(vc.DOCUMENT_COUNT, 0) * 5)
          + LEAST(20, COALESCE(vc.APPROVAL_COUNT, 0) * 5)
          + LEAST(20, COALESCE(vc.EVIDENCE_COUNT, 0) * 4)
          - (COALESCE(f.high_findings, 0) * 15)
          - (COALESCE(f.open_findings, 0) - COALESCE(f.high_findings, 0)) * 8
          + LEAST(15, COALESCE(m.compliant_count, 0) * 5)
          - (COALESCE(m.high_risk_count, 0) * 10)
          + CASE WHEN COALESCE(a.rule_count, 0) > 0 THEN 20 ELSE 0 END
        )) >= 80 THEN 'STRONG'
        WHEN GREATEST(0, LEAST(100,
          LEAST(25, COALESCE(vc.DOCUMENT_COUNT, 0) * 5)
          + LEAST(20, COALESCE(vc.APPROVAL_COUNT, 0) * 5)
          + LEAST(20, COALESCE(vc.EVIDENCE_COUNT, 0) * 4)
          - (COALESCE(f.high_findings, 0) * 15)
          - (COALESCE(f.open_findings, 0) - COALESCE(f.high_findings, 0)) * 8
          + LEAST(15, COALESCE(m.compliant_count, 0) * 5)
          - (COALESCE(m.high_risk_count, 0) * 10)
          + CASE WHEN COALESCE(a.rule_count, 0) > 0 THEN 20 ELSE 0 END
        )) >= 60 THEN 'ADEQUATE'
        WHEN GREATEST(0, LEAST(100,
          LEAST(25, COALESCE(vc.DOCUMENT_COUNT, 0) * 5)
          + LEAST(20, COALESCE(vc.APPROVAL_COUNT, 0) * 5)
          + LEAST(20, COALESCE(vc.EVIDENCE_COUNT, 0) * 4)
          - (COALESCE(f.high_findings, 0) * 15)
          - (COALESCE(f.open_findings, 0) - COALESCE(f.high_findings, 0)) * 8
          + LEAST(15, COALESCE(m.compliant_count, 0) * 5)
          - (COALESCE(m.high_risk_count, 0) * 10)
          + CASE WHEN COALESCE(a.rule_count, 0) > 0 THEN 20 ELSE 0 END
        )) >= 40 THEN 'NEEDS_IMPROVEMENT'
        ELSE 'AT_RISK'
      END AS risk_tier
    FROM ${S}."I_GrantMaster" g
    LEFT JOIN ${S}."V_GrantCompliance"         vc ON vc."grant_id" = g."grant_id"
    LEFT JOIN findings                          f  ON f."grant_id"  = g."grant_id"
    LEFT JOIN monitoring                        m  ON m."grant_id"  = g."grant_id"
    LEFT JOIN allowability                      a  ON a."grant_id"  = g."grant_id"
    ORDER BY posture_score ASC`,

  // ── Sprint 4: Allowability Rules ─────────────────────────────────────────
  allowability: `
    SELECT
      ar."rule_id", ar."grant_id", ar."cost_category", ar."cost_type",
      ar."cfr_citation", ar."is_allowable", ar."conditions", ar."notes",
      g."grant_number", g."grant_title", g."cfda_number"
    FROM ${S}."I_AllowabilityRule" ar
    JOIN ${S}."I_GrantMaster" g ON g."grant_id" = ar."grant_id"
    ORDER BY g."grant_number", ar."cost_category"`,

  // ── Sprint 4: Subrecipient Risk Matrix ────────────────────────────────────
  subrecipientRisk: `
    SELECT
      sm."monitoring_id", sm."grant_id", sm."subrecipient_id",
      sm."monitoring_date", sm."monitoring_type", sm."monitoring_status",
      sm."findings_count", sm."corrective_actions_required",
      sm."next_monitoring_date", sm."monitored_by",
      g."grant_number", g."grant_title", g."cfda_number",
      s."organization_name" AS subrecipient_name,
      s."ffata_reportable", s."award_amount" AS sub_award_amount
    FROM ${S}."I_SubrecipientMonitoring" sm
    JOIN ${S}."I_GrantMaster" g ON g."grant_id" = sm."grant_id"
    LEFT JOIN ${S}."I_Subaward" s ON s."subaward_id" = sm."subrecipient_id"
    ORDER BY sm."monitoring_status" DESC, sm."next_monitoring_date" ASC`,

  kpis: `
    SELECT
      COUNT(*) AS "total_grants",
      SUM("award_amount") AS "total_award_amount",
      SUM(CASE WHEN "award_status"='ACTIVE'   THEN 1 ELSE 0 END) AS "active_grants",
      SUM(CASE WHEN "award_status"='EXPIRING' THEN 1 ELSE 0 END) AS "expiring_grants"
    FROM ${S}."I_GrantMaster"`,
};
