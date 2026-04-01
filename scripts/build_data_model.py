"""
build_data_model.py
Builds all missing SLED data model tables and views in
PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER schema on sierradigitalinc US10.

Phases:
  A — Grant Module Completion (ALTER I_GrantMaster + I_AllowabilityRule)
  B — Subaward & Subrecipient (4 tables)
  C — Audit & Evidence Chain  (4 tables)
  D — Program & Outcomes      (5 tables)
  E — Fund Balance & Forecast (4 tables)
  F — SQL Views               (8 views)
"""

import os
from dotenv import load_dotenv
from hdbcli import dbapi

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# ── Connect ───────────────────────────────────────────────────────────────────
print("=" * 65)
print("SLED Data Model Builder — PUBLIC_SECTOR (sierradigitalinc US10)")
print("=" * 65)

conn = dbapi.connect(
    address  = os.getenv("HANA_HOST"),
    port     = int(os.getenv("HANA_PORT", 443)),
    user     = os.getenv("HANA_USER"),
    password = os.getenv("HANA_PASSWORD"),
    encrypt  = True,
    sslValidateCertificate = False
)
cur  = conn.cursor()
SCHEMA = os.getenv("HANA_SCHEMA")
print(f"  Connected → {SCHEMA}\n")

ok = err = 0

def run(label, sql):
    global ok, err
    try:
        cur.execute(sql)
        conn.commit()
        print(f"  OK   {label}")
        ok += 1
    except Exception as e:
        msg = str(e)
        if "duplicate" in msg.lower() or "already exists" in msg.lower() or "existing" in msg.lower():
            print(f"  SKIP {label} (already exists)")
            ok += 1
        else:
            print(f"  ERR  {label}: {msg[:100]}")
            err += 1

def section(title):
    print(f"\n{'─'*65}")
    print(f"  {title}")
    print(f"{'─'*65}")

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE A — Grant Module Completion
# ═══════════════════════════════════════════════════════════════════════════════
section("PHASE A — Grant Module Completion")

run("ALTER I_GrantMaster add award_amount", """
ALTER TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_GrantMaster"
ADD ("award_amount" DECIMAL(18,2))
""")

run("ALTER I_GrantMaster add period_start", """
ALTER TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_GrantMaster"
ADD ("period_of_performance_start" DATE)
""")

run("ALTER I_GrantMaster add period_end", """
ALTER TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_GrantMaster"
ADD ("period_of_performance_end" DATE)
""")

run("ALTER I_GrantMaster add funding_source_cfda", """
ALTER TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_GrantMaster"
ADD ("funding_source_cfda" NVARCHAR(10))
""")

run("ALTER I_GrantMaster add award_status", """
ALTER TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_GrantMaster"
ADD ("award_status" NVARCHAR(20))
""")

run("ALTER I_GrantMaster add funding_agency", """
ALTER TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_GrantMaster"
ADD ("funding_agency" NVARCHAR(200))
""")

run("CREATE I_AllowabilityRule", """
CREATE TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_AllowabilityRule" (
    "rule_id"           NVARCHAR(20)  NOT NULL PRIMARY KEY,
    "cost_category"     NVARCHAR(100) NOT NULL,
    "is_necessary"      NVARCHAR(1)   DEFAULT 'Y',
    "is_reasonable"     NVARCHAR(1)   DEFAULT 'Y',
    "is_allocable"      NVARCHAR(1)   DEFAULT 'Y',
    "is_allowable"      NVARCHAR(1)   DEFAULT 'Y',
    "cfr_reference"     NVARCHAR(50),
    "description"       NVARCHAR(500),
    "exceptions"        NVARCHAR(1000),
    "effective_date"    DATE,
    "expiry_date"       DATE,
    "created_at"        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    "created_by"        NVARCHAR(50)
)
""")

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE B — Subaward & Subrecipient
# ═══════════════════════════════════════════════════════════════════════════════
section("PHASE B — Subaward & Subrecipient")

