import { SCHEMA as S } from '../../connectors/hana.js';
export const Q = {
  scorecard: `SELECT * FROM ${S}."V_OutcomeScorecard"`,
  metrics:   `SELECT m.*, p."program_name" FROM ${S}."I_OutcomeMetric" m LEFT JOIN ${S}."I_Program" p ON p."program_id"=m."program_id"`,
  actuals:   `SELECT a.*, m."metric_name", m."unit_of_measure" FROM ${S}."I_OutcomeActual" a LEFT JOIN ${S}."I_OutcomeMetric" m ON m."metric_id"=a."metric_id" ORDER BY a."measurement_date" DESC`,
  programs:  `SELECT * FROM ${S}."I_Program"`,
  cost:      `SELECT c.*, p."program_name" FROM ${S}."I_CostToServeUnit" c LEFT JOIN ${S}."I_Program" p ON p."program_id"=c."program_id"`,

  // ── Sprint 5: Program Effectiveness Score ────────────────────────────────
  effectiveness: `
    WITH actuals_summary AS (
      SELECT
        m."program_id",
        COUNT(DISTINCT a."metric_id")                                          AS metrics_with_actuals,
        COUNT(a."actual_id")                                                   AS total_actuals,
        SUM(CASE WHEN a."performance_status"='ON_TRACK'  THEN 1 ELSE 0 END)   AS on_track_count,
        SUM(CASE WHEN a."performance_status"='AT_RISK'   THEN 1 ELSE 0 END)   AS at_risk_count,
        SUM(CASE WHEN a."performance_status"='OFF_TRACK' THEN 1 ELSE 0 END)   AS off_track_count
      FROM ${S}."I_OutcomeActual" a
      JOIN ${S}."I_OutcomeMetric" m ON m."metric_id" = a."metric_id"
      GROUP BY m."program_id"
    ),
    key_metrics AS (
      SELECT "program_id", COUNT(*) AS key_indicator_count
      FROM ${S}."I_OutcomeMetric" WHERE "is_key_indicator"='Y'
      GROUP BY "program_id"
    ),
    cost_summary AS (
      SELECT "program_id",
        AVG("cost_per_unit") AS avg_cost_per_unit,
        SUM("total_cost")    AS total_cost,
        SUM("units_delivered") AS total_units
      FROM ${S}."I_CostToServeUnit" GROUP BY "program_id"
    ),
    peer_avg AS (
      SELECT AVG("cost_per_unit") AS peer_avg_cpu FROM ${S}."I_CostToServeUnit"
    )
    SELECT
      p."program_id", p."program_name", p."program_type", p."department",
      p."fiscal_year", p."budget_amount", p."status",
      COALESCE(a.total_actuals,        0) AS total_actuals,
      COALESCE(a.metrics_with_actuals, 0) AS metrics_with_actuals,
      COALESCE(a.on_track_count,       0) AS on_track_count,
      COALESCE(a.at_risk_count,        0) AS at_risk_count,
      COALESCE(a.off_track_count,      0) AS off_track_count,
      COALESCE(km.key_indicator_count, 0) AS key_indicators,
      ROUND(c.avg_cost_per_unit, 2)       AS avg_cost_per_unit,
      ROUND(c.total_cost, 0)              AS total_cost,
      COALESCE(c.total_units, 0)          AS total_units,
      ROUND(pa.peer_avg_cpu, 2)           AS peer_avg_cpu,
      GREATEST(0, LEAST(100,
        CASE WHEN COALESCE(a.total_actuals,0)=0 THEN 0
          ELSE ROUND((COALESCE(a.on_track_count,0)*60.0)/NULLIF(a.total_actuals,0),1)
        END
        + CASE
            WHEN c.avg_cost_per_unit IS NULL OR pa.peer_avg_cpu IS NULL OR pa.peer_avg_cpu=0 THEN 12
            WHEN c.avg_cost_per_unit <= pa.peer_avg_cpu       THEN 25
            WHEN c.avg_cost_per_unit <= pa.peer_avg_cpu*1.5   THEN 15
            WHEN c.avg_cost_per_unit <= pa.peer_avg_cpu*2.0   THEN 5
            ELSE 0
          END
        + LEAST(15, COALESCE(a.metrics_with_actuals,0)*3)
      )) AS effectiveness_score,
      CASE
        WHEN GREATEST(0,LEAST(100,
          CASE WHEN COALESCE(a.total_actuals,0)=0 THEN 0
            ELSE ROUND((COALESCE(a.on_track_count,0)*60.0)/NULLIF(a.total_actuals,0),1) END
          + CASE WHEN c.avg_cost_per_unit IS NULL OR pa.peer_avg_cpu IS NULL OR pa.peer_avg_cpu=0 THEN 12
              WHEN c.avg_cost_per_unit<=pa.peer_avg_cpu THEN 25
              WHEN c.avg_cost_per_unit<=pa.peer_avg_cpu*1.5 THEN 15
              WHEN c.avg_cost_per_unit<=pa.peer_avg_cpu*2.0 THEN 5 ELSE 0 END
          + LEAST(15,COALESCE(a.metrics_with_actuals,0)*3)
        )) >= 75 THEN 'HIGH'
        WHEN GREATEST(0,LEAST(100,
          CASE WHEN COALESCE(a.total_actuals,0)=0 THEN 0
            ELSE ROUND((COALESCE(a.on_track_count,0)*60.0)/NULLIF(a.total_actuals,0),1) END
          + CASE WHEN c.avg_cost_per_unit IS NULL OR pa.peer_avg_cpu IS NULL OR pa.peer_avg_cpu=0 THEN 12
              WHEN c.avg_cost_per_unit<=pa.peer_avg_cpu THEN 25
              WHEN c.avg_cost_per_unit<=pa.peer_avg_cpu*1.5 THEN 15
              WHEN c.avg_cost_per_unit<=pa.peer_avg_cpu*2.0 THEN 5 ELSE 0 END
          + LEAST(15,COALESCE(a.metrics_with_actuals,0)*3)
        )) >= 50 THEN 'MEDIUM'
        ELSE 'LOW'
      END AS effectiveness_tier
    FROM ${S}."I_Program" p
    LEFT JOIN actuals_summary a  ON a."program_id"  = p."program_id"
    LEFT JOIN key_metrics     km ON km."program_id" = p."program_id"
    LEFT JOIN cost_summary    c  ON c."program_id"  = p."program_id"
    CROSS JOIN peer_avg       pa
    ORDER BY effectiveness_score DESC`,

  // ── Sprint 5: Grant → Outcome Linkage ────────────────────────────────────
  grantLinkage: `
    SELECT
      g."grant_id", g."grant_number", g."grant_title", g."grantor_agency",
      g."cfda_number", g."award_amount", g."award_status",
      p."program_id", p."program_name", p."program_type",
      COUNT(DISTINCT m."metric_id")                                          AS linked_metrics,
      COUNT(DISTINCT a."actual_id")                                          AS actuals_reported,
      SUM(CASE WHEN a."performance_status"='ON_TRACK'  THEN 1 ELSE 0 END)   AS on_track,
      SUM(CASE WHEN a."performance_status"='AT_RISK'   THEN 1 ELSE 0 END)   AS at_risk,
      SUM(CASE WHEN a."performance_status"='OFF_TRACK' THEN 1 ELSE 0 END)   AS off_track,
      CASE
        WHEN COUNT(DISTINCT m."metric_id")=0  THEN 'NO_METRICS'
        WHEN SUM(CASE WHEN a."performance_status"='OFF_TRACK' THEN 1 ELSE 0 END)>0 THEN 'OFF_TRACK'
        WHEN SUM(CASE WHEN a."performance_status"='AT_RISK'   THEN 1 ELSE 0 END)>0 THEN 'AT_RISK'
        WHEN COUNT(DISTINCT a."actual_id")=0  THEN 'NO_ACTUALS'
        ELSE 'ON_TRACK'
      END AS outcome_status
    FROM ${S}."I_GrantMaster" g
    LEFT JOIN ${S}."I_Program"       p ON p."program_id" = g."program_id"
    LEFT JOIN ${S}."I_OutcomeMetric" m ON m."program_id" = p."program_id"
    LEFT JOIN ${S}."I_OutcomeActual" a ON a."metric_id"  = m."metric_id"
    GROUP BY
      g."grant_id", g."grant_number", g."grant_title", g."grantor_agency",
      g."cfda_number", g."award_amount", g."award_status",
      p."program_id", p."program_name", p."program_type"
    ORDER BY on_track DESC, at_risk DESC`,

  // ── Sprint 5: Actuals Trend (time-series) ────────────────────────────────
  trend: `
    SELECT
      a."metric_id", a."period", a."fiscal_year",
      a."actual_value", a."variance_from_target", a."performance_status",
      a."measurement_date",
      m."metric_name", m."unit_of_measure", m."direction",
      p."program_name"
    FROM ${S}."I_OutcomeActual" a
    JOIN ${S}."I_OutcomeMetric" m ON m."metric_id"  = a."metric_id"
    JOIN ${S}."I_Program"       p ON p."program_id" = m."program_id"
    ORDER BY m."metric_name", a."fiscal_year", a."period"`,

  // ── Sprint 5: Cost-Effectiveness ─────────────────────────────────────────
  costEffectiveness: `
    SELECT
      c."cost_unit_id", c."service_type", c."fiscal_year", c."period",
      c."total_cost", c."units_delivered", c."cost_per_unit",
      p."program_name", p."program_type", p."department",
      CASE
        WHEN c."cost_per_unit" <= (SELECT AVG("cost_per_unit") FROM ${S}."I_CostToServeUnit") * 0.9 THEN 'EFFICIENT'
        WHEN c."cost_per_unit" <= (SELECT AVG("cost_per_unit") FROM ${S}."I_CostToServeUnit") * 1.1 THEN 'AT_PEER'
        WHEN c."cost_per_unit" <= (SELECT AVG("cost_per_unit") FROM ${S}."I_CostToServeUnit") * 1.5 THEN 'ABOVE_PEER'
        ELSE 'INEFFICIENT'
      END AS efficiency_rating,
      ROUND((c."cost_per_unit" / NULLIF((SELECT AVG("cost_per_unit") FROM ${S}."I_CostToServeUnit"),0) - 1)*100, 1) AS pct_vs_peer
    FROM ${S}."I_CostToServeUnit" c
    JOIN ${S}."I_Program" p ON p."program_id" = c."program_id"
    ORDER BY c."cost_per_unit" ASC`,

  kpis: `
    SELECT
      COUNT(DISTINCT "metric_id") AS "total_metrics",
      SUM(CASE WHEN "performance_status"='ON_TRACK'  THEN 1 ELSE 0 END) AS "on_track",
      SUM(CASE WHEN "performance_status"='AT_RISK'   THEN 1 ELSE 0 END) AS "at_risk",
      SUM(CASE WHEN "performance_status"='OFF_TRACK' THEN 1 ELSE 0 END) AS "off_track"
    FROM ${S}."I_OutcomeActual"`,
};