run("CREATE I_Subrecipient", """
CREATE TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_Subrecipient" (
    "subrecipient_id"       NVARCHAR(20)  NOT NULL PRIMARY KEY,
    "subrecipient_name"     NVARCHAR(200) NOT NULL,
    "uei_number"            NVARCHAR(20),
    "duns_number"           NVARCHAR(15),
    "entity_type"           NVARCHAR(50),
    "organization_type"     NVARCHAR(100),
    "address_line1"         NVARCHAR(200),
    "address_city"          NVARCHAR(100),
    "address_state"         NVARCHAR(5),
    "address_zip"           NVARCHAR(15),
    "congressional_district" NVARCHAR(10),
    "risk_score"            NVARCHAR(10),
    "risk_classification"   NVARCHAR(20),
    "monitoring_status"     NVARCHAR(30),
    "sam_gov_registered"    NVARCHAR(1)   DEFAULT 'N',
    "sam_gov_expiry"        DATE,
    "contact_name"          NVARCHAR(100),
    "contact_email"         NVARCHAR(200),
    "contact_phone"         NVARCHAR(20),
    "is_active"             NVARCHAR(1)   DEFAULT 'Y',
    "created_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    "created_by"            NVARCHAR(50),
    "updated_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
)
""")

run("CREATE I_Subaward", """
CREATE TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_Subaward" (
    "subaward_id"               NVARCHAR(30)  NOT NULL PRIMARY KEY,
    "grant_id"                  NVARCHAR(20)  NOT NULL,
    "subrecipient_id"           NVARCHAR(20)  NOT NULL,
    "subaward_number"           NVARCHAR(50),
    "subaward_type"             NVARCHAR(20),
    "cfda_number"               NVARCHAR(10),
    "cfda_program_title"        NVARCHAR(300),
    "subaward_amount"           DECIMAL(18,2),
    "obligated_amount"          DECIMAL(18,2),
    "expenditure_amount"        DECIMAL(18,2),
    "subaward_date"             DATE,
    "period_start"              DATE,
    "period_end"                DATE,
    "subaward_description"      NVARCHAR(1000),
    "place_of_performance_city" NVARCHAR(100),
    "place_of_performance_state" NVARCHAR(5),
    "place_of_performance_zip"  NVARCHAR(15),
    "exceeds_threshold"         NVARCHAR(1)   DEFAULT 'N',
    "reporting_required"        NVARCHAR(1)   DEFAULT 'N',
    "sam_gov_reported"          NVARCHAR(1)   DEFAULT 'N',
    "sam_gov_report_date"       DATE,
    "subaward_status"           NVARCHAR(20)  DEFAULT 'ACTIVE',
    "created_at"                TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    "created_by"                NVARCHAR(50),
    "updated_at"                TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
)
""")

run("CREATE I_SubrecipientMonitoring", """
CREATE TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_SubrecipientMonitoring" (
    "monitoring_id"         NVARCHAR(30)  NOT NULL PRIMARY KEY,
    "subrecipient_id"       NVARCHAR(20)  NOT NULL,
    "subaward_id"           NVARCHAR(30),
    "monitoring_type"       NVARCHAR(50),
    "monitoring_date"       DATE,
    "monitoring_method"     NVARCHAR(50),
    "conducted_by"          NVARCHAR(100),
    "findings_count"        INTEGER       DEFAULT 0,
    "findings_summary"      NVARCHAR(2000),
    "risk_rating"           NVARCHAR(20),
    "report_due_date"       DATE,
    "report_received_date"  DATE,
    "report_status"         NVARCHAR(20),
    "follow_up_required"    NVARCHAR(1)   DEFAULT 'N',
    "follow_up_date"        DATE,
    "notes"                 NVARCHAR(2000),
    "created_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    "created_by"            NVARCHAR(50)
)
""")

run("CREATE I_CorrectiveAction", """
CREATE TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_CorrectiveAction" (
    "action_id"             NVARCHAR(30)  NOT NULL PRIMARY KEY,
    "reference_type"        NVARCHAR(30),
    "reference_id"          NVARCHAR(50),
    "subrecipient_id"       NVARCHAR(20),
    "grant_id"              NVARCHAR(20),
    "finding_description"   NVARCHAR(2000),
    "finding_category"      NVARCHAR(100),
    "severity"              NVARCHAR(20),
    "action_required"       NVARCHAR(2000),
    "action_taken"          NVARCHAR(2000),
    "responsible_party"     NVARCHAR(100),
    "due_date"              DATE,
    "completion_date"       DATE,
    "status"                NVARCHAR(20)  DEFAULT 'OPEN',
    "verified_by"           NVARCHAR(100),
    "verified_date"         DATE,
    "created_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    "created_by"            NVARCHAR(50),
    "updated_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
)
""")

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE C — Audit & Evidence Chain
# ═══════════════════════════════════════════════════════════════════════════════
section("PHASE C — Audit & Evidence Chain")

run("CREATE I_Document", """
CREATE TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_Document" (
    "document_id"           NVARCHAR(50)  NOT NULL PRIMARY KEY,
    "document_number"       NVARCHAR(50),
    "document_type"         NVARCHAR(50),
    "document_title"        NVARCHAR(300),
    "document_category"     NVARCHAR(100),
    "reference_type"        NVARCHAR(30),
    "reference_id"          NVARCHAR(50),
    "grant_id"              NVARCHAR(20),
    "fiscal_year"           NVARCHAR(4),
    "document_date"         DATE,
    "amount"                DECIMAL(18,2),
    "vendor_id"             NVARCHAR(20),
    "description"           NVARCHAR(1000),
    "file_name"             NVARCHAR(300),
    "file_path"             NVARCHAR(500),
    "file_size_kb"          INTEGER,
    "retention_date"        DATE,
    "retention_years"       INTEGER       DEFAULT 3,
    "is_confidential"       NVARCHAR(1)   DEFAULT 'N',
    "access_level"          NVARCHAR(20)  DEFAULT 'INTERNAL',
    "status"                NVARCHAR(20)  DEFAULT 'ACTIVE',
    "created_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    "created_by"            NVARCHAR(50),
    "updated_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
)
""")

run("CREATE I_ApprovalRecord", """
CREATE TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_ApprovalRecord" (
    "approval_id"           NVARCHAR(50)  NOT NULL PRIMARY KEY,
    "reference_type"        NVARCHAR(30),
    "reference_id"          NVARCHAR(50),
    "document_id"           NVARCHAR(50),
    "grant_id"              NVARCHAR(20),
    "approval_step"         INTEGER,
    "approval_type"         NVARCHAR(50),
    "approver_id"           NVARCHAR(50),
    "approver_name"         NVARCHAR(100),
    "approver_role"         NVARCHAR(50),
    "approval_status"       NVARCHAR(20),
    "submitted_date"        TIMESTAMP,
    "decision_date"         TIMESTAMP,
    "decision_notes"        NVARCHAR(2000),
    "delegation_from"       NVARCHAR(100),
    "ip_address"            NVARCHAR(50),
    "created_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
)
""")

run("CREATE I_AuditLog", """
CREATE TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_AuditLog" (
    "log_id"                NVARCHAR(50)  NOT NULL PRIMARY KEY,
    "event_timestamp"       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_type"            NVARCHAR(50)  NOT NULL,
    "entity_type"           NVARCHAR(50),
    "entity_id"             NVARCHAR(50),
    "user_id"               NVARCHAR(50),
    "user_name"             NVARCHAR(100),
    "user_role"             NVARCHAR(50),
    "action"                NVARCHAR(50),
    "old_values"            NCLOB,
    "new_values"            NCLOB,
    "change_summary"        NVARCHAR(1000),
    "grant_id"              NVARCHAR(20),
    "fiscal_year"           NVARCHAR(4),
    "session_id"            NVARCHAR(100),
    "ip_address"            NVARCHAR(50),
    "application_module"    NVARCHAR(100),
    "is_tamper_evident"     NVARCHAR(1)   DEFAULT 'Y',
    "hash_value"            NVARCHAR(256)
)
""")

run("CREATE I_ControlEvidence", """
CREATE TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_ControlEvidence" (
    "evidence_id"           NVARCHAR(50)  NOT NULL PRIMARY KEY,
    "control_id"            NVARCHAR(30),
    "control_name"          NVARCHAR(200),
    "control_type"          NVARCHAR(50),
    "transaction_id"        NVARCHAR(50),
    "transaction_type"      NVARCHAR(50),
    "document_id"           NVARCHAR(50),
    "approval_id"           NVARCHAR(50),
    "grant_id"              NVARCHAR(20),
    "fiscal_year"           NVARCHAR(4),
    "evidence_date"         DATE,
    "evidence_description"  NVARCHAR(1000),
    "compliance_framework"  NVARCHAR(100),
    "cfr_reference"         NVARCHAR(100),
    "is_key_control"        NVARCHAR(1)   DEFAULT 'N',
    "test_result"           NVARCHAR(20),
    "deficiency_noted"      NVARCHAR(1)   DEFAULT 'N',
    "deficiency_description" NVARCHAR(1000),
    "created_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    "created_by"            NVARCHAR(50)
)
""")

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE D — Program & Outcomes
# ═══════════════════════════════════════════════════════════════════════════════
section("PHASE D — Program & Outcomes")

run("CREATE I_Program", """
CREATE TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_Program" (
    "program_id"            NVARCHAR(20)  NOT NULL PRIMARY KEY,
    "program_name"          NVARCHAR(200) NOT NULL,
    "program_code"          NVARCHAR(20),
    "program_type"          NVARCHAR(50),
    "department_id"         NVARCHAR(20),
    "fund_id"               NVARCHAR(20),
    "grant_id"              NVARCHAR(20),
    "program_manager"       NVARCHAR(100),
    "start_date"            DATE,
    "end_date"              DATE,
    "total_budget"          DECIMAL(18,2),
    "population_served"     NVARCHAR(200),
    "service_area"          NVARCHAR(200),
    "strategic_goal"        NVARCHAR(500),
    "program_status"        NVARCHAR(20)  DEFAULT 'ACTIVE',
    "description"           NVARCHAR(2000),
    "created_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    "created_by"            NVARCHAR(50)
)
""")

run("CREATE I_OutcomeMetric", """
CREATE TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_OutcomeMetric" (
    "metric_id"             NVARCHAR(30)  NOT NULL PRIMARY KEY,
    "program_id"            NVARCHAR(20)  NOT NULL,
    "grant_id"              NVARCHAR(20),
    "metric_name"           NVARCHAR(200) NOT NULL,
    "metric_code"           NVARCHAR(20),
    "metric_type"           NVARCHAR(50),
    "unit_of_measure"       NVARCHAR(50),
    "measurement_frequency" NVARCHAR(20),
    "data_source"           NVARCHAR(200),
    "calculation_method"    NVARCHAR(500),
    "baseline_value"        DECIMAL(18,4),
    "baseline_year"         NVARCHAR(4),
    "direction"             NVARCHAR(20),
    "cfr_reference"         NVARCHAR(100),
    "is_key_indicator"      NVARCHAR(1)   DEFAULT 'N',
    "is_active"             NVARCHAR(1)   DEFAULT 'Y',
    "description"           NVARCHAR(1000),
    "created_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    "created_by"            NVARCHAR(50)
)
""")

run("CREATE I_OutcomeTarget", """
CREATE TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_OutcomeTarget" (
    "target_id"             NVARCHAR(30)  NOT NULL PRIMARY KEY,
    "metric_id"             NVARCHAR(30)  NOT NULL,
    "program_id"            NVARCHAR(20)  NOT NULL,
    "fiscal_year"           NVARCHAR(4)   NOT NULL,
    "period"                NVARCHAR(10),
    "target_value"          DECIMAL(18,4),
    "stretch_target"        DECIMAL(18,4),
    "minimum_threshold"     DECIMAL(18,4),
    "target_description"    NVARCHAR(500),
    "approved_by"           NVARCHAR(100),
    "approved_date"         DATE,
    "created_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    "created_by"            NVARCHAR(50)
)
""")

run("CREATE I_OutcomeActual", """
CREATE TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_OutcomeActual" (
    "actual_id"             NVARCHAR(30)  NOT NULL PRIMARY KEY,
    "metric_id"             NVARCHAR(30)  NOT NULL,
    "program_id"            NVARCHAR(20)  NOT NULL,
    "fiscal_year"           NVARCHAR(4)   NOT NULL,
    "period"                NVARCHAR(10),
    "measurement_date"      DATE,
    "actual_value"          DECIMAL(18,4),
    "data_quality_flag"     NVARCHAR(20),
    "variance_from_target"  DECIMAL(18,4),
    "variance_pct"          DECIMAL(10,4),
    "performance_status"    NVARCHAR(20),
    "narrative"             NVARCHAR(2000),
    "data_source"           NVARCHAR(200),
    "reported_by"           NVARCHAR(100),
    "verified_by"           NVARCHAR(100),
    "verified_date"         DATE,
    "created_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    "created_by"            NVARCHAR(50)
)
""")

run("CREATE I_CostToServeUnit", """
CREATE TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_CostToServeUnit" (
    "cost_unit_id"          NVARCHAR(30)  NOT NULL PRIMARY KEY,
    "program_id"            NVARCHAR(20)  NOT NULL,
    "fiscal_year"           NVARCHAR(4)   NOT NULL,
    "period"                NVARCHAR(10),
    "service_unit"          NVARCHAR(100),
    "unit_description"      NVARCHAR(500),
    "total_cost"            DECIMAL(18,2),
    "direct_cost"           DECIMAL(18,2),
    "indirect_cost"         DECIMAL(18,2),
    "units_delivered"       DECIMAL(18,4),
    "cost_per_unit"         DECIMAL(18,4),
    "benchmark_cost"        DECIMAL(18,4),
    "variance_from_benchmark" DECIMAL(18,4),
    "cost_source"           NVARCHAR(50),
    "created_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    "created_by"            NVARCHAR(50)
)
""")

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE E — Fund Balance & Forecasting
# ═══════════════════════════════════════════════════════════════════════════════
section("PHASE E — Fund Balance & Forecasting")

run("CREATE I_FundBalanceClassification", """
CREATE TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_FundBalanceClassification" (
    "classification_id"     NVARCHAR(30)  NOT NULL PRIMARY KEY,
    "fund_id"               NVARCHAR(20)  NOT NULL,
    "fiscal_year"           NVARCHAR(4)   NOT NULL,
    "period"                NVARCHAR(10),
    "nonspendable_amount"   DECIMAL(18,2) DEFAULT 0,
    "restricted_amount"     DECIMAL(18,2) DEFAULT 0,
    "committed_amount"      DECIMAL(18,2) DEFAULT 0,
    "assigned_amount"       DECIMAL(18,2) DEFAULT 0,
    "unassigned_amount"     DECIMAL(18,2) DEFAULT 0,
    "total_fund_balance"    DECIMAL(18,2) DEFAULT 0,
    "restriction_purpose"   NVARCHAR(500),
    "commitment_authority"  NVARCHAR(200),
    "assignment_purpose"    NVARCHAR(500),
    "gasb_statement_ref"    NVARCHAR(50)  DEFAULT 'GASB-54',
    "as_of_date"            DATE,
    "notes"                 NVARCHAR(1000),
    "created_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    "created_by"            NVARCHAR(50),
    "updated_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
)
""")

run("CREATE I_ScenarioVersion", """
CREATE TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_ScenarioVersion" (
    "scenario_id"           NVARCHAR(30)  NOT NULL PRIMARY KEY,
    "scenario_name"         NVARCHAR(200) NOT NULL,
    "scenario_type"         NVARCHAR(20),
    "fiscal_year"           NVARCHAR(4),
    "fund_id"               NVARCHAR(20),
    "grant_id"              NVARCHAR(20),
    "base_scenario_id"      NVARCHAR(30),
    "description"           NVARCHAR(1000),
    "status"                NVARCHAR(20)  DEFAULT 'DRAFT',
    "created_by"            NVARCHAR(50),
    "approved_by"           NVARCHAR(100),
    "approved_date"         DATE,
    "is_locked"             NVARCHAR(1)   DEFAULT 'N',
    "created_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    "updated_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
)
""")

run("CREATE I_ScenarioAssumption", """
CREATE TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_ScenarioAssumption" (
    "assumption_id"         NVARCHAR(30)  NOT NULL PRIMARY KEY,
    "scenario_id"           NVARCHAR(30)  NOT NULL,
    "assumption_type"       NVARCHAR(50),
    "assumption_name"       NVARCHAR(200),
    "fiscal_year"           NVARCHAR(4),
    "base_value"            DECIMAL(18,4),
    "assumed_value"         DECIMAL(18,4),
    "change_pct"            DECIMAL(10,4),
    "applies_to"            NVARCHAR(200),
    "rationale"             NVARCHAR(1000),
    "constraint_type"       NVARCHAR(50),
    "constraint_value"      DECIMAL(18,4),
    "is_fund_restricted"    NVARCHAR(1)   DEFAULT 'N',
    "created_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    "created_by"            NVARCHAR(50)
)
""")

run("CREATE I_ForecastEntry", """
CREATE TABLE "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_ForecastEntry" (
    "forecast_id"           NVARCHAR(30)  NOT NULL PRIMARY KEY,
    "scenario_id"           NVARCHAR(30),
    "fund_id"               NVARCHAR(20),
    "fund_center_id"        NVARCHAR(20),
    "grant_id"              NVARCHAR(20),
    "program_id"            NVARCHAR(20),
    "commitment_item_id"    NVARCHAR(20),
    "fiscal_year"           NVARCHAR(4),
    "period"                NVARCHAR(10),
    "forecast_type"         NVARCHAR(30),
    "original_budget"       DECIMAL(18,2),
    "revised_budget"        DECIMAL(18,2),
    "actuals_to_date"       DECIMAL(18,2),
    "encumbrances"          DECIMAL(18,2),
    "forecast_amount"       DECIMAL(18,2),
    "year_end_projection"   DECIMAL(18,2),
    "available_balance"     DECIMAL(18,2),
    "variance_from_budget"  DECIMAL(18,2),
    "variance_pct"          DECIMAL(10,4),
    "confidence_level"      NVARCHAR(20),
    "forecast_basis"        NVARCHAR(500),
    "early_warning_flag"    NVARCHAR(1)   DEFAULT 'N',
    "underspend_risk"       NVARCHAR(20),
    "created_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    "created_by"            NVARCHAR(50),
    "updated_at"            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
)
""")

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE F — SQL Views
# ═══════════════════════════════════════════════════════════════════════════════
section("PHASE F — SQL Views")

run("CREATE V_SubawardTransparency", """
CREATE OR REPLACE VIEW "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."V_SubawardTransparency" AS
SELECT
    sa."subaward_id",
    sa."subaward_number",
    sa."grant_id",
    gm."grant_number",
    sr."subrecipient_name",
    sr."uei_number",
    sr."entity_type",
    sr."risk_classification",
    sr."address_state",
    sa."subaward_amount",
    sa."obligated_amount",
    sa."expenditure_amount",
    sa."subaward_date",
    sa."period_start",
    sa."period_end",
    sa."cfda_number",
    sa."cfda_program_title",
    sa."subaward_status",
    CASE WHEN sa."subaward_amount" >= 30000 THEN 'Y' ELSE 'N' END AS "exceeds_30k_threshold",
    sa."sam_gov_reported",
    sa."sam_gov_report_date",
    sa."place_of_performance_state",
    sa."subaward_description"
FROM "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_Subaward" sa
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_Subrecipient" sr
    ON sa."subrecipient_id" = sr."subrecipient_id"
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_GrantMaster" gm
    ON sa."grant_id" = gm."grant_id"
""")

run("CREATE V_GrantAwardLifecycle", """
CREATE OR REPLACE VIEW "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."V_GrantAwardLifecycle" AS
SELECT
    gm."grant_id",
    gm."grant_number",
    gm."grant_name",
    gm."award_amount",
    gm."period_of_performance_start",
    gm."period_of_performance_end",
    gm."award_status",
    gm."funding_source_cfda",
    gm."funding_agency",
    gls."lifecycle_status",
    gb_tot."total_budget",
    gbil_tot."total_billed",
    CASE
        WHEN gm."award_amount" > 0
        THEN ROUND(gbil_tot."total_billed" / gm."award_amount" * 100, 2)
        ELSE 0
    END AS "burn_rate_pct",
    gm."award_amount" - COALESCE(gbil_tot."total_billed", 0) AS "remaining_balance",
    CASE
        WHEN gm."period_of_performance_end" < CURRENT_DATE THEN 'EXPIRED'
        WHEN gm."period_of_performance_end" <= ADD_DAYS(CURRENT_DATE, 90) THEN 'EXPIRING_SOON'
        ELSE 'ACTIVE'
    END AS "period_status"
FROM "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_GrantMaster" gm
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_GrantLifecycleStatus" gls
    ON gm."grant_id" = gls."grant_id"
LEFT JOIN (
    SELECT "grant_id", SUM("budget_amount") AS "total_budget"
    FROM "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_GrantBudget"
    GROUP BY "grant_id"
) gb_tot ON gm."grant_id" = gb_tot."grant_id"
LEFT JOIN (
    SELECT "grant_id", SUM("billed_amount") AS "total_billed"
    FROM "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_GrantBilling"
    GROUP BY "grant_id"
) gbil_tot ON gm."grant_id" = gbil_tot."grant_id"
""")

run("CREATE V_GrantCompliance", """
CREATE OR REPLACE VIEW "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."V_GrantCompliance" AS
SELECT
    gm."grant_id",
    gm."grant_number",
    gm."grant_name",
    gm."award_status",
    gm."funding_source_cfda",
    gm."funding_agency",
    gls."lifecycle_status",
    COUNT(DISTINCT sa."subaward_id")    AS "subaward_count",
    COUNT(DISTINCT sm."monitoring_id")  AS "monitoring_count",
    COUNT(DISTINCT ca."action_id")      AS "open_corrective_actions",
    COUNT(DISTINCT doc."document_id")   AS "document_count",
    CASE
        WHEN COUNT(CASE WHEN ca."status" = 'OPEN' THEN 1 END) > 0 THEN 'AT_RISK'
        WHEN gm."period_of_performance_end" <= ADD_DAYS(CURRENT_DATE, 90) THEN 'EXPIRING'
        ELSE 'COMPLIANT'
    END AS "compliance_status"
FROM "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_GrantMaster" gm
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_GrantLifecycleStatus" gls
    ON gm."grant_id" = gls."grant_id"
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_Subaward" sa
    ON gm."grant_id" = sa."grant_id"
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_SubrecipientMonitoring" sm
    ON sa."subaward_id" = sm."subaward_id"
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_CorrectiveAction" ca
    ON gm."grant_id" = ca."grant_id" AND ca."status" = 'OPEN'
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_Document" doc
    ON gm."grant_id" = doc."grant_id"
GROUP BY gm."grant_id", gm."grant_number", gm."grant_name",
         gm."award_status", gm."funding_source_cfda",
         gm."funding_agency", gls."lifecycle_status",
         gm."period_of_performance_end"
""")

run("CREATE V_OutcomeScorecard", """
CREATE OR REPLACE VIEW "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."V_OutcomeScorecard" AS
SELECT
    p."program_id",
    p."program_name",
    p."program_type",
    p."fund_id",
    p."grant_id",
    om."metric_id",
    om."metric_name",
    om."unit_of_measure",
    om."metric_type",
    ot."fiscal_year",
    ot."period",
    ot."target_value",
    oa."actual_value",
    oa."performance_status",
    CASE
        WHEN ot."target_value" > 0
        THEN ROUND(oa."actual_value" / ot."target_value" * 100, 2)
        ELSE NULL
    END AS "achievement_pct",
    oa."actual_value" - ot."target_value" AS "variance",
    cu."cost_per_unit",
    cu."total_cost",
    cu."units_delivered",
    oa."narrative"
FROM "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_Program" p
JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_OutcomeMetric" om
    ON p."program_id" = om."program_id"
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_OutcomeTarget" ot
    ON om."metric_id" = ot."metric_id" AND p."program_id" = ot."program_id"
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_OutcomeActual" oa
    ON om."metric_id" = oa."metric_id"
    AND ot."fiscal_year" = oa."fiscal_year"
    AND ot."period" = oa."period"
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_CostToServeUnit" cu
    ON p."program_id" = cu."program_id"
    AND ot."fiscal_year" = cu."fiscal_year"
""")

run("CREATE V_FundBalance", """
CREATE OR REPLACE VIEW "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."V_FundBalance" AS
SELECT
    fbc."classification_id",
    fbc."fund_id",
    f."fund_name",
    ft."fund_type_name",
    fbc."fiscal_year",
    fbc."period",
    fbc."as_of_date",
    fbc."nonspendable_amount",
    fbc."restricted_amount",
    fbc."committed_amount",
    fbc."assigned_amount",
    fbc."unassigned_amount",
    fbc."total_fund_balance",
    fbc."restriction_purpose",
    fbc."commitment_authority",
    fbc."gasb_statement_ref",
    CASE
        WHEN fbc."total_fund_balance" > 0
        THEN ROUND(fbc."restricted_amount" / fbc."total_fund_balance" * 100, 2)
        ELSE 0
    END AS "restricted_pct",
    CASE
        WHEN fbc."total_fund_balance" > 0
        THEN ROUND(fbc."unassigned_amount" / fbc."total_fund_balance" * 100, 2)
        ELSE 0
    END AS "unassigned_pct"
FROM "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_FundBalanceClassification" fbc
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_Fund" f
    ON fbc."fund_id" = f."fund_id"
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_FundType" ft
    ON f."fund_type_id" = ft."fund_type_id"
""")

run("CREATE V_ForecastVariance", """
CREATE OR REPLACE VIEW "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."V_ForecastVariance" AS
SELECT
    fe."forecast_id",
    fe."fiscal_year",
    fe."period",
    fe."fund_id",
    f."fund_name",
    fe."grant_id",
    fe."program_id",
    fe."forecast_type",
    fe."original_budget",
    fe."revised_budget",
    fe."actuals_to_date",
    fe."encumbrances",
    fe."forecast_amount",
    fe."year_end_projection",
    fe."available_balance",
    fe."variance_from_budget",
    fe."variance_pct",
    fe."confidence_level",
    fe."early_warning_flag",
    fe."underspend_risk",
    sv."scenario_name",
    sv."scenario_type",
    sv."status" AS "scenario_status"
FROM "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_ForecastEntry" fe
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_Fund" f
    ON fe."fund_id" = f."fund_id"
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_ScenarioVersion" sv
    ON fe."scenario_id" = sv."scenario_id"
""")

run("CREATE V_AuditReadiness", """
CREATE OR REPLACE VIEW "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."V_AuditReadiness" AS
SELECT
    ce."evidence_id",
    ce."control_id",
    ce."control_name",
    ce."control_type",
    ce."transaction_id",
    ce."transaction_type",
    ce."grant_id",
    gm."grant_number",
    gm."funding_source_cfda",
    ce."fiscal_year",
    ce."evidence_date",
    ce."compliance_framework",
    ce."cfr_reference",
    ce."is_key_control",
    ce."test_result",
    ce."deficiency_noted",
    ce."deficiency_description",
    doc."document_title",
    doc."document_type",
    doc."retention_date",
    doc."access_level",
    ar."approver_name",
    ar."approval_status",
    ar."decision_date"
FROM "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_ControlEvidence" ce
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_Document" doc
    ON ce."document_id" = doc."document_id"
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_ApprovalRecord" ar
    ON ce."approval_id" = ar."approval_id"
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_GrantMaster" gm
    ON ce."grant_id" = gm."grant_id"
""")

run("CREATE V_EvidenceChain", """
CREATE OR REPLACE VIEW "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."V_EvidenceChain" AS
SELECT
    al."log_id",
    al."event_timestamp",
    al."event_type",
    al."entity_type"    AS "kpi_entity",
    al."entity_id"      AS "kpi_id",
    al."action"         AS "transaction_action",
    al."grant_id",
    gm."grant_number",
    al."fiscal_year",
    al."user_name",
    al."user_role",
    al."change_summary",
    doc."document_id",
    doc."document_title",
    doc."document_type",
    doc."document_date",
    ar."approval_id",
    ar."approver_name",
    ar."approval_status",
    ar."decision_date",
    ce."evidence_id",
    ce."control_name",
    ce."test_result",
    al."is_tamper_evident"
FROM "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_AuditLog" al
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_Document" doc
    ON al."entity_id" = doc."reference_id"
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_ApprovalRecord" ar
    ON al."entity_id" = ar."reference_id"
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_ControlEvidence" ce
    ON al."entity_id" = ce."transaction_id"
LEFT JOIN "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"."I_GrantMaster" gm
    ON al."grant_id" = gm."grant_id"
""")

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"""
{'='*65}
BUILD COMPLETE
{'='*65}
  Successful : {ok}
  Errors     : {err}
  Total      : {ok + err}

Objects Created in PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER:
  Phase A — Grant Completion  : I_AllowabilityRule + 6 ALTER fields
  Phase B — Subaward          : I_Subrecipient, I_Subaward,
                                 I_SubrecipientMonitoring, I_CorrectiveAction
  Phase C — Audit & Evidence  : I_Document, I_ApprovalRecord,
                                 I_AuditLog, I_ControlEvidence
  Phase D — Outcomes          : I_Program, I_OutcomeMetric, I_OutcomeTarget,
                                 I_OutcomeActual, I_CostToServeUnit
  Phase E — Fund & Forecast   : I_FundBalanceClassification,
                                 I_ScenarioVersion, I_ScenarioAssumption,
                                 I_ForecastEntry
  Phase F — SQL Views         : V_SubawardTransparency, V_GrantAwardLifecycle,
                                 V_GrantCompliance, V_OutcomeScorecard,
                                 V_FundBalance, V_ForecastVariance,
                                 V_AuditReadiness, V_EvidenceChain

NEXT STEPS FOR KAVI:
  1. Open Data Builder → PUBLIC_SECTOR space
  2. For each V_ view above → New SQL View → reference
     PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER.<view_name>
  3. Deploy each view into the space
  4. Build 4 new AM_ Analytic Models:
     - AM_GrantCompliance   (from V_GrantCompliance + V_GrantAwardLifecycle)
     - AM_SubawardMonitoring (from V_SubawardTransparency)
     - AM_OutcomeLinkage    (from V_OutcomeScorecard)
     - AM_FundBalance       (from V_FundBalance + V_ForecastVariance)
{'='*65}
""")

cur.close()
conn.close()
