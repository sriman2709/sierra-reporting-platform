"""
seed_demo_data.py — Enhanced demo-quality seed data for Sierra SLED
Superset of seed_sample_data.py:
  ✓ 10 grants, 3 programs, 5 funds
  ✓ 3 years of outcome actuals (FY2022/FY2023/FY2024) — rich trend charts
  ✓ CostToServe across 6 quarters — cost effectiveness story
  ✓ Dramatic burn-rate spread: CDBG over-burning, WIOA under-burning
  ✓ Fund budget: CDBG & WIOA over budget — clear compliance story
  ✓ is_key_indicator set on strategic metrics
  ✓ 8 subrecipients w/ monitoring — 2 HIGH, 2 MEDIUM, 4 LOW
  ✓ 5 corrective actions — open findings at different severities
  ✓ 15 documents + 10 approvals + 12 control evidence records
  ✓ Scenario + forecast entries for What-If builder
"""
import os, uuid
from datetime import date
from dotenv import load_dotenv
from hdbcli import dbapi

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', 'server', '.env'))
conn = dbapi.connect(
    address=os.getenv("HANA_HOST"), port=443,
    user=os.getenv("HANA_USER"), password=os.getenv("HANA_PASSWORD"),
    encrypt=True, sslValidateCertificate=False
)
cur  = conn.cursor()
S    = "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"
ok = err = 0

def run(label, sql, params=None):
    global ok, err
    try:
        cur.execute(sql, params or [])
        conn.commit()
        ok += 1
    except Exception as e:
        print(f"  ERR {label}: {str(e)[:120]}")
        err += 1

def create_table(label, sql):
    """CREATE COLUMN TABLE — silently skips if table already exists (error 288)."""
    global ok, err
    try:
        cur.execute(sql)
        conn.commit()
        ok += 1
    except Exception as e:
        if '288' in str(e) or 'duplicate table name' in str(e):
            ok += 1  # table already exists — not an error on re-run
        else:
            print(f"  ERR {label}: {str(e)[:120]}")
            err += 1

def id20(): return uuid.uuid4().hex[:20]
def id28(): return uuid.uuid4().hex[:28]
def id50(): return str(uuid.uuid4())[:50]
def yn(v):  return 'Y' if v else 'N'

print("=" * 65)
print("  Sierra SLED — Demo Data Seeder (Enhanced)")
print("=" * 65)

# ── Clear all tables (order matters — child before parent) ─────────────────
print("\n  Clearing existing data…")
for t in [
    'I_Milestone','I_ProjectFunding','I_ChangeOrder','I_CapitalProject',
    'I_ForecastEntry','I_ScenarioAssumption','I_ScenarioVersion',
    'I_FundBalanceClassification','I_CostToServeUnit','I_OutcomeActual',
    'I_OutcomeTarget','I_OutcomeMetric','I_CorrectiveAction',
    'I_SubrecipientMonitoring','I_ControlEvidence','I_AuditLog',
    'I_ApprovalRecord','I_Document','I_Subaward','I_Subrecipient',
    'I_AllowabilityRule','I_Fund','I_GrantMaster','I_Program',
]:
    run(f"CLR {t}", f'DELETE FROM "{S}"."{t}"')

# ── Stable IDs ──────────────────────────────────────────────────────────────
p_housing   = id20(); p_workforce = id20(); p_education = id20()
f_general   = id20(); f_cdbg      = id20(); f_title1    = id20()
f_wf        = id20(); f_cap       = id20()

g_cdbg      = id20(); g_title1    = id20(); g_wioa      = id20()
g_esser     = id20(); g_home      = id20(); g_headstart = id20()
g_slfrf     = id20(); g_rap       = id20(); g_snap      = id20()
g_idea      = id20()

sr_hope     = id20(); sr_nextgen  = id20(); sr_green    = id20()
sr_unity    = id20(); sr_bright   = id20(); sr_metro    = id20()
sr_valley   = id20(); sr_summit   = id20()

# Metric IDs
m_hu  = id28(); m_hp  = id28(); m_hc  = id28()   # housing
m_j   = id28(); m_w   = id28(); m_r   = id28()   # workforce
m_pr  = id28(); m_gr  = id28(); m_at  = id28()   # education

sc_base = id28(); sc_opt = id28(); sc_cons = id28()

# ── Programs ────────────────────────────────────────────────────────────────
print("\n── Programs ──")
for r in [
    (p_housing,   'Housing & Community Development', 'HCD-001', 'COMMUNITY_DEVELOPMENT', 'Housing',
     '2022-01-01', '2025-12-31', 4200000, 'Metro Region',   'Reduce homelessness and create 300 affordable units'),
    (p_workforce, 'Workforce Development',           'WFD-001', 'WORKFORCE',             'Labor',
     '2022-07-01', '2026-06-30', 3100000, 'Statewide',      'Increase employment rate among low-income adults by 20%'),
    (p_education, 'K-12 Education Support',          'EDU-001', 'EDUCATION',             'Education',
     '2022-08-01', '2026-07-31', 5800000, 'School District','Close Title I achievement gap by 15 percentage points'),
]:
    run(r[1], f'''INSERT INTO "{S}"."I_Program"
        ("program_id","program_name","program_code","program_type","department_id",
         "start_date","end_date","total_budget","service_area","strategic_goal","program_status","created_by")
        VALUES(?,?,?,?,?,?,?,?,?,?,'ACTIVE','seed')''', list(r))

# ── Funds — CDBG & WIOA intentionally over-budget for demo impact ──────────
print("── Funds ──")
for r in [
    # fund_id, code, name, type, fy, appropriation, revenues_ytd, expenditures_ytd,
    #   ending_bal, restricted, committed, assigned, unassigned, is_grant, gasb54
    (f_general,'GF-001','General Fund',              'GENERAL',        '2024',12500000,8200000, 7900000, 12800000,0,       0,       2000000,10800000,0,'GASB-54'),
    # CDBG: 2.55M spend against 2.4M appropriation → OVER BUDGET (106%)
    (f_cdbg,   'SP-101','CDBG Special Revenue Fund', 'SPECIAL_REVENUE','2024',2400000, 2550000, 2550000, 2400000, 2400000, 0,       0,       0,       1,'GASB-54'),
    (f_title1, 'SP-102','Title I Education Fund',    'SPECIAL_REVENUE','2024',3200000, 2100000, 2050000, 3250000, 3250000, 0,       0,       0,       1,'GASB-54'),
    # WIOA: 1.62M spend against 1.5M appropriation → OVER BUDGET (108%)
    (f_wf,     'SP-103','WIOA Workforce Fund',       'SPECIAL_REVENUE','2024',1500000, 1620000, 1620000, 1380000, 1380000, 0,       0,       0,       1,'GASB-54'),
    (f_cap,    'CP-001','Capital Projects Fund',     'CAPITAL_PROJECTS','2024',5000000, 500000,  320000,  5180000, 0,       5180000, 0,       0,       0,'GASB-54'),
]:
    run(r[2], f'''INSERT INTO "{S}"."I_Fund"
        ("fund_id","fund_code","fund_name","fund_type","fiscal_year","beginning_balance","revenues_ytd",
         "expenditures_ytd","ending_balance","restricted_amount","committed_amount","assigned_amount",
         "unassigned_amount","is_grant_fund","gasb54_class")
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''', list(r))

# ── Grants ──────────────────────────────────────────────────────────────────
print("── Grants ──")
for r in [
    # id, number, title, agency, cfda, amount, start, end, status, program, fund, frequency
    (g_cdbg,     'CDBG-2023-001', 'Community Development Block Grant',    'HUD',                  '14.218', 1850000, '2023-01-01','2025-12-31','ACTIVE',   p_housing,  f_cdbg,  'ANNUAL'),
    (g_title1,   'ESEA-2023-002', 'Title I Part A — Improving Schools',   'US Dept of Education', '84.010', 2400000, '2023-08-01','2026-07-31','ACTIVE',   p_education,f_title1,'ANNUAL'),
    (g_wioa,     'WIOA-2023-003', 'WIOA Adult & Dislocated Worker',        'US Dept of Labor',     '17.258', 1200000, '2023-07-01','2025-06-30','ACTIVE',   p_workforce,f_wf,    'QUARTERLY'),
    (g_esser,    'ESSER-2023-004','ESSER III — Learning Recovery',         'US Dept of Education', '84.425', 3100000, '2023-03-15','2024-09-30','ACTIVE',   p_education,f_title1,'QUARTERLY'),
    (g_home,     'HOME-2023-005', 'HOME Investment Partnerships Program',  'HUD',                  '14.239', 980000,  '2023-06-01','2026-05-31','ACTIVE',   p_housing,  f_cdbg,  'ANNUAL'),
    (g_headstart,'HEAD-2024-006', 'Head Start Early Childhood Education',  'HHS',                  '93.600', 1450000, '2024-01-01','2024-12-31','ACTIVE',   p_education,f_title1,'QUARTERLY'),
    (g_slfrf,    'SLFRF-2022-007','State & Local Fiscal Recovery Fund',    'US Treasury',          '21.027', 4500000, '2022-03-11','2026-12-31','ACTIVE',   p_housing,  f_general,'SEMI_ANNUAL'),
    # RAP is EXPIRING soon — good demo talking point
    (g_rap,      'RAP-2023-008',  'Rental Assistance Program',             'HUD',                  '14.871', 620000,  '2023-09-01','2024-08-31','EXPIRING', p_housing,  f_cdbg,  'MONTHLY'),
    (g_snap,     'SNAP-2024-009', 'SNAP Employment & Training',            'USDA',                 '10.561', 380000,  '2024-01-01','2024-12-31','ACTIVE',   p_workforce,f_wf,    'QUARTERLY'),
    (g_idea,     'IDEA-2023-010', 'IDEA Part B — Special Education',       'US Dept of Education', '84.027', 1820000, '2023-08-01','2026-07-31','ACTIVE',   p_education,f_title1,'ANNUAL'),
]:
    run(r[1], f'''INSERT INTO "{S}"."I_GrantMaster"
        ("grant_id","grant_number","grant_title","grantor_agency","cfda_number","award_amount",
         "award_start_date","award_end_date","award_status","program_id","fund_id","reporting_frequency")
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?)''', list(r))

# ── Allowability Rules ───────────────────────────────────────────────────────
print("── Allowability Rules ──")
for r in [
    ('Personnel costs — direct staff',          yn(1),yn(1),yn(1),yn(1),'2 CFR 200.430','Direct program staff salaries — requires effort certification'),
    ('Fringe benefits — documented',            yn(1),yn(1),yn(1),yn(1),'2 CFR 200.431','Proportional to direct salaries; must match payroll system'),
    ('Travel — in-state at per diem',           yn(1),yn(1),yn(1),yn(1),'2 CFR 200.474','Government rate; foreign travel requires prior approval'),
    ('Equipment purchases over $5,000',         yn(1),yn(1),yn(1),yn(0),'2 CFR 200.439','Must be in approved budget; tagged and inventoried annually'),
    ('Indirect costs — approved rate',          yn(1),yn(1),yn(1),yn(1),'2 CFR 200.414','Negotiated NICRA rate only; de minimis 10% MTDC if no NICRA'),
    ('Entertainment expenses',                  yn(0),yn(0),yn(0),yn(0),'2 CFR 200.438','UNALLOWABLE — includes meals at meetings without programmatic purpose'),
    ('Lobbying activities',                     yn(0),yn(0),yn(0),yn(0),'2 CFR 200.450','UNALLOWABLE — no federal funds for political activity'),
    ('Advertising — programmatic purpose only', yn(1),yn(1),yn(0),yn(0),'2 CFR 200.421','Recruitment ads OK; general brand advertising NOT allowable'),
    ('Subcontractor costs — competitively bid', yn(1),yn(1),yn(1),yn(1),'2 CFR 200.317','Competitive procurement required over $10K threshold'),
    ('Alcohol purchases',                       yn(0),yn(0),yn(0),yn(0),'2 CFR 200.423','UNALLOWABLE under any federal award'),
    ('Depreciation — straight-line only',       yn(1),yn(1),yn(1),yn(1),'2 CFR 200.436','Only on non-federally funded assets; must have asset schedule'),
    ('Fines and penalties',                     yn(0),yn(0),yn(0),yn(0),'2 CFR 200.441','UNALLOWABLE regardless of cause'),
]:
    run(r[0][:25], f'''INSERT INTO "{S}"."I_AllowabilityRule"
        ("rule_id","cost_category","is_necessary","is_reasonable","is_allocable","is_allowable",
         "cfr_reference","description","created_by")
        VALUES(?,?,?,?,?,?,?,?,'seed')''', [id20()] + list(r))

# ── Subrecipients ────────────────────────────────────────────────────────────
print("── Subrecipients ──")
for r in [
    (sr_hope,   'Hope Housing Foundation',        'UEI-4A7B2C','DUNS-12345','NONPROFIT', 'TX','28','LOW',   yn(1),'2025-06-30'),
    (sr_nextgen,'NextGen Workforce Institute',     'UEI-5B8C3D','DUNS-23456','NONPROFIT', 'TX','42','MEDIUM',yn(1),'2025-03-15'),
    (sr_green,  'GreenPath Community Services',   'UEI-6C9D4E','DUNS-34567','NONPROFIT', 'TX','18','LOW',   yn(1),'2025-09-30'),
    (sr_unity,  'Unity Education Collaborative',  'UEI-7D0E5F','DUNS-45678','EDUCATION', 'TX','65','HIGH',  yn(1),'2025-01-31'),
    (sr_bright, 'Bright Futures Learning Center', 'UEI-8E1F6G','DUNS-56789','NONPROFIT', 'TX','31','LOW',   yn(1),'2025-07-31'),
    (sr_metro,  'Metro Area Transit Authority',   'UEI-9F2G7H','DUNS-67890','GOVERNMENT','TX','22','LOW',   yn(1),'2026-02-28'),
    (sr_valley, 'Valley Skills Training Center',  'UEI-0G3H8I','DUNS-78901','NONPROFIT', 'TX','78','HIGH',  yn(0),'2024-12-31'),
    (sr_summit, 'Summit Community Action Agency', 'UEI-1H4I9J','DUNS-89012','NONPROFIT', 'TX','35','MEDIUM',yn(1),'2025-05-31'),
]:
    run(r[1][:25], f'''INSERT INTO "{S}"."I_Subrecipient"
        ("subrecipient_id","subrecipient_name","uei_number","duns_number","entity_type","address_state",
         "risk_score","risk_classification","sam_gov_registered","sam_gov_expiry",
         "address_city","monitoring_status","is_active","created_by")
        VALUES(?,?,?,?,?,?,?,?,?,?,'Austin','STANDARD','Y','seed')''', list(r))

# ── Subawards ────────────────────────────────────────────────────────────────
print("── Subawards ──")
for r in [
    (id28(),g_cdbg,    sr_hope,  'SA-CDBG-001','CONSTRUCTION',485000,'2023-03-01','2024-02-28','ACTIVE',   yn(1),yn(1)),
    (id28(),g_cdbg,    sr_green, 'SA-CDBG-002','SERVICES',    225000,'2023-04-01','2024-03-31','ACTIVE',   yn(1),yn(1)),
    (id28(),g_title1,  sr_unity, 'SA-T1-001',  'EDUCATION',   380000,'2023-09-01','2024-06-30','ACTIVE',   yn(1),yn(1)),
    (id28(),g_title1,  sr_bright,'SA-T1-002',  'EDUCATION',   290000,'2023-09-01','2024-06-30','ACTIVE',   yn(1),yn(1)),
    (id28(),g_wioa,    sr_nextgen,'SA-WIOA-001','TRAINING',   320000,'2023-08-01','2024-07-31','ACTIVE',   yn(1),yn(1)),
    (id28(),g_wioa,    sr_valley,'SA-WIOA-002','TRAINING',    180000,'2023-08-01','2024-07-31','SUSPENDED',yn(1),yn(0)),
    (id28(),g_home,    sr_hope,  'SA-HOME-001','CONSTRUCTION',410000,'2023-07-01','2025-06-30','ACTIVE',   yn(1),yn(1)),
    (id28(),g_headstart,sr_summit,'SA-HEAD-001','SERVICES',   95000,'2024-02-01','2024-12-31','ACTIVE',   yn(1),yn(1)),
    (id28(),g_idea,    sr_bright,'SA-IDEA-001','EDUCATION',   240000,'2023-09-01','2024-06-30','ACTIVE',   yn(1),yn(1)),
]:
    run(r[4], f'''INSERT INTO "{S}"."I_Subaward"
        ("subaward_id","grant_id","subrecipient_id","subaward_number","subaward_type","subaward_amount",
         "period_start","period_end","subaward_status","exceeds_threshold","sam_gov_reported",
         "place_of_performance_city","place_of_performance_state","reporting_required","created_by")
        VALUES(?,?,?,?,?,?,?,?,?,?,?,'Austin','TX','Y','seed')''', list(r))

# ── Subrecipient Monitoring ──────────────────────────────────────────────────
print("── Subrecipient Monitoring ──")
for r in [
    (sr_hope,   id28(),None,  'DESK_REVIEW','2024-01-15',0,'COMPLETE','No findings — all documentation in order',                         'LOW',  yn(0),'2024-03-31'),
    (sr_nextgen,id28(),id28(),'SITE_VISIT', '2024-02-20',2,'COMPLETE','Procurement documentation missing for 3 vendor contracts',         'MEDIUM',yn(1),'2024-04-30'),
    (sr_unity,  id28(),id28(),'SITE_VISIT', '2024-03-10',3,'COMPLETE','Timekeeping procedures inadequate; effort reporting non-compliant','HIGH',  yn(1),'2024-05-15'),
    (sr_valley, id28(),id28(),'SITE_VISIT', '2024-01-08',5,'COMPLETE','Unallowable payments $4,200; weak internal controls; late reports','HIGH',  yn(1),'2024-03-15'),
    (sr_green,  id28(),None,  'DESK_REVIEW','2024-04-01',0,'COMPLETE','Clean — all quarterly reports received on time',                   'LOW',  yn(0),'2024-06-30'),
    (sr_bright, id28(),None,  'DESK_REVIEW','2024-03-25',1,'COMPLETE','One late progress report; no financial issues',                    'LOW',  yn(0),'2024-05-31'),
    (sr_metro,  id28(),None,  'DESK_REVIEW','2024-02-10',0,'COMPLETE','Government entity — standard monitoring; clean',                   'LOW',  yn(0),'2024-04-30'),
    (sr_summit, id28(),id28(),'SITE_VISIT', '2024-04-15',1,'COMPLETE','Eligibility documentation gaps for 8 participants',                'MEDIUM',yn(1),'2024-06-15'),
]:
    sa = r[1]; subaward_id = r[2]
    run(r[0][:8], f'''INSERT INTO "{S}"."I_SubrecipientMonitoring"
        ("monitoring_id","subrecipient_id","subaward_id","monitoring_type","monitoring_date",
         "findings_count","report_status","findings_summary","risk_rating","follow_up_required",
         "report_due_date","conducted_by","created_by")
        VALUES(?,?,?,?,?,?,?,?,?,?,?,'Sierra Grants Team','seed')''',
        [sa, r[0], subaward_id, r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10]])

# ── Corrective Actions ────────────────────────────────────────────────────────
print("── Corrective Actions ──")
for r in [
    (sr_unity,  g_title1,'Timekeeping does not meet 2 CFR 200.430 effort reporting','INTERNAL_CONTROL','HIGH',  'Implement biometric time & attendance system',      'IN_PROGRESS','2024-06-30'),
    (sr_valley, g_wioa,  'Unallowable entertainment costs — $4,200 charged to grant','UNALLOWABLE_COST','HIGH', 'Repay $4,200 to federal award; strengthen approval controls','OPEN','2024-05-15'),
    (sr_nextgen,g_wioa,  'Competitive procurement docs missing for 3 vendor contracts','PROCUREMENT',  'MEDIUM','Obtain retroactive documentation; update procurement policy','IN_PROGRESS','2024-05-31'),
    (sr_summit, g_headstart,'Participant eligibility files incomplete for 8 of 42 cases','ELIGIBILITY', 'MEDIUM','Complete eligibility re-verification; update intake forms',  'IN_PROGRESS','2024-06-30'),
    (sr_valley, g_wioa,  'Progress reports submitted 45+ days late — 2 consecutive periods','REPORTING','HIGH',  'Install automated reporting reminders; assign dedicated staff','OPEN','2024-04-30'),
]:
    run(r[2][:25], f'''INSERT INTO "{S}"."I_CorrectiveAction"
        ("action_id","subrecipient_id","grant_id","finding_description","finding_category",
         "severity","action_required","status","due_date","created_by")
        VALUES(?,?,?,?,?,?,?,?,?,'seed')''', [id28()] + list(r))

# ── Documents ─────────────────────────────────────────────────────────────────
print("── Documents ──")
for r in [
    (g_cdbg,    'GRANT_AGREEMENT', 'CDBG Award Agreement FY2023',            'LEGAL',     '2023-01-15',1850000),
    (g_cdbg,    'PROGRESS_REPORT', 'CDBG Q1 2024 Progress Report',           'REPORTING', '2024-04-15',None),
    (g_cdbg,    'FINANCIAL_REPORT','CDBG Q2 2024 Financial Expenditure Rpt', 'FINANCIAL', '2024-07-31',None),
    (g_title1,  'GRANT_AGREEMENT', 'Title I Award Agreement FY2023',         'LEGAL',     '2023-08-10',2400000),
    (g_title1,  'FINANCIAL_REPORT','Title I Q2 Financial Report',            'FINANCIAL', '2024-01-31',None),
    (g_title1,  'PROGRESS_REPORT', 'Title I Annual Progress Report FY2023',  'REPORTING', '2024-02-28',None),
    (g_wioa,    'GRANT_AGREEMENT', 'WIOA PY2023 Grant Agreement',            'LEGAL',     '2023-07-01',1200000),
    (g_wioa,    'AUDIT_REPORT',    'WIOA Single Audit FY2023',               'AUDIT',     '2024-03-31',None),
    (g_esser,   'GRANT_AGREEMENT', 'ESSER III Award Letter',                 'LEGAL',     '2023-03-20',3100000),
    (g_esser,   'PROGRESS_REPORT', 'ESSER III Mid-Year Closeout Report',     'REPORTING', '2024-04-30',None),
    (g_home,    'GRANT_AGREEMENT', 'HOME Partnership Agreement',             'LEGAL',     '2023-06-15',980000),
    (g_headstart,'PROGRESS_REPORT','Head Start Semi-Annual Program Report',  'REPORTING', '2024-07-15',None),
    (g_slfrf,   'GRANT_AGREEMENT', 'SLFRF Award Terms & Conditions',         'LEGAL',     '2022-05-01',4500000),
    (g_slfrf,   'FINANCIAL_REPORT','SLFRF Project & Expenditure Report',     'FINANCIAL', '2024-04-30',None),
    (g_idea,    'GRANT_AGREEMENT', 'IDEA Part B State Allocation Letter',    'LEGAL',     '2023-08-05',1820000),
    (g_idea,    'PROGRESS_REPORT', 'IDEA Annual Performance Report',         'REPORTING', '2024-02-15',None),
    (g_rap,     'GRANT_AGREEMENT', 'RAP Award Agreement FY2023',             'LEGAL',     '2023-09-01',620000),
    (g_snap,    'GRANT_AGREEMENT', 'SNAP E&T State Plan Agreement',          'LEGAL',     '2024-01-05',380000),
]:
    run(r[2][:25], f'''INSERT INTO "{S}"."I_Document"
        ("document_id","grant_id","document_type","document_title","document_category",
         "reference_type","reference_id","document_date","amount","status",
         "retention_years","access_level","created_by")
        VALUES(?,?,?,?,?,'GRANT',?,?,?,'APPROVED',7,'INTERNAL','seed')''',
        [id50(), r[0], r[1], r[2], r[3], r[0], r[4], r[5]])

# ── Approval Records ──────────────────────────────────────────────────────────
print("── Approval Records ──")
for r in [
    (g_cdbg,    'GRANT','AWARD_ACCEPTANCE', 'Director of Grants',     'grants_manager', 'APPROVED','2023-01-20'),
    (g_cdbg,    'GRANT','BUDGET_AMENDMENT', 'City Finance Officer',   'finance_analyst','APPROVED','2024-03-15'),
    (g_title1,  'GRANT','AWARD_ACCEPTANCE', 'Superintendent',         'executive',      'APPROVED','2023-08-12'),
    (g_wioa,    'GRANT','AWARD_ACCEPTANCE', 'Workforce Board Chair',  'executive',      'APPROVED','2023-07-05'),
    (g_esser,   'GRANT','AWARD_ACCEPTANCE', 'Director of Finance',    'finance_analyst','APPROVED','2023-03-22'),
    (g_home,    'GRANT','AWARD_ACCEPTANCE', 'Housing Director',       'grants_manager', 'APPROVED','2023-06-18'),
    (g_slfrf,   'GRANT','AMENDMENT',        'City Manager',           'executive',      'APPROVED','2023-09-15'),
    (g_slfrf,   'GRANT','BUDGET_AMENDMENT', 'Deputy City Manager',    'executive',      'APPROVED','2024-01-10'),
    (g_rap,     'GRANT','CLOSEOUT_REVIEW',  'Director of Grants',     'grants_manager', 'PENDING', None),
    (g_idea,    'GRANT','AWARD_ACCEPTANCE', 'Special Ed Director',    'grants_manager', 'APPROVED','2023-08-08'),
    (g_headstart,'GRANT','AWARD_ACCEPTANCE','Head Start Director',    'grants_manager', 'APPROVED','2024-01-15'),
    (g_snap,    'GRANT','AWARD_ACCEPTANCE', 'Workforce Director',     'grants_manager', 'APPROVED','2024-01-08'),
]:
    run(r[2], f'''INSERT INTO "{S}"."I_ApprovalRecord"
        ("approval_id","grant_id","reference_type","reference_id","approval_type",
         "approver_name","approver_role","approval_status","decision_date")
        VALUES(?,?,?,?,?,?,?,?,?)''', [id50(), r[0], r[1], r[0], r[2], r[3], r[4], r[5], r[6]])

# ── Control Evidence ──────────────────────────────────────────────────────────
print("── Control Evidence ──")
for r in [
    (g_cdbg,   'Procurement compliance review',          'PREVENTIVE','2 CFR 200.317','UNIFORM_GUIDANCE','PASS','2024-02-15'),
    (g_cdbg,   'Subrecipient risk assessment',           'DETECTIVE', '2 CFR 200.331','UNIFORM_GUIDANCE','PASS','2024-01-30'),
    (g_title1, 'Eligibility verification — students',    'PREVENTIVE','34 CFR 200.78','ESEA',            'PASS','2024-03-01'),
    (g_title1, 'Supplement not supplant review',         'DETECTIVE', '34 CFR 200.79','ESEA',            'FAIL','2024-03-15'),
    (g_wioa,   'Performance metrics validation',         'DETECTIVE', '20 CFR 683.100','WIOA',           'PASS','2024-02-28'),
    (g_wioa,   'Participant eligibility docs',           'PREVENTIVE','20 CFR 680.110','WIOA',           'PASS','2024-03-10'),
    (g_esser,  'Allowable use of funds review',          'PREVENTIVE','2 CFR 200.405','UNIFORM_GUIDANCE','PASS','2024-01-20'),
    (g_home,   'Environmental review compliance',        'PREVENTIVE','24 CFR 58',    'HOME',            'PASS','2024-02-10'),
    (g_slfrf,  'Project & expenditure reporting',        'DETECTIVE', '31 CFR 35',    'SLFRF',           'PASS','2024-04-25'),
    (g_idea,   'Child count accuracy verification',      'DETECTIVE', '34 CFR 300.640','IDEA',           'PASS','2024-03-20'),
    (g_headstart,'Enrollment eligibility — income docs', 'PREVENTIVE','45 CFR 1302',  'HEAD_START',      'PASS','2024-02-20'),
    (g_snap,   'Work activity tracking completeness',    'DETECTIVE', '7 CFR 273.7',  'SNAP',            'PASS','2024-03-05'),
]:
    run(r[1][:25], f'''INSERT INTO "{S}"."I_ControlEvidence"
        ("evidence_id","grant_id","control_name","control_type","cfr_reference",
         "compliance_framework","test_result","evidence_date","fiscal_year","created_by")
        VALUES(?,?,?,?,?,?,?,?,'2024','seed')''', [id50()] + list(r))

# ── Outcome Metrics (with is_key_indicator) ──────────────────────────────────
print("── Outcome Metrics ──")
for r in [
    (m_hu, p_housing,  g_cdbg,     'Affordable Housing Units Created',   'OUTPUT',    'Units',  'QUARTERLY',  'INCREASE','Y'),
    (m_hp, p_housing,  g_home,     'Persons Housed (Homeless Prevention)','OUTCOME',  'Persons','QUARTERLY',  'INCREASE','Y'),
    (m_hc, p_housing,  g_slfrf,    'Avg Cost per Housing Unit',           'EFFICIENCY','USD',   'ANNUAL',     'DECREASE','N'),
    (m_j,  p_workforce,g_wioa,     'Adults Entered Employment',           'OUTCOME',  'Persons','QUARTERLY',  'INCREASE','Y'),
    (m_w,  p_workforce,g_wioa,     'Median Wage at Placement',            'OUTCOME',  'USD',    'QUARTERLY',  'INCREASE','Y'),
    (m_r,  p_workforce,g_snap,     'Employment Retention — 2nd Quarter',  'OUTCOME',  'Percent','SEMI_ANNUAL','INCREASE','N'),
    (m_pr, p_education,g_title1,   'Students Proficient in Math',         'OUTCOME',  'Percent','ANNUAL',     'INCREASE','Y'),
    (m_gr, p_education,g_idea,     'Graduation Rate — Special Ed',        'OUTCOME',  'Percent','ANNUAL',     'INCREASE','Y'),
    (m_at, p_education,g_headstart,'Average Daily Attendance',            'OUTPUT',   'Percent','MONTHLY',    'INCREASE','N'),
]:
    run(r[3][:25], f'''INSERT INTO "{S}"."I_OutcomeMetric"
        ("metric_id","program_id","grant_id","metric_name","metric_type","unit_of_measure",
         "measurement_frequency","direction","is_key_indicator","is_active","created_by")
        VALUES(?,?,?,?,?,?,?,?,?,'Y','seed')''', list(r))

# ── Outcome Targets ───────────────────────────────────────────────────────────
print("── Outcome Targets ──")
for r in [
    # metric_id, fy, program_id, target, stretch, minimum
    (m_hu,'2024',p_housing,  120,  140, 80),
    (m_hp,'2024',p_housing,  350,  400, 250),
    (m_hc,'2024',p_housing,  185000,165000,220000),
    (m_j, '2024',p_workforce,280,  320, 200),
    (m_w, '2024',p_workforce,8500, 9500,6000),
    (m_r, '2024',p_workforce,80,   85,  65),
    (m_pr,'2024',p_education,68,   75,  55),
    (m_gr,'2024',p_education,85,   90,  75),
    (m_at,'2024',p_education,92,   95,  85),
]:
    run(r[0][:8], f'''INSERT INTO "{S}"."I_OutcomeTarget"
        ("target_id","metric_id","program_id","fiscal_year","target_value","stretch_target",
         "minimum_threshold","created_by")
        VALUES(?,?,?,?,?,?,?,'seed')''', [id28(), r[0], r[2], r[1], r[3], r[4], r[5]])

# ── Outcome Actuals — FY2022, FY2023, FY2024 for rich trend charts ────────────
print("── Outcome Actuals (3-year trend) ──")
actuals = [
    # ── Housing Units Created (m_hu) — strong upward trend ──
    (m_hu, p_housing,  '2022','Q1','2022-03-31', 15,'ON_TRACK'),
    (m_hu, p_housing,  '2022','Q2','2022-06-30', 29,'ON_TRACK'),
    (m_hu, p_housing,  '2022','Q3','2022-09-30', 44,'ON_TRACK'),
    (m_hu, p_housing,  '2022','Q4','2022-12-31', 58,'ON_TRACK'),
    (m_hu, p_housing,  '2023','Q1','2023-03-31', 19,'ON_TRACK'),
    (m_hu, p_housing,  '2023','Q2','2023-06-30', 41,'ON_TRACK'),
    (m_hu, p_housing,  '2023','Q3','2023-09-30', 68,'ON_TRACK'),
    (m_hu, p_housing,  '2023','Q4','2023-12-31', 95,'ON_TRACK'),
    (m_hu, p_housing,  '2024','Q1','2024-03-31', 28,'ON_TRACK'),
    (m_hu, p_housing,  '2024','Q2','2024-06-30', 61,'ON_TRACK'),
    # ── Persons Housed (m_hp) — strong performer ──
    (m_hp, p_housing,  '2022','Q1','2022-03-31', 52,'AT_RISK'),
    (m_hp, p_housing,  '2022','Q2','2022-06-30', 98,'ON_TRACK'),
    (m_hp, p_housing,  '2022','Q3','2022-09-30',145,'ON_TRACK'),
    (m_hp, p_housing,  '2022','Q4','2022-12-31',198,'ON_TRACK'),
    (m_hp, p_housing,  '2023','Q1','2023-03-31', 65,'ON_TRACK'),
    (m_hp, p_housing,  '2023','Q2','2023-06-30',142,'ON_TRACK'),
    (m_hp, p_housing,  '2023','Q3','2023-09-30',218,'ON_TRACK'),
    (m_hp, p_housing,  '2023','Q4','2023-12-31',302,'ON_TRACK'),
    (m_hp, p_housing,  '2024','Q1','2024-03-31', 72,'ON_TRACK'),
    (m_hp, p_housing,  '2024','Q2','2024-06-30',158,'ON_TRACK'),
    # ── Adults Entered Employment (m_j) — AT_RISK, behind pace ──
    (m_j,  p_workforce,'2022','Q1','2022-03-31', 38,'ON_TRACK'),
    (m_j,  p_workforce,'2022','Q2','2022-06-30', 71,'ON_TRACK'),
    (m_j,  p_workforce,'2022','Q3','2022-09-30',108,'ON_TRACK'),
    (m_j,  p_workforce,'2022','Q4','2022-12-31',148,'ON_TRACK'),
    (m_j,  p_workforce,'2023','Q1','2023-03-31', 35,'AT_RISK'),
    (m_j,  p_workforce,'2023','Q2','2023-06-30', 68,'AT_RISK'),
    (m_j,  p_workforce,'2023','Q3','2023-09-30', 98,'AT_RISK'),
    (m_j,  p_workforce,'2023','Q4','2023-12-31',131,'AT_RISK'),
    (m_j,  p_workforce,'2024','Q1','2024-03-31', 52,'AT_RISK'),
    (m_j,  p_workforce,'2024','Q2','2024-06-30',118,'AT_RISK'),
    # ── Median Wage at Placement (m_w) — steady improvement ──
    (m_w,  p_workforce,'2022','Q1','2022-03-31',6200,'AT_RISK'),
    (m_w,  p_workforce,'2022','Q2','2022-06-30',6450,'AT_RISK'),
    (m_w,  p_workforce,'2022','Q3','2022-09-30',6800,'ON_TRACK'),
    (m_w,  p_workforce,'2022','Q4','2022-12-31',7050,'ON_TRACK'),
    (m_w,  p_workforce,'2023','Q1','2023-03-31',6900,'ON_TRACK'),
    (m_w,  p_workforce,'2023','Q2','2023-06-30',7150,'ON_TRACK'),
    (m_w,  p_workforce,'2023','Q3','2023-09-30',7400,'ON_TRACK'),
    (m_w,  p_workforce,'2023','Q4','2023-12-31',7650,'ON_TRACK'),
    (m_w,  p_workforce,'2024','Q1','2024-03-31',7100,'ON_TRACK'),
    (m_w,  p_workforce,'2024','Q2','2024-06-30',7350,'ON_TRACK'),
    # ── Employment Retention (m_r) — slightly below target ──
    (m_r,  p_workforce,'2022','H1','2022-06-30', 69,'AT_RISK'),
    (m_r,  p_workforce,'2022','H2','2022-12-31', 72,'AT_RISK'),
    (m_r,  p_workforce,'2023','H1','2023-06-30', 71,'AT_RISK'),
    (m_r,  p_workforce,'2023','H2','2023-12-31', 75,'ON_TRACK'),
    (m_r,  p_workforce,'2024','H1','2024-06-30', 74,'AT_RISK'),
    # ── Students Proficient in Math (m_pr) — below target, worsening ──
    (m_pr, p_education,'2022','FY','2022-06-30', 52,'OFF_TRACK'),
    (m_pr, p_education,'2023','FY','2023-06-30', 55,'AT_RISK'),
    (m_pr, p_education,'2024','FY','2024-06-30', 59,'AT_RISK'),
    # ── Graduation Rate Special Ed (m_gr) — improving trend ──
    (m_gr, p_education,'2022','FY','2022-06-30', 76,'AT_RISK'),
    (m_gr, p_education,'2023','FY','2023-06-30', 80,'ON_TRACK'),
    (m_gr, p_education,'2024','FY','2024-06-30', 83,'ON_TRACK'),
    # ── Average Daily Attendance (m_at) — strong and stable ──
    (m_at, p_education,'2022','Q1','2022-03-31', 88.5,'ON_TRACK'),
    (m_at, p_education,'2022','Q2','2022-06-30', 87.8,'ON_TRACK'),
    (m_at, p_education,'2022','Q3','2022-09-30', 89.2,'ON_TRACK'),
    (m_at, p_education,'2022','Q4','2022-12-31', 90.1,'ON_TRACK'),
    (m_at, p_education,'2023','Q1','2023-03-31', 90.5,'ON_TRACK'),
    (m_at, p_education,'2023','Q2','2023-06-30', 89.8,'ON_TRACK'),
    (m_at, p_education,'2023','Q3','2023-09-30', 91.0,'ON_TRACK'),
    (m_at, p_education,'2023','Q4','2023-12-31', 91.8,'ON_TRACK'),
    (m_at, p_education,'2024','Q1','2024-03-31', 91.2,'ON_TRACK'),
    (m_at, p_education,'2024','Q2','2024-06-30', 89.8,'ON_TRACK'),
]
for r in actuals:
    run(f"{r[0][:6]} {r[3]}", f'''INSERT INTO "{S}"."I_OutcomeActual"
        ("actual_id","metric_id","program_id","fiscal_year","period","measurement_date",
         "actual_value","performance_status","created_by")
        VALUES(?,?,?,?,?,?,?,?,'seed')''', [id28()] + list(r))

# ── Cost to Serve — 6 quarters for cost-effectiveness charts ─────────────────
print("── Cost to Serve (6 quarters) ──")
cost_rows = [
    # program, fy, period, service_unit, total, direct, indirect, units, cpu, benchmark
    # Housing — costs falling (efficiency improving)
    (p_housing,  '2022','Q4','Housing Unit',    2600000,2340000,260000, 95, 27368,22000),
    (p_housing,  '2023','Q2','Housing Unit',    2450000,2205000,245000,108, 22685,22000),
    (p_housing,  '2023','Q4','Housing Unit',    2380000,2142000,238000,118, 20169,22000),
    (p_housing,  '2024','Q2','Housing Unit',    2220000,1998000,222000,120, 18500,22000),
    # Workforce — costs elevated (concern)
    (p_workforce,'2022','Q4','Job Placement',   1350000,1215000,135000,210,  6429, 5800),
    (p_workforce,'2023','Q2','Job Placement',   1280000,1152000,128000,240,  5333, 5800),
    (p_workforce,'2023','Q4','Job Placement',   1240000,1116000,124000,265,  4679, 5800),
    (p_workforce,'2024','Q2','Job Placement',   1176000,1058400,117600,280,  4200, 5800),
    # Education — consistently efficient
    (p_education,'2022','Q4','Student Served',  3100000,2790000,310000,1180, 2627, 2200),
    (p_education,'2023','Q2','Student Served',  2960000,2664000,296000,1280, 2313, 2200),
    (p_education,'2023','Q4','Student Served',  2840000,2556000,284000,1380, 2058, 2200),
    (p_education,'2024','Q2','Student Served',  2682500,2414250,268250,1450, 1850, 2200),
]
for r in cost_rows:
    run(r[3]+' '+r[2], f'''INSERT INTO "{S}"."I_CostToServeUnit"
        ("cost_unit_id","program_id","fiscal_year","period","service_unit","total_cost",
         "direct_cost","indirect_cost","units_delivered","cost_per_unit","benchmark_cost","created_by")
        VALUES(?,?,?,?,?,?,?,?,?,?,?,'seed')''', [id28()] + list(r))

# ── Fund Balance Classifications ──────────────────────────────────────────────
print("── Fund Balance Classifications ──")
for r in [
    (f_general,'2024','Q2',0,      0,      2000000,3000000,7800000,12800000,'GASB 54 Para 34'),
    (f_cdbg,   '2024','Q2',0,      2400000,0,      0,      0,      2400000, 'GASB 54 Para 22'),
    (f_title1, '2024','Q2',0,      3250000,0,      0,      0,      3250000, 'GASB 54 Para 22'),
    (f_wf,     '2024','Q2',0,      1380000,0,      0,      0,      1380000, 'GASB 54 Para 22'),
    (f_cap,    '2024','Q2',0,      0,      5180000,0,      0,      5180000, 'GASB 54 Para 26'),
]:
    run(r[0][:8], f'''INSERT INTO "{S}"."I_FundBalanceClassification"
        ("classification_id","fund_id","fiscal_year","period","nonspendable_amount","restricted_amount",
         "committed_amount","assigned_amount","unassigned_amount","total_fund_balance",
         "gasb_statement_ref","as_of_date","created_by")
        VALUES(?,?,?,?,?,?,?,?,?,?,?,'2024-06-30','seed')''', [id28()] + list(r))

# ── Scenario Versions ─────────────────────────────────────────────────────────
print("── Scenario Versions ──")
for r in [
    (sc_base,'FY2024 Base Budget',       'BASE',        '2024',f_general,'APPROVED'),
    (sc_opt, 'FY2024 Optimistic +8%',    'OPTIMISTIC',  '2024',f_general,'DRAFT'),
    (sc_cons,'FY2024 Conservative -5%',  'CONSERVATIVE','2024',f_general,'APPROVED'),
]:
    run(r[1], f'''INSERT INTO "{S}"."I_ScenarioVersion"
        ("scenario_id","scenario_name","scenario_type","fiscal_year","fund_id","status","created_by")
        VALUES(?,?,?,?,?,?,'seed')''', list(r))

# ── Forecast Entries ──────────────────────────────────────────────────────────
print("── Forecast Entries ──")
for i,r in enumerate([
    # sc, fund, grant, program, fy, period, type, orig_budget, rev_budget, actuals, encumb,
    #   forecast_amt, yep, var_$, var_%, confidence, basis, early_warn, underspend_risk
    (sc_base,f_cdbg, g_cdbg, p_housing,  '2024','Q1','EXPENDITURE',1850000,1850000, 412000,0,      480000, 1850000,0,    0.0,'85','HISTORICAL_TREND','N','NONE'),
    (sc_base,f_cdbg, g_cdbg, p_housing,  '2024','Q2','EXPENDITURE',1850000,1850000, 890000,45000,  980000, 1850000,0,    0.0,'88','HISTORICAL_TREND','N','NONE'),
    (sc_base,f_title1,g_title1,p_education,'2024','Q1','EXPENDITURE',2400000,2400000,520000,0,      600000, 2400000,0,   0.0,'90','HISTORICAL_TREND','N','NONE'),
    (sc_base,f_title1,g_esser,p_education,'2024','Q2','EXPENDITURE',3100000,3100000,1800000,120000,2100000,3100000,0,   0.0,'82','HISTORICAL_TREND','Y','MEDIUM'),
    (sc_base,f_wf,   g_wioa, p_workforce,'2024','Q1','EXPENDITURE',1200000,1200000, 220000,0,      280000, 1200000,-80000,-6.7,'75','REGRESSION','Y','HIGH'),
    (sc_base,f_wf,   g_wioa, p_workforce,'2024','Q2','EXPENDITURE',1200000,1200000, 480000,30000,  560000, 1200000,-40000,-3.3,'78','REGRESSION','N','MEDIUM'),
    (sc_base,f_general,g_slfrf,p_housing,'2024','Q1','EXPENDITURE',4500000,4500000, 980000,0,     1100000, 4500000,0,   0.0,'92','HISTORICAL_TREND','N','NONE'),
    (sc_base,f_general,g_slfrf,p_housing,'2024','Q2','EXPENDITURE',4500000,4500000,2200000,150000,2500000, 4500000,0,   0.0,'88','HISTORICAL_TREND','N','NONE'),
    (sc_cons,f_cdbg, g_cdbg, p_housing,  '2024','Q2','EXPENDITURE',1850000,1757500, 890000,45000,  930000, 1757500,-92500,-5.0,'75','MANAGEMENT_INPUT','N','LOW'),
    (sc_opt, f_title1,g_title1,p_education,'2024','Q2','EXPENDITURE',2400000,2592000,520000,0,     640000, 2592000,192000,8.0,'70','MANAGEMENT_INPUT','N','NONE'),
]):
    run(f"Forecast {i+1}", f'''INSERT INTO "{S}"."I_ForecastEntry"
        ("forecast_id","scenario_id","fund_id","grant_id","program_id","fiscal_year","period","forecast_type",
         "original_budget","revised_budget","actuals_to_date","encumbrances","forecast_amount",
         "year_end_projection","variance_from_budget","variance_pct","confidence_level","forecast_basis",
         "early_warning_flag","underspend_risk","created_by")
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'seed')''', [id28()] + list(r))

# ── Audit Log ─────────────────────────────────────────────────────────────────
print("── Audit Log ──")
for r in [
    ('I_GrantMaster',  g_cdbg,   'INSERT','admin',  'admin@sierradigitalinc.com'),
    ('I_Subaward',     id28(),   'INSERT','system', 'grants@sierradigitalinc.com'),
    ('I_GrantMaster',  g_wioa,   'UPDATE','admin',  'admin@sierradigitalinc.com'),
    ('I_Subrecipient', sr_valley,'UPDATE','system', 'grants@sierradigitalinc.com'),
    ('I_Subaward',     id28(),   'UPDATE','admin',  'admin@sierradigitalinc.com'),
    ('I_CorrectiveAction',id28(),'INSERT','auditor','auditor@sierradigitalinc.com'),
]:
    run(r[2]+' '+r[0], f'''INSERT INTO "{S}"."I_AuditLog"
        ("log_id","entity_type","entity_id","event_type","user_id","user_name","ip_address")
        VALUES(?,?,?,?,?,?,'127.0.0.1')''', [id50()] + list(r))

# ════════════════════════════════════════════════════════════════════════════
# SPRINT 9 — Procurement & AP Intelligence
# ════════════════════════════════════════════════════════════════════════════
print("\n── Sprint 9: Procurement & AP ──")

# Drop & recreate tables
for vw in ['V_APAging','V_ProcurementPipeline','V_ContractUtilization']:
    try: cur.execute(f'DROP VIEW "{S}"."{vw}"'); conn.commit()
    except: pass
for tbl in ['I_Invoice','I_PurchaseOrder','I_Contract','I_Vendor']:
    try: cur.execute(f'DROP TABLE "{S}"."{tbl}"'); conn.commit()
    except: pass

create_table("CREATE I_Vendor", f'''
CREATE COLUMN TABLE "{S}"."I_Vendor" (
  "vendor_id"             VARCHAR(20)    PRIMARY KEY,
  "vendor_name"           NVARCHAR(100)  NOT NULL,
  "vendor_type"           VARCHAR(30),
  "tin"                   VARCHAR(11),
  "debarment_status"      VARCHAR(20),
  "risk_score"            INTEGER,
  "diversity_category"    VARCHAR(30),
  "insurance_expiry"      DATE,
  "certification_status"  VARCHAR(20),
  "city"                  NVARCHAR(50),
  "state"                 VARCHAR(2)
)''')

v_citywater  = id20(); v_metro    = id20(); v_digital  = id20()
v_community  = id20(); v_infra    = id20(); v_tech     = id20()
v_green      = id20(); v_horizon  = id20(); v_apex     = id20()
v_summit     = id20()

for r in [
    (v_citywater, 'City Water Systems Inc',          'SUPPLIER',    '74-1234567', 'CLEAR',          15, 'NONE',    '2026-06-30', 'CURRENT',  'Austin',       'TX'),
    (v_metro,     'Metro Construction Group',         'CONTRACTOR',  '47-2345678', 'CLEAR',          32, 'MBE',     '2025-09-30', 'CURRENT',  'Houston',      'TX'),
    (v_digital,   'Digital Services LLC',             'IT',          '83-3456789', 'CLEAR',          22, 'WBE',     '2025-12-31', 'CURRENT',  'Dallas',       'TX'),
    (v_community, 'Community Health Partners',        'NONPROFIT',   '55-4567890', 'CLEAR',          10, 'NONE',    '2026-03-31', 'CURRENT',  'San Antonio',  'TX'),
    (v_infra,     'Infra Solutions Corp',             'CONTRACTOR',  '61-5678901', 'PENDING_REVIEW', 68, 'NONE',    '2025-06-15', 'EXPIRING', 'Austin',       'TX'),
    (v_tech,      'TechForward Analytics',            'CONSULTANT',  '92-6789012', 'CLEAR',          41, 'SDVOSB',  '2026-01-31', 'CURRENT',  'Round Rock',   'TX'),
    (v_green,     'GreenPath Environmental',          'CONSULTANT',  '38-7890123', 'CLEAR',          18, 'NONE',    '2026-08-31', 'CURRENT',  'Austin',       'TX'),
    (v_horizon,   'Horizon Staffing Solutions',       'CONTRACTOR',  '79-8901234', 'FLAGGED',        85, 'NONE',    '2024-11-30', 'EXPIRED',  'Phoenix',      'AZ'),
    (v_apex,      'Apex Engineering & Design',        'CONTRACTOR',  '43-9012345', 'CLEAR',          29, 'HUBZone', '2025-11-30', 'CURRENT',  'Fort Worth',   'TX'),
    (v_summit,    'Summit Technology Group',          'IT',          '67-0123456', 'CLEAR',          55, 'MBE',     '2025-08-31', 'EXPIRING', 'Austin',       'TX'),
]:
    run(r[1][:20], f'''INSERT INTO "{S}"."I_Vendor"
        ("vendor_id","vendor_name","vendor_type","tin","debarment_status","risk_score",
         "diversity_category","insurance_expiry","certification_status","city","state")
        VALUES(?,?,?,?,?,?,?,?,?,?,?)''', list(r))

create_table("CREATE I_Contract", f'''
CREATE COLUMN TABLE "{S}"."I_Contract" (
  "contract_id"           VARCHAR(20)    PRIMARY KEY,
  "vendor_id"             VARCHAR(20),
  "grant_id"              VARCHAR(20),
  "contract_number"       VARCHAR(30),
  "contract_title"        NVARCHAR(100),
  "contract_type"         VARCHAR(30),
  "procurement_method"    VARCHAR(30),
  "award_date"            DATE,
  "start_date"            DATE,
  "end_date"              DATE,
  "original_amount"       DECIMAL(15,2),
  "amended_amount"        DECIMAL(15,2),
  "encumbered_amount"     DECIMAL(15,2),
  "paid_to_date"          DECIMAL(15,2),
  "contract_status"       VARCHAR(20),
  "fund_id"               VARCHAR(20)
)''')

c1=id20();c2=id20();c3=id20();c4=id20();c5=id20()
c6=id20();c7=id20();c8=id20();c9=id20();c10=id20();c11=id20();c12=id20()

from datetime import timedelta
today = date.today()
exp_soon1 = (today + timedelta(days=35)).isoformat()
exp_soon2 = (today + timedelta(days=50)).isoformat()

for r in [
    (c1,  v_citywater, None,    'CON-2024-001','Water Infrastructure Maintenance',    'SERVICES',      'COMPETITIVE_BID',  '2024-01-15','2024-02-01','2025-01-31',  350000, 350000, 280000, 245000,'ACTIVE',    f_general),
    (c2,  v_metro,     g_cdbg,  'CON-2024-002','Community Center Renovation',          'CONSTRUCTION',  'COMPETITIVE_BID',  '2024-02-01','2024-03-01','2025-02-28',  980000, 1050000,840000, 620000,'ACTIVE',    f_cdbg),
    (c3,  v_digital,   None,    'CON-2024-003','ERP System Support & Maintenance',     'IT',            'COMPETITIVE_BID',  '2023-11-01','2024-01-01','2025-12-31',  220000, 220000, 176000, 165000,'ACTIVE',    f_general),
    (c4,  v_community, g_cdbg,  'CON-2024-004','Public Health Outreach Services',      'PROFESSIONAL',  'COMPETITIVE_BID',  '2024-03-15','2024-04-01',exp_soon1,     150000, 150000, 135000, 112000,'EXPIRING',  f_cdbg),
    (c5,  v_infra,     None,    'CON-2024-005','Road Resurfacing Phase II',            'CONSTRUCTION',  'COMPETITIVE_BID',  '2024-04-01','2024-05-01','2025-04-30', 2500000,2500000,1875000,1400000,'ACTIVE',    f_cap),
    (c6,  v_tech,      None,    'CON-2024-006','Data Analytics Consulting',            'PROFESSIONAL',  'SOLE_SOURCE',      '2024-01-20','2024-02-01','2025-01-31',   85000,  85000,  68000,  51000,'ACTIVE',    f_general),
    (c7,  v_green,     g_cdbg,  'CON-2024-007','Environmental Assessment Services',    'PROFESSIONAL',  'COMPETITIVE_BID',  '2024-05-01','2024-06-01',exp_soon2,      62000,  62000,  55800,  46500,'EXPIRING',  f_cdbg),
    (c8,  v_horizon,   None,    'CON-2024-008','Temporary Staffing Services',          'SERVICES',      'SOLE_SOURCE',      '2024-03-01','2024-03-15','2024-09-30',  125000, 125000,      0,  87500,'SUSPENDED', f_general),
    (c9,  v_apex,      None,    'CON-2024-009','Bridge Inspection & Assessment',       'CONSTRUCTION',  'COMPETITIVE_BID',  '2024-06-01','2024-07-01','2025-06-30',  450000, 495000, 371250, 198000,'ACTIVE',    f_cap),
    (c10, v_summit,    None,    'CON-2024-010','Cybersecurity Assessment',             'IT',            'COOPERATIVE',      '2024-04-15','2024-05-01','2025-04-30',   78000,  78000,  62400,  39000,'ACTIVE',    f_general),
    (c11, v_metro,     None,    'CON-2024-011','Park Facilities Construction',         'CONSTRUCTION',  'COMPETITIVE_BID',  '2023-09-01','2023-10-01','2024-03-31', 1200000,1200000,1200000,1150000,'CLOSED',    f_cap),
    (c12, v_digital,   None,    'CON-2024-012','Emergency IT Services',               'IT',            'EMERGENCY',        '2024-07-01','2024-07-01','2024-09-30',   45000,  45000,  45000,  22500,'EXPIRED',   f_general),
]:
    run(r[3], f'''INSERT INTO "{S}"."I_Contract"
        ("contract_id","vendor_id","grant_id","contract_number","contract_title","contract_type",
         "procurement_method","award_date","start_date","end_date","original_amount","amended_amount",
         "encumbered_amount","paid_to_date","contract_status","fund_id")
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''', list(r))

create_table("CREATE I_PurchaseOrder", f'''
CREATE COLUMN TABLE "{S}"."I_PurchaseOrder" (
  "po_id"              VARCHAR(20)  PRIMARY KEY,
  "po_number"          VARCHAR(20),
  "contract_id"        VARCHAR(20),
  "vendor_id"          VARCHAR(20),
  "fund_id"            VARCHAR(20),
  "grant_id"           VARCHAR(20),
  "po_date"            DATE,
  "amount"             DECIMAL(15,2),
  "received_amount"    DECIMAL(15,2),
  "invoiced_amount"    DECIMAL(15,2),
  "po_status"          VARCHAR(20),
  "department"         NVARCHAR(50),
  "req_to_po_days"     INTEGER
)''')

po_ids = [id20() for _ in range(15)]
for r in [
    (po_ids[0],  'PO-2024-0001', c1,   v_citywater, f_general, None,    '2024-02-15',  87500, 87500,  87500, 'COMPLETE', 'Public Works',               5),
    (po_ids[1],  'PO-2024-0002', c1,   v_citywater, f_general, None,    '2024-04-01',  87500, 87500,  87500, 'COMPLETE', 'Public Works',               4),
    (po_ids[2],  'PO-2024-0003', c2,   v_metro,     f_cdbg,    g_cdbg,  '2024-03-15', 310000,155000, 155000, 'PARTIAL',  'Community Development',     12),
    (po_ids[3],  'PO-2024-0004', c2,   v_metro,     f_cdbg,    g_cdbg,  '2024-06-01', 310000,      0,      0, 'OPEN',     'Community Development',      8),
    (po_ids[4],  'PO-2024-0005', c3,   v_digital,   f_general, None,    '2024-01-10',  55000, 55000,  55000, 'COMPLETE', 'IT',                          3),
    (po_ids[5],  'PO-2024-0006', c3,   v_digital,   f_general, None,    '2024-04-10',  55000, 27500,  27500, 'PARTIAL',  'IT',                          6),
    (po_ids[6],  'PO-2024-0007', c4,   v_community, f_cdbg,    g_cdbg,  '2024-04-15',  37500, 37500,  37500, 'COMPLETE', 'Health & Human Services',    18),
    (po_ids[7],  'PO-2024-0008', c4,   v_community, f_cdbg,    g_cdbg,  '2024-07-01',  37500, 18750,  18750, 'PARTIAL',  'Health & Human Services',    22),
    (po_ids[8],  'PO-2024-0009', c5,   v_infra,     f_cap,     None,    '2024-05-20', 500000,500000, 500000, 'COMPLETE', 'Public Works',                7),
    (po_ids[9],  'PO-2024-0010', c5,   v_infra,     f_cap,     None,    '2024-07-15', 500000,250000, 250000, 'PARTIAL',  'Public Works',                9),
    (po_ids[10], 'PO-2024-0011', c6,   v_tech,      f_general, None,    '2024-02-10',  42500, 42500,  42500, 'COMPLETE', 'Administration',             35),
    (po_ids[11], 'PO-2024-0012', None, v_summit,    f_general, None,    '2024-05-15',  19500, 9750,   9750,  'PARTIAL',  'IT',                         28),
    (po_ids[12], 'PO-2024-0013', c9,   v_apex,      f_cap,     None,    '2024-07-20', 198000,198000, 198000, 'COMPLETE', 'Public Works',                2),
    (po_ids[13], 'PO-2024-0014', c10,  v_summit,    f_general, None,    '2024-05-05',  39000, 39000,  39000, 'COMPLETE', 'IT',                         45),
    (po_ids[14], 'PO-2024-0015', None, v_green,     f_general, None,    '2024-06-01',  18500,     0,      0, 'OPEN',     'Administration',             14),
]:
    run(r[1], f'''INSERT INTO "{S}"."I_PurchaseOrder"
        ("po_id","po_number","contract_id","vendor_id","fund_id","grant_id","po_date",
         "amount","received_amount","invoiced_amount","po_status","department","req_to_po_days")
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)''', list(r))

create_table("CREATE I_Invoice", f'''
CREATE COLUMN TABLE "{S}"."I_Invoice" (
  "invoice_id"         VARCHAR(20)  PRIMARY KEY,
  "po_id"              VARCHAR(20),
  "vendor_id"          VARCHAR(20),
  "invoice_number"     VARCHAR(30),
  "invoice_date"       DATE,
  "received_date"      DATE,
  "approved_date"      DATE,
  "payment_date"       DATE,
  "amount"             DECIMAL(15,2),
  "invoice_status"     VARCHAR(20),
  "aging_days"         INTEGER,
  "fund_id"            VARCHAR(20),
  "is_duplicate_risk"  VARCHAR(1)
)''')

inv_ids = [id20() for _ in range(20)]
for r in [
    (inv_ids[0],  po_ids[0],  v_citywater, 'INV-CWS-0101', '2024-02-28','2024-03-02','2024-03-10','2024-03-20',  87500,'PAID',     142, f_general, 'N'),
    (inv_ids[1],  po_ids[1],  v_citywater, 'INV-CWS-0102', '2024-04-30','2024-05-02','2024-05-10','2024-05-22',  87500,'PAID',      82, f_general, 'N'),
    (inv_ids[2],  po_ids[2],  v_metro,     'INV-MCG-0201', '2024-04-15','2024-04-17','2024-04-25','2024-05-05', 155000,'PAID',      77, f_cdbg,    'N'),
    (inv_ids[3],  po_ids[2],  v_metro,     'INV-MCG-0202', '2024-07-01','2024-07-03',None,         None,         78000,'OVERDUE',   95, f_cdbg,    'N'),
    (inv_ids[4],  po_ids[4],  v_digital,   'INV-DS-0301',  '2024-01-31','2024-02-02','2024-02-10','2024-02-20',  55000,'PAID',     154, f_general, 'N'),
    (inv_ids[5],  po_ids[5],  v_digital,   'INV-DS-0302',  '2024-05-15','2024-05-17','2024-05-25','2024-06-05',  27500,'PAID',      47, f_general, 'N'),
    (inv_ids[6],  po_ids[6],  v_community, 'INV-CHP-0401', '2024-05-31','2024-06-02','2024-06-10','2024-06-20',  37500,'PAID',      31, f_cdbg,    'N'),
    (inv_ids[7],  po_ids[7],  v_community, 'INV-CHP-0402', '2024-08-01','2024-08-03',None,         None,         18750,'OVERDUE',   65, f_cdbg,    'N'),
    (inv_ids[8],  po_ids[8],  v_infra,     'INV-INF-0501', '2024-07-15','2024-07-17','2024-07-25','2024-08-05', 500000,'PAID',      17, f_cap,     'N'),
    (inv_ids[9],  po_ids[9],  v_infra,     'INV-INF-0502', '2024-08-31','2024-09-02',None,         None,        250000,'PENDING',   34, f_cap,     'N'),
    (inv_ids[10], po_ids[10], v_tech,      'INV-TFA-0601', '2024-02-28','2024-03-01','2024-03-08','2024-03-18',  42500,'PAID',     124, f_general, 'N'),
    (inv_ids[11], po_ids[11], v_summit,    'INV-STG-0701', '2024-06-15','2024-06-17',None,         None,          9750,'APPROVED',  47, f_general, 'N'),
    (inv_ids[12], po_ids[12], v_apex,      'INV-APX-0801', '2024-08-15','2024-08-17','2024-08-24','2024-09-03', 198000,'PAID',      17, f_cap,     'N'),
    (inv_ids[13], po_ids[13], v_summit,    'INV-STG-0901', '2024-05-31','2024-06-02','2024-06-10','2024-06-20',  39000,'PAID',      31, f_general, 'N'),
    (inv_ids[14], None,       v_horizon,   'INV-HOR-1001', '2024-04-01','2024-04-03',None,         None,          8750,'OVERDUE',  183, f_general, 'N'),
    (inv_ids[15], None,       v_horizon,   'INV-HOR-1002', '2024-04-01','2024-04-04',None,         None,          8750,'DISPUTED', 183, f_general, 'Y'),
    (inv_ids[16], po_ids[3],  v_metro,     'INV-MCG-0203', '2024-09-01','2024-09-03',None,         None,         95000,'PENDING',   30, f_cdbg,    'N'),
    (inv_ids[17], None,       v_infra,     'INV-INF-0503', '2024-06-01','2024-06-02',None,         None,         45000,'DISPUTED',  91, f_cap,     'N'),
    (inv_ids[18], None,       v_digital,   'INV-DS-0303',  '2024-07-15','2024-07-16','2024-07-22','2024-08-01',  12500,'PAID',      48, f_general, 'N'),
    (inv_ids[19], po_ids[14], v_green,     'INV-GPE-1101', '2024-06-30','2024-07-01',None,         None,         18500,'OVERDUE',   93, f_general, 'N'),
]:
    run(r[3], f'''INSERT INTO "{S}"."I_Invoice"
        ("invoice_id","po_id","vendor_id","invoice_number","invoice_date","received_date",
         "approved_date","payment_date","amount","invoice_status","aging_days","fund_id","is_duplicate_risk")
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)''', list(r))

# Views
run("V_ProcurementPipeline", f'''
CREATE OR REPLACE VIEW "{S}"."V_ProcurementPipeline" AS
SELECT
  po."po_id", po."po_number", po."department", po."po_date",
  po."amount", po."po_status", po."req_to_po_days",
  v."vendor_name", v."vendor_type", v."risk_score",
  c."contract_number", c."procurement_method", c."contract_status",
  f."fund_name",
  COUNT(i."invoice_id") AS INVOICE_COUNT,
  SUM(i."amount") AS INVOICED_TOTAL,
  SUM(CASE WHEN i."invoice_status" = 'OVERDUE' THEN 1 ELSE 0 END) AS OVERDUE_INVOICES
FROM "{S}"."I_PurchaseOrder" po
LEFT JOIN "{S}"."I_Vendor"   v ON v."vendor_id"   = po."vendor_id"
LEFT JOIN "{S}"."I_Contract" c ON c."contract_id" = po."contract_id"
LEFT JOIN "{S}"."I_Fund"     f ON f."fund_id"     = po."fund_id"
LEFT JOIN "{S}"."I_Invoice"  i ON i."po_id"       = po."po_id"
GROUP BY po."po_id", po."po_number", po."department", po."po_date",
  po."amount", po."po_status", po."req_to_po_days",
  v."vendor_name", v."vendor_type", v."risk_score",
  c."contract_number", c."procurement_method", c."contract_status",
  f."fund_name"''')

run("V_APAging", f'''
CREATE OR REPLACE VIEW "{S}"."V_APAging" AS
SELECT
  i."invoice_id", i."invoice_number", i."invoice_date", i."amount",
  i."invoice_status", i."aging_days", i."is_duplicate_risk",
  v."vendor_name", v."vendor_type",
  f."fund_name",
  CASE
    WHEN i."aging_days" <= 30 THEN 'CURRENT'
    WHEN i."aging_days" <= 60 THEN 'OVERDUE_30'
    WHEN i."aging_days" <= 90 THEN 'OVERDUE_60'
    ELSE 'OVERDUE_90PLUS'
  END AS AGING_BUCKET
FROM "{S}"."I_Invoice" i
LEFT JOIN "{S}"."I_Vendor" v ON v."vendor_id" = i."vendor_id"
LEFT JOIN "{S}"."I_Fund"   f ON f."fund_id"   = i."fund_id"
WHERE i."invoice_status" != 'PAID' ''')

run("V_ContractUtilization", f'''
CREATE OR REPLACE VIEW "{S}"."V_ContractUtilization" AS
SELECT
  c."contract_id", c."contract_number", c."contract_title",
  c."contract_type", c."procurement_method", c."contract_status",
  c."original_amount", c."amended_amount", c."paid_to_date",
  ROUND(c."paid_to_date" / NULLIF(c."amended_amount",0) * 100, 1) AS UTILIZATION_PCT,
  c."start_date", c."end_date",
  DAYS_BETWEEN(CURRENT_DATE, c."end_date") AS DAYS_TO_EXPIRY,
  v."vendor_name", v."vendor_type", v."risk_score", v."debarment_status", v."diversity_category",
  f."fund_name"
FROM "{S}"."I_Contract" c
LEFT JOIN "{S}"."I_Vendor" v ON v."vendor_id" = c."vendor_id"
LEFT JOIN "{S}"."I_Fund"   f ON f."fund_id"   = c."fund_id"''')

# ════════════════════════════════════════════════════════════════════════════
# SPRINT 10 — Finance & Budget Controller
# ════════════════════════════════════════════════════════════════════════════
print("\n── Sprint 10: Finance Controller ──")

for vw in ['V_BudgetVariance','V_CloseReadiness']:
    try: cur.execute(f'DROP VIEW "{S}"."{vw}"'); conn.commit()
    except: pass
for tbl in ['I_InterfundTransfer','I_CloseTask','I_JournalEntry','I_BudgetLine']:
    try: cur.execute(f'DROP TABLE "{S}"."{tbl}"'); conn.commit()
    except: pass

create_table("CREATE I_BudgetLine", f'''
CREATE COLUMN TABLE "{S}"."I_BudgetLine" (
  "budget_id"        VARCHAR(20)    PRIMARY KEY,
  "fund_id"          VARCHAR(20),
  "department"       NVARCHAR(50),
  "program_id"       VARCHAR(20),
  "fiscal_year"      VARCHAR(6),
  "account_code"     VARCHAR(20),
  "account_name"     NVARCHAR(100),
  "original_budget"  DECIMAL(15,2),
  "revised_budget"   DECIMAL(15,2),
  "encumbrances"     DECIMAL(15,2),
  "actuals"          DECIMAL(15,2),
  "budget_type"      VARCHAR(20)
)''')

depts = ['Public Works','Administration','Health & Human Services','Parks & Recreation','IT']
for r in [
    # dept,             fund,      program, fy,     acct_code, acct_name,                    orig_bud, rev_bud, encumb,  actuals,   btype
    ('Public Works',    f_general, None,    'FY2024','5100','Personnel Services',              1200000, 1200000,  180000,  920000,  'OPERATING'),
    ('Public Works',    f_cap,     None,    'FY2024','6100','Capital Infrastructure',         2500000, 2500000,  625000, 1400000,  'CAPITAL'),
    ('Public Works',    f_general, None,    'FY2024','5200','Operations & Maintenance',        480000,  480000,   72000,  385000,  'OPERATING'),
    ('Administration',  f_general, None,    'FY2024','5100','Personnel Services',              850000,  850000,  127500,  680000,  'OPERATING'),
    ('Administration',  f_general, None,    'FY2024','5300','Professional Services',           220000,  220000,   44000,  198000,  'OPERATING'),  # overrun potential
    ('Administration',  f_general, None,    'FY2024','5400','Technology & Software',           150000,  165000,   24750,  154000,  'OPERATING'),
    ('Health & Human Services', f_cdbg, None,'FY2024','5100','Personnel Services',             620000,  620000,   93000,  496000,  'GRANT'),
    ('Health & Human Services', f_cdbg, None,'FY2024','5500','Program Supplies',               180000,  180000,   27000,  162000,  'GRANT'),
    ('Health & Human Services', f_general,None,'FY2024','5200','Community Services',           390000,  390000,       0,  420000,  'OPERATING'),  # OVERRUN
    ('Parks & Recreation', f_general,None,  'FY2024','5100','Personnel Services',              510000,  510000,   76500,  408000,  'OPERATING'),
    ('Parks & Recreation', f_cap,  None,    'FY2024','6200','Park Facilities',                 750000,  825000,  247500,  330000,  'CAPITAL'),
    ('Parks & Recreation', f_general,None,  'FY2024','5200','Supplies & Equipment',            95000,   95000,    14250,   76000,  'OPERATING'),
    ('IT',              f_general, None,    'FY2024','5100','Personnel Services',              680000,  680000,  102000,  612000,  'OPERATING'),
    ('IT',              f_general, None,    'FY2024','5400','Software Licenses',               310000,  310000,   46500,  279000,  'OPERATING'),
    ('IT',              f_general, None,    'FY2024','5410','Hardware & Equipment',            240000,  240000,   84000,  192000,  'CAPITAL'),
    # FY2025 lines
    ('Public Works',    f_general, None,    'FY2025','5100','Personnel Services',             1300000, 1300000,       0,   82000,  'OPERATING'),
    ('Public Works',    f_cap,     None,    'FY2025','6100','Capital Infrastructure',         3200000, 3200000,  960000,  320000,  'CAPITAL'),
    ('Administration',  f_general, None,    'FY2025','5100','Personnel Services',              920000,  920000,       0,   61000,  'OPERATING'),
    ('Health & Human Services', f_cdbg, None,'FY2025','5100','Personnel Services',             660000,  660000,       0,   55000,  'GRANT'),
    ('IT',              f_general, None,    'FY2025','5400','Software Licenses',               350000,  350000,  350000,  385000,  'WORKFORCE'),  # OVERRUN
]:
    run(r[5][:20], f'''INSERT INTO "{S}"."I_BudgetLine"
        ("budget_id","fund_id","department","program_id","fiscal_year","account_code","account_name",
         "original_budget","revised_budget","encumbrances","actuals","budget_type")
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?)''', [id20(), r[1], r[0], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10]])

create_table("CREATE I_JournalEntry", f'''
CREATE COLUMN TABLE "{S}"."I_JournalEntry" (
  "journal_id"      VARCHAR(20)    PRIMARY KEY,
  "entry_date"      DATE,
  "fund_id"         VARCHAR(20),
  "account_code"    VARCHAR(20),
  "account_name"    NVARCHAR(100),
  "debit_amount"    DECIMAL(15,2),
  "credit_amount"   DECIMAL(15,2),
  "description"     NVARCHAR(200),
  "entered_by"      NVARCHAR(50),
  "entry_status"    VARCHAR(20),
  "period"          VARCHAR(7),
  "is_unusual"      VARCHAR(1)
)''')

for r in [
    ('2025-03-31', f_general,'5100','Personnel Services',          158000,      0,   'March payroll — Public Works',              'jsmith',   'POSTED',    '2025-03','N'),
    ('2025-03-31', f_general,'5100','Personnel Services',          142000,      0,   'March payroll — Administration',            'jsmith',   'POSTED',    '2025-03','N'),
    ('2025-03-31', f_cdbg,   '5100','Personnel Services',          103000,      0,   'March payroll — Health & HHS CDBG',         'jsmith',   'POSTED',    '2025-03','N'),
    ('2025-03-15', f_general,'5200','Operations & Maintenance',     32500,      0,   'Quarterly maintenance contract payment',    'agarcia',  'POSTED',    '2025-03','N'),
    ('2025-03-20', f_cap,    '6100','Capital Infrastructure',      500000,      0,   'Metro Construction Group — PO drawdown',    'agarcia',  'POSTED',    '2025-03','Y'),
    ('2025-03-28', f_general,'5300','Professional Services',        85000,      0,   'TechForward analytics Q1 invoice',          'agarcia',  'POSTED',    '2025-03','N'),
    ('2025-03-10', f_cdbg,   '5500','Program Supplies',             27000,      0,   'Health program supplies — bulk purchase',   'mpatel',   'POSTED',    '2025-03','N'),
    ('2025-03-25', f_general,'5400','Technology & Software',        92000,      0,   'Annual enterprise software renewal',        'mpatel',   'EXCEPTION', '2025-03','Y'),
    ('2025-03-29', f_general,'9000','Suspense Account',             15000,      0,   'Unclassified expenditure — under review',   'system',   'EXCEPTION', '2025-03','Y'),
    ('2025-03-01', f_general,'5100','Personnel Services',               0, 158000,  'Payroll accrual reversal — Feb correction', 'jsmith',   'REVERSED',  '2025-02','N'),
    ('2025-03-05', f_general,'4100','Tax Revenue',                      0, 245000,  'Property tax collection March',             'system',   'POSTED',    '2025-03','N'),
    ('2025-03-12', f_cdbg,   '4200','Grant Revenue',                    0, 310000,  'HUD CDBG Q1 drawdown received',             'system',   'POSTED',    '2025-03','N'),
    ('2025-03-18', f_general,'2100','Accounts Payable',             78000,      0,   'AP batch payment run — 12 vendors',         'agarcia',  'POSTED',    '2025-03','N'),
    ('2025-03-22', f_cap,    '6200','Park Facilities',             110000,      0,   'Park renovation Phase 1 milestone',         'mpatel',   'POSTED',    '2025-03','N'),
    ('2025-03-31', f_general,'9900','Year-End Adjustment',         450000,      0,   'Q1 year-end encumbrance release',           'controller','PENDING',  '2025-03','N'),
    ('2025-03-30', f_general,'5200','Operations & Maintenance',     18500,      0,   'Emergency repair — Water main break',       'agarcia',  'POSTED',    '2025-03','N'),
    ('2025-02-28', f_general,'5100','Personnel Services',          154000,      0,   'February payroll — Public Works',           'jsmith',   'POSTED',    '2025-02','N'),
    ('2025-02-15', f_cdbg,   '5600','Contractual Services',         62000,      0,   'Community Health Partners Q2 payment',      'mpatel',   'POSTED',    '2025-02','N'),
    ('2025-02-20', f_general,'1200','Investment Income',                0,  12500,  'Monthly investment portfolio income',        'system',   'POSTED',    '2025-02','N'),
    ('2025-01-31', f_general,'5300','Professional Services',       320000,      0,   'Year-start consulting block — unusual amt', 'agarcia',  'EXCEPTION', '2025-01','Y'),
    ('2025-03-31', f_cap,    '6100','Capital Infrastructure',           0, 625000,  'Capital project encumbrance transfer',      'controller','PENDING',  '2025-03','N'),
    ('2025-03-15', f_general,'4300','Misc Revenue',                     0,   8200,  'Permit fee revenue March',                  'system',   'POSTED',    '2025-03','N'),
    ('2025-03-08', f_wf,     '5100','Personnel Services — WIOA',   55000,      0,   'WIOA grant staff payroll',                  'jsmith',   'POSTED',    '2025-03','N'),
    ('2025-03-20', f_wf,     '5600','Training Costs — WIOA',       38000,      0,   'Workforce training vendor payment',         'mpatel',   'POSTED',    '2025-03','N'),
    ('2025-03-28', f_general,'5100','Personnel Services — Overtime',42000,     0,   'Q1 overtime — emergency response events',  'jsmith',   'POSTED',    '2025-03','Y'),
]:
    run(r[9][:12]+r[10], f'''INSERT INTO "{S}"."I_JournalEntry"
        ("journal_id","entry_date","fund_id","account_code","account_name",
         "debit_amount","credit_amount","description","entered_by","entry_status","period","is_unusual")
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?)''', [id20()] + list(r))

create_table("CREATE I_CloseTask", f'''
CREATE COLUMN TABLE "{S}"."I_CloseTask" (
  "task_id"          VARCHAR(20)   PRIMARY KEY,
  "period"           VARCHAR(7),
  "task_name"        NVARCHAR(100),
  "assigned_to"      NVARCHAR(50),
  "due_date"         DATE,
  "completion_date"  DATE,
  "task_status"      VARCHAR(20),
  "priority"         VARCHAR(10),
  "task_category"    VARCHAR(30)
)''')

for r in [
    ('2025-03','Bank Reconciliation — General Fund',          'jsmith',     '2025-04-03','2025-04-02','COMPLETE',    'HIGH',  'RECONCILIATION'),
    ('2025-03','Bank Reconciliation — CDBG Fund',             'jsmith',     '2025-04-03','2025-04-03','COMPLETE',    'HIGH',  'RECONCILIATION'),
    ('2025-03','Payroll Journal Entries — March',             'jsmith',     '2025-04-02','2025-04-01','COMPLETE',    'HIGH',  'JOURNAL'),
    ('2025-03','Grant Revenue Recognition — Q1',             'mpatel',     '2025-04-05','2025-04-04','COMPLETE',    'HIGH',  'JOURNAL'),
    ('2025-03','Capital Project Encumbrance Review',          'agarcia',    '2025-04-05','2025-04-05','COMPLETE',    'MEDIUM','RECONCILIATION'),
    ('2025-03','AP Invoice Aging Review',                     'agarcia',    '2025-04-04','2025-04-03','COMPLETE',    'HIGH',  'RECONCILIATION'),
    ('2025-03','Inter-fund Transfer Verification',            'controller', '2025-04-07','2025-04-06','COMPLETE',    'MEDIUM','RECONCILIATION'),
    ('2025-03','CAFR Footnote Schedules Draft',               'controller', '2025-04-10',None,         'IN_PROGRESS','HIGH',  'REPORTING'),
    ('2025-03','Budget vs Actual Variance Report',            'mpatel',     '2025-04-08',None,         'IN_PROGRESS','MEDIUM','REPORTING'),
    ('2025-03','Suspense Account Clearance',                  'agarcia',    '2025-04-01',None,         'OVERDUE',    'HIGH',  'JOURNAL'),
    ('2025-03','Exception Journal Entry Resolution',          'controller', '2025-04-02',None,         'OVERDUE',    'HIGH',  'AUDIT'),
    ('2025-03','Grant Drawdown Reconciliation — HUD',        'mpatel',     '2025-04-03',None,         'OVERDUE',    'HIGH',  'RECONCILIATION'),
    ('2025-03','Department Head Sign-Off — Public Works',     'dept_head1', '2025-04-10',None,         'NOT_STARTED','HIGH',  'APPROVAL'),
    ('2025-03','Department Head Sign-Off — Health & HHS',    'dept_head2', '2025-04-10',None,         'NOT_STARTED','HIGH',  'APPROVAL'),
    ('2025-03','Final Controller Approval',                   'controller', '2025-04-15',None,         'IN_PROGRESS','MEDIUM','APPROVAL'),
]:
    run(r[2][:20], f'''INSERT INTO "{S}"."I_CloseTask"
        ("task_id","period","task_name","assigned_to","due_date","completion_date",
         "task_status","priority","task_category")
        VALUES(?,?,?,?,?,?,?,?,?)''', [id20()] + list(r))

create_table("CREATE I_InterfundTransfer", f'''
CREATE COLUMN TABLE "{S}"."I_InterfundTransfer" (
  "transfer_id"       VARCHAR(20)    PRIMARY KEY,
  "from_fund_id"      VARCHAR(20),
  "to_fund_id"        VARCHAR(20),
  "transfer_amount"   DECIMAL(15,2),
  "transfer_date"     DATE,
  "transfer_purpose"  NVARCHAR(200),
  "approved_by"       NVARCHAR(50),
  "transfer_status"   VARCHAR(20),
  "fiscal_year"       VARCHAR(6)
)''')

for r in [
    (f_general, f_cdbg,   480000,'2024-02-15','Grant match funding — CDBG Community Development',      'controller', 'APPROVED','FY2024'),
    (f_general, f_cap,    750000,'2024-03-01','Capital project support — Park facilities Phase 1',      'controller', 'APPROVED','FY2024'),
    (f_general, f_wf,     120000,'2024-04-01','WIOA workforce program local match contribution',         'controller', 'APPROVED','FY2024'),
    (f_cap,     f_general,  85000,'2024-05-15','Debt service transfer — annual principal & interest',   'controller', 'APPROVED','FY2024'),
    (f_general, f_cdbg,   210000,'2024-07-01','Mid-year grant match adjustment — HUD HOME program',     'controller', 'APPROVED','FY2024'),
    (f_cdbg,    f_general, 42000,'2024-08-15','Indirect cost allocation — approved NICRA rate',         'mpatel',     'APPROVED','FY2024'),
    (f_general, f_cap,    300000,'2024-09-01','Emergency capital transfer — infrastructure repair',      'controller', 'PENDING', 'FY2024'),
    (f_general, f_title1,  95000,'2024-01-15','Title I program local match FY2024',                    'controller', 'REVERSED','FY2024'),
]:
    run(r[4][:20], f'''INSERT INTO "{S}"."I_InterfundTransfer"
        ("transfer_id","from_fund_id","to_fund_id","transfer_amount","transfer_date",
         "transfer_purpose","approved_by","transfer_status","fiscal_year")
        VALUES(?,?,?,?,?,?,?,?,?)''', [id20()] + list(r))

# Finance views
run("V_BudgetVariance", f'''
CREATE OR REPLACE VIEW "{S}"."V_BudgetVariance" AS
SELECT
  bl."budget_id", bl."fund_id", bl."department", bl."fiscal_year",
  bl."account_code", bl."account_name", bl."budget_type",
  bl."original_budget", bl."revised_budget", bl."encumbrances", bl."actuals",
  bl."revised_budget" - bl."encumbrances" - bl."actuals" AS AVAILABLE_BALANCE,
  ROUND(bl."actuals" / NULLIF(bl."revised_budget", 0) * 100, 1) AS SPEND_PCT,
  ROUND((bl."actuals" + bl."encumbrances") / NULLIF(bl."revised_budget", 0) * 100, 1) AS COMMITTED_PCT,
  CASE
    WHEN bl."actuals" > bl."revised_budget" THEN 'OVERRUN'
    WHEN (bl."actuals" + bl."encumbrances") / NULLIF(bl."revised_budget",0) > 0.9 THEN 'AT_RISK'
    WHEN (bl."actuals" + bl."encumbrances") / NULLIF(bl."revised_budget",0) > 0.75 THEN 'ON_TRACK'
    ELSE 'UNDER_BUDGET'
  END AS BUDGET_STATUS,
  f."fund_name", f."fund_type"
FROM "{S}"."I_BudgetLine" bl
LEFT JOIN "{S}"."I_Fund" f ON f."fund_id" = bl."fund_id"''')

run("V_CloseReadiness", f'''
CREATE OR REPLACE VIEW "{S}"."V_CloseReadiness" AS
SELECT
  ct."period",
  COUNT(*) OVER (PARTITION BY ct."period") AS TOTAL_TASKS,
  SUM(CASE WHEN ct."task_status" = 'COMPLETE'     THEN 1 ELSE 0 END) OVER (PARTITION BY ct."period") AS COMPLETED,
  SUM(CASE WHEN ct."task_status" = 'IN_PROGRESS'  THEN 1 ELSE 0 END) OVER (PARTITION BY ct."period") AS IN_PROGRESS,
  SUM(CASE WHEN ct."task_status" = 'OVERDUE'       THEN 1 ELSE 0 END) OVER (PARTITION BY ct."period") AS OVERDUE,
  SUM(CASE WHEN ct."task_status" = 'NOT_STARTED'  THEN 1 ELSE 0 END) OVER (PARTITION BY ct."period") AS NOT_STARTED,
  ROUND(
    SUM(CASE WHEN ct."task_status" = 'COMPLETE' THEN 1 ELSE 0 END) OVER (PARTITION BY ct."period") * 100.0
    / COUNT(*) OVER (PARTITION BY ct."period"),
    1
  ) AS COMPLETION_PCT,
  ct."task_id", ct."task_name", ct."assigned_to", ct."due_date",
  ct."completion_date", ct."task_status", ct."priority", ct."task_category"
FROM "{S}"."I_CloseTask" ct''')

# ═══════════════════════════════════════════════════════════════════════════════
# SPRINT 11 — Capital Projects & CIP
# ═══════════════════════════════════════════════════════════════════════════════
print("\n  Sprint 11: Capital Projects & CIP…")

# ── I_CapitalProject ──────────────────────────────────────────────────────────
create_table("CREATE I_CapitalProject", f'''
CREATE COLUMN TABLE "{S}"."I_CapitalProject" (
  "project_id"          VARCHAR(20)    PRIMARY KEY,
  "project_number"      VARCHAR(20),
  "project_name"        NVARCHAR(120),
  "project_type"        VARCHAR(20),
  "department"          NVARCHAR(80),
  "description"         NVARCHAR(300),
  "total_budget"        DECIMAL(15,2),
  "spent_to_date"       DECIMAL(15,2),
  "encumbrances"        DECIMAL(15,2),
  "project_status"      VARCHAR(20),
  "phase"               VARCHAR(20),
  "start_date"          DATE,
  "expected_completion" DATE,
  "actual_completion"   DATE,
  "fund_id"             VARCHAR(20),
  "grant_id"            VARCHAR(20),
  "priority"            VARCHAR(10),
  "project_manager"     NVARCHAR(60)
)''')

# Stable project IDs
cp_main    = id20(); cp_cityhall = id20(); cp_river   = id20()
cp_wwater  = id20(); cp_fiber    = id20(); cp_bridge  = id20()
cp_comm    = id20(); cp_trail    = id20(); cp_water   = id20()
cp_library = id20(); cp_street   = id20(); cp_fire    = id20()

# (project_id, project_number, project_name, project_type, department, description,
#  total_budget, spent_to_date, encumbrances, project_status, phase,
#  start_date, expected_completion, actual_completion, fund_id, grant_id, priority, project_manager)
capital_projects = [
    (cp_main,    'CIP-2023-001', 'Main Street Reconstruction',        'ROAD',     'Public Works',
     'Full reconstruction of Main St — pavement, curbs, drainage, ADA ramps',
     8500000,  9520000, 180000, 'ACTIVE',    'CONSTRUCTION', '2023-03-01','2024-12-31',None,     f_cap,    g_cdbg,    'HIGH',   'D. Nguyen'),
    (cp_cityhall,'CIP-2023-002', 'City Hall Renovation',              'BUILDING', 'Facilities',
     'HVAC, electrical, seismic retrofitting, ADA compliance for 1962 City Hall',
     12000000, 9800000, 950000, 'ACTIVE',    'CONSTRUCTION', '2023-06-01','2025-06-30',None,     f_cap,    None,      'HIGH',   'R. Okonkwo'),
    (cp_river,   'CIP-2023-003', 'Riverview Park Expansion',          'PARKS',    'Parks & Rec',
     'New athletic fields, playground, restroom facilities at Riverview Park',
     3200000,  2100000, 310000, 'ACTIVE',    'CONSTRUCTION', '2023-09-01','2024-09-30',None,     f_cap,    g_home,    'MEDIUM', 'L. Patel'),
    (cp_wwater,  'CIP-2024-001', 'Wastewater Treatment Plant Upgrade','UTILITY',  'Public Works',
     'Capacity expansion and regulatory compliance upgrade for WWTP',
     18000000,  980000, 620000, 'ACTIVE',    'DESIGN',       '2024-01-15','2027-06-30',None,     f_cap,    g_slfrf,   'HIGH',   'M. Torres'),
    (cp_fiber,   'CIP-2023-004', 'Municipal Fiber Network Phase 1',   'IT',       'Information Technology',
     'Dark fiber backbone connecting City Hall, Police, Fire, and Libraries',
     4500000,  4050000, 275000, 'ACTIVE',    'CONSTRUCTION', '2023-04-01','2024-10-31',None,     f_cap,    None,      'MEDIUM', 'K. Singh'),
    (cp_bridge,  'CIP-2022-001', 'Oak Ave Bridge Rehabilitation',     'BRIDGE',   'Public Works',
     'Structural repairs, deck resurfacing, guardrail replacement on Oak Ave bridge',
     7000000,  5600000, 820000, 'ACTIVE',    'CONSTRUCTION', '2022-10-01','2024-08-31',None,     f_cap,    None,      'HIGH',   'D. Nguyen'),
    (cp_comm,    'CIP-2022-002', 'Community Center Remodel',          'BUILDING', 'Parks & Rec',
     'Interior remodel, ADA upgrades, new HVAC for Eastside Community Center',
     2800000,  2750000,      0, 'COMPLETED', 'CLOSEOUT',     '2022-06-01','2023-12-31','2023-11-15',f_cap, None,      'MEDIUM', 'L. Patel'),
    (cp_trail,   'CIP-2024-002', 'Creekside Linear Trail Extension',  'PARKS',    'Parks & Rec',
     '2.4-mile paved trail extension with lighting, benches, and bike repair stations',
     1500000,   620000, 180000, 'ACTIVE',    'CONSTRUCTION', '2024-03-01','2024-12-15',None,     f_cap,    g_home,    'LOW',    'L. Patel'),
    (cp_water,   'CIP-2023-005', 'Downtown Water Main Replacement',   'UTILITY',  'Public Works',
     'Replace 1960s-era cast-iron water mains in 8-block downtown corridor',
     5500000,  3850000, 980000, 'ACTIVE',    'CONSTRUCTION', '2023-11-01','2024-11-30',None,     f_cap,    None,      'HIGH',   'M. Torres'),
    (cp_library, 'CIP-2024-003', 'New Central Library',               'BUILDING', 'Library Services',
     '45,000 sq ft new central library with community meeting rooms and maker space',
     22000000,  420000, 180000, 'PLANNING',  'PLANNING',     '2024-07-01','2028-06-30',None,     f_cap,    g_cdbg,    'MEDIUM', 'R. Okonkwo'),
    (cp_street,  'CIP-2024-004', 'Downtown Streetscape Improvement',  'ROAD',     'Public Works',
     'Sidewalk widening, new streetlights, trees, bike lanes on 5 downtown blocks',
     3800000,  2660000, 570000, 'ACTIVE',    'CONSTRUCTION', '2024-02-01','2024-12-31',None,     f_cap,    None,      'MEDIUM', 'D. Nguyen'),
    (cp_fire,    'CIP-2024-005', 'Fire Station #4 Rebuild',           'BUILDING', 'Fire Department',
     'Full demolition and rebuild of aging Station #4 with modern apparatus bays',
     9500000,  1140000, 380000, 'ACTIVE',    'DESIGN',       '2024-04-01','2026-06-30',None,     f_cap,    None,      'HIGH',   'R. Okonkwo'),
]

for r in capital_projects:
    (pid, pnum, pname, ptype, dept, desc,
     budget, spent, enc, status, phase,
     start, exp_comp, act_comp, fund_id, grant_id, priority, pm) = r
    run(pnum, f'''INSERT INTO "{S}"."I_CapitalProject"
        ("project_id","project_number","project_name","project_type","department","description",
         "total_budget","spent_to_date","encumbrances","project_status","phase",
         "start_date","expected_completion","actual_completion",
         "fund_id","grant_id","priority","project_manager")
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
        [pid, pnum, pname, ptype, dept, desc,
         budget, spent, enc, status, phase,
         start, exp_comp, act_comp, fund_id, grant_id, priority, pm])

# ── I_ChangeOrder ─────────────────────────────────────────────────────────────
create_table("CREATE I_ChangeOrder", f'''
CREATE COLUMN TABLE "{S}"."I_ChangeOrder" (
  "change_order_id"      VARCHAR(20)   PRIMARY KEY,
  "project_id"           VARCHAR(20),
  "co_number"            VARCHAR(20),
  "description"          NVARCHAR(200),
  "reason"               VARCHAR(30),
  "cost_impact"          DECIMAL(15,2),
  "schedule_impact_days" INTEGER,
  "approved_by"          NVARCHAR(60),
  "approved_date"        DATE,
  "submitted_date"       DATE,
  "status"               VARCHAR(20)
)''')

change_orders = [
    # Main St — over budget: 3 approved COs
    (cp_main, 'CO-001', 'Unanticipated underground utility conflicts requiring rerouting', 'UNFORESEEN_CONDITIONS',  980000, 45, 'D. Nguyen',  '2023-08-15', '2023-08-01', 'APPROVED'),
    (cp_main, 'CO-002', 'Additional ADA curb ramp scope added by City Council directive',  'SCOPE_CHANGE',           420000, 20, 'D. Nguyen',  '2023-11-10', '2023-10-25', 'APPROVED'),
    (cp_main, 'CO-003', 'Asphalt price escalation — materials cost increase',              'UNFORESEEN_CONDITIONS',  150000, 0,  'D. Nguyen',  '2024-02-20', '2024-02-01', 'APPROVED'),
    # City Hall — 2 approved, 1 pending
    (cp_cityhall,'CO-001','Asbestos abatement discovered in mechanical room walls',        'UNFORESEEN_CONDITIONS',  875000, 60, 'R. Okonkwo', '2023-10-05', '2023-09-20', 'APPROVED'),
    (cp_cityhall,'CO-002','Owner-requested addition of Council chamber AV system upgrade', 'OWNER_REQUEST',          340000, 15, 'R. Okonkwo', '2024-01-18', '2024-01-05', 'APPROVED'),
    (cp_cityhall,'CO-003','Structural steel redesign required by updated seismic code',    'REGULATORY',             520000, 45, None,          None,         '2024-06-10', 'PENDING'),
    # Bridge — 1 approved, 1 pending
    (cp_bridge, 'CO-001', 'Deck delamination more extensive than initial survey indicated','UNFORESEEN_CONDITIONS',  480000, 30, 'D. Nguyen',  '2023-04-12', '2023-03-28', 'APPROVED'),
    (cp_bridge, 'CO-002', 'Weather delays — extended winter closure added to schedule',    'WEATHER',                     0, 28, None,          None,         '2024-01-15', 'PENDING'),
    # Fiber — 1 approved CO
    (cp_fiber,  'CO-001', 'Additional conduit required — route change to avoid conflicts', 'UNFORESEEN_CONDITIONS',  215000, 10, 'K. Singh',   '2023-09-22', '2023-09-10', 'APPROVED'),
    # Water main — 1 pending
    (cp_water,  'CO-001', 'Design error — service line depth specifications corrected',    'DESIGN_ERROR',           185000, 14, None,          None,         '2024-07-01', 'PENDING'),
    # Downtown Streetscape — 1 approved
    (cp_street, 'CO-001', 'Owner requested additional bike corral installation at 3 nodes','OWNER_REQUEST',           95000, 7,  'D. Nguyen',  '2024-05-15', '2024-05-01', 'APPROVED'),
]

for r in change_orders:
    (pid, conum, desc, reason, cost, sched, approved_by, approved_date, submitted, status) = r
    run(conum, f'''INSERT INTO "{S}"."I_ChangeOrder"
        ("change_order_id","project_id","co_number","description","reason",
         "cost_impact","schedule_impact_days","approved_by","approved_date","submitted_date","status")
        VALUES(?,?,?,?,?,?,?,?,?,?,?)''',
        [id20(), pid, conum, desc, reason,
         cost, sched, approved_by, approved_date, submitted, status])

# ── I_ProjectFunding ──────────────────────────────────────────────────────────
create_table("CREATE I_ProjectFunding", f'''
CREATE COLUMN TABLE "{S}"."I_ProjectFunding" (
  "funding_id"       VARCHAR(20)    PRIMARY KEY,
  "project_id"       VARCHAR(20),
  "source_type"      VARCHAR(30),
  "source_name"      NVARCHAR(100),
  "fund_id"          VARCHAR(20),
  "grant_id"         VARCHAR(20),
  "allocated_amount" DECIMAL(15,2),
  "drawn_amount"     DECIMAL(15,2)
)''')

project_funding = [
    # Main St
    (cp_main, 'BOND',          'GO Bond Series 2022-A',             f_cap,  None,    6000000, 6800000),
    (cp_main, 'GRANT',         'CDBG Infrastructure Award FY2023',  f_cap,  g_cdbg,  2500000, 2720000),
    # City Hall
    (cp_cityhall,'BOND',       'Revenue Bond Series 2023',          f_cap,  None,    9000000, 7350000),
    (cp_cityhall,'GENERAL_FUND','General Fund Capital Allocation',  f_cap,  None,    3000000, 2450000),
    # Riverview Park
    (cp_river,'GRANT',         'HOME Investment Partnership Grant', f_cap,  g_home,  1500000, 1050000),
    (cp_river,'GENERAL_FUND',  'Parks Capital Improvement Fund',    f_cap,  None,    1700000, 1050000),
    # Wastewater
    (cp_wwater,'BOND',         'Revenue Bond Series 2024 (WWTP)',   f_cap,  None,   10000000,  490000),
    (cp_wwater,'GRANT',        'SLFRF Infrastructure Allocation',   f_cap,  g_slfrf, 8000000,  490000),
    # Fiber
    (cp_fiber,'GENERAL_FUND',  'IT Capital Fund',                   f_cap,  None,    2500000, 2250000),
    (cp_fiber,'SPECIAL_ASSESSMENT','Technology Surcharge Revenue',  f_cap,  None,    2000000, 1800000),
    # Bridge
    (cp_bridge,'BOND',         'GO Bond Series 2022-B (Bridges)',   f_cap,  None,    5000000, 4000000),
    (cp_bridge,'GENERAL_FUND', 'Bridge Maintenance Reserve',        f_cap,  None,    2000000, 1600000),
    # Community Center (completed)
    (cp_comm,'GENERAL_FUND',   'Facilities Capital Fund',           f_cap,  None,    2800000, 2750000),
    # Trail
    (cp_trail,'GRANT',         'HOME Green Infrastructure Grant',   f_cap,  g_home,   900000,  372000),
    (cp_trail,'DEVELOPER_CONTRIBUTION','Creekside Development Agreement',f_cap,None,  600000,  248000),
    # Water Main
    (cp_water,'BOND',          'Utility Revenue Bond 2023',         f_cap,  None,    5500000, 2695000),
    # Library
    (cp_library,'BOND',        'Library GO Bond 2024',              f_cap,  None,   17000000,  210000),
    (cp_library,'GRANT',       'CDBG Community Facilities Award',   f_cap,  g_cdbg,  3000000,  126000),
    (cp_library,'DEVELOPER_CONTRIBUTION','Library Impact Fee Fund',  f_cap, None,    2000000,   84000),
    # Streetscape
    (cp_street,'GENERAL_FUND', 'Downtown Improvement Fund',         f_cap,  None,    2000000, 1400000),
    (cp_street,'BOND',         'GO Bond Series 2023-C (Streets)',   f_cap,  None,    1800000, 1260000),
    # Fire Station
    (cp_fire,'BOND',           'GO Bond Series 2024 (Public Safety)',f_cap, None,    7000000,  798000),
    (cp_fire,'GENERAL_FUND',   'Fire Capital Reserve Fund',         f_cap,  None,    2500000,  285000),
]

for r in project_funding:
    (pid, stype, sname, fund_id, grant_id, alloc, drawn) = r
    run(sname[:20], f'''INSERT INTO "{S}"."I_ProjectFunding"
        ("funding_id","project_id","source_type","source_name",
         "fund_id","grant_id","allocated_amount","drawn_amount")
        VALUES(?,?,?,?,?,?,?,?)''',
        [id20(), pid, stype, sname, fund_id, grant_id, alloc, drawn])

# ── I_Milestone ───────────────────────────────────────────────────────────────
create_table("CREATE I_Milestone", f'''
CREATE COLUMN TABLE "{S}"."I_Milestone" (
  "milestone_id"     VARCHAR(20)    PRIMARY KEY,
  "project_id"       VARCHAR(20),
  "milestone_name"   NVARCHAR(100),
  "milestone_type"   VARCHAR(20),
  "planned_date"     DATE,
  "actual_date"      DATE,
  "status"           VARCHAR(20),
  "completion_pct"   INTEGER,
  "responsible_party"NVARCHAR(60),
  "notes"            NVARCHAR(200)
)''')

# (project_id, name, type, planned, actual, status, pct, responsible, notes)
milestones = [
    # Main St (RED — over budget)
    (cp_main, '30% Design Complete',       'DESIGN',       '2023-03-31','2023-04-05','COMPLETED',  100,'D. Nguyen',  None),
    (cp_main, '90% Design & Bid Package',  'DESIGN',       '2023-05-31','2023-06-10','COMPLETED',  100,'D. Nguyen',  None),
    (cp_main, 'Construction NTP',          'CONSTRUCTION', '2023-07-01','2023-07-08','COMPLETED',  100,'D. Nguyen',  None),
    (cp_main, '50% Construction',          'CONSTRUCTION', '2023-12-01','2024-01-15','COMPLETED',  100,'D. Nguyen',  'Delayed by utility conflicts'),
    (cp_main, 'Substantial Completion',    'INSPECTION',   '2024-09-30', None,       'AT_RISK',     65,'D. Nguyen',  'Budget overrun may force scope reduction'),
    (cp_main, 'Final Acceptance',          'CLOSEOUT',     '2024-12-31', None,       'AT_RISK',      0,'D. Nguyen',  None),

    # City Hall (YELLOW)
    (cp_cityhall,'Schematic Design',       'DESIGN',       '2023-07-31','2023-08-05','COMPLETED',  100,'R. Okonkwo', None),
    (cp_cityhall,'Design Development',     'DESIGN',       '2023-10-31','2023-11-12','COMPLETED',  100,'R. Okonkwo', 'Asbestos discovery caused 12-day delay'),
    (cp_cityhall,'Permit Issuance',        'PERMITTING',   '2024-01-15','2024-02-10','COMPLETED',  100,'R. Okonkwo', None),
    (cp_cityhall,'Construction 50%',       'CONSTRUCTION', '2024-08-31', None,       'IN_PROGRESS', 52,'R. Okonkwo', None),
    (cp_cityhall,'Seismic Retrofit Complete','CONSTRUCTION','2025-01-31', None,       'AT_RISK',     10,'R. Okonkwo', 'Pending CO-003 seismic redesign approval'),
    (cp_cityhall,'Substantial Completion', 'INSPECTION',   '2025-04-30', None,       'NOT_STARTED',  0,'R. Okonkwo', None),
    (cp_cityhall,'Final Acceptance',       'CLOSEOUT',     '2025-06-30', None,       'NOT_STARTED',  0,'R. Okonkwo', None),

    # Riverview Park (GREEN)
    (cp_river, 'Design Complete',          'DESIGN',       '2023-11-30','2023-11-25','COMPLETED',  100,'L. Patel',   None),
    (cp_river, 'Permit Approval',          'PERMITTING',   '2024-01-31','2024-02-08','COMPLETED',  100,'L. Patel',   None),
    (cp_river, 'Grading & Site Prep',      'CONSTRUCTION', '2024-03-31','2024-04-05','COMPLETED',  100,'L. Patel',   None),
    (cp_river, 'Athletic Fields Complete', 'CONSTRUCTION', '2024-07-31', None,       'IN_PROGRESS', 70,'L. Patel',   None),
    (cp_river, 'Restrooms & Amenities',    'CONSTRUCTION', '2024-09-15', None,       'NOT_STARTED',  0,'L. Patel',   None),
    (cp_river, 'Final Inspection',         'INSPECTION',   '2024-09-30', None,       'NOT_STARTED',  0,'L. Patel',   None),

    # WWTP (GREEN — early stage)
    (cp_wwater,'Preliminary Engineering',  'DESIGN',       '2024-06-30','2024-07-15','COMPLETED',  100,'M. Torres',  None),
    (cp_wwater,'Environmental Review',     'PERMITTING',   '2024-12-31', None,       'IN_PROGRESS', 40,'M. Torres',  None),
    (cp_wwater,'30% Design',               'DESIGN',       '2025-06-30', None,       'NOT_STARTED',  0,'M. Torres',  None),
    (cp_wwater,'100% Design',              'DESIGN',       '2026-03-31', None,       'NOT_STARTED',  0,'M. Torres',  None),
    (cp_wwater,'Construction NTP',         'CONSTRUCTION', '2026-07-01', None,       'NOT_STARTED',  0,'M. Torres',  None),

    # Fiber (YELLOW — high committed)
    (cp_fiber, 'Core Backbone Complete',   'CONSTRUCTION', '2023-10-31','2023-11-05','COMPLETED',  100,'K. Singh',   None),
    (cp_fiber, 'City Hall & Police Online','CONSTRUCTION', '2024-01-31','2024-02-12','COMPLETED',  100,'K. Singh',   None),
    (cp_fiber, 'Library Branches Online',  'CONSTRUCTION', '2024-06-30', None,       'IN_PROGRESS', 80,'K. Singh',   None),
    (cp_fiber, 'Fire Stations Connected',  'CONSTRUCTION', '2024-09-30', None,       'AT_RISK',     25,'K. Singh',   'Supply chain delay on fiber optic cable'),
    (cp_fiber, 'Network Acceptance Test',  'INSPECTION',   '2024-10-31', None,       'NOT_STARTED',  0,'K. Singh',   None),

    # Bridge (RED — milestones at risk)
    (cp_bridge,'Bridge Inspection Report', 'DESIGN',       '2022-12-31','2023-01-10','COMPLETED',  100,'D. Nguyen',  None),
    (cp_bridge,'Design & Bid Package',     'DESIGN',       '2023-03-31','2023-04-20','COMPLETED',  100,'D. Nguyen',  None),
    (cp_bridge,'Construction NTP',         'CONSTRUCTION', '2023-06-01','2023-06-01','COMPLETED',  100,'D. Nguyen',  None),
    (cp_bridge,'Deck Removal & Prep',      'CONSTRUCTION', '2023-10-31','2024-01-15','COMPLETED',  100,'D. Nguyen',  'Delayed — more delamination than expected'),
    (cp_bridge,'Structural Repairs 50%',   'CONSTRUCTION', '2024-04-30', None,       'IN_PROGRESS', 60,'D. Nguyen',  None),
    (cp_bridge,'Deck Pour & Resurfacing',  'CONSTRUCTION', '2024-06-30', None,       'AT_RISK',     10,'D. Nguyen',  'Weather delays — lost 28 schedule days'),
    (cp_bridge,'Final Inspection',         'INSPECTION',   '2024-08-31', None,       'AT_RISK',      0,'D. Nguyen',  None),

    # Community Center (COMPLETED)
    (cp_comm, 'Design Complete',           'DESIGN',       '2022-09-30','2022-09-28','COMPLETED',  100,'L. Patel',   None),
    (cp_comm, 'Permits Issued',            'PERMITTING',   '2022-11-30','2022-12-05','COMPLETED',  100,'L. Patel',   None),
    (cp_comm, 'Substantial Completion',    'CONSTRUCTION', '2023-10-31','2023-10-20','COMPLETED',  100,'L. Patel',   'Finished 11 days ahead of schedule'),
    (cp_comm, 'Final Acceptance',          'CLOSEOUT',     '2023-12-31','2023-11-15','COMPLETED',  100,'L. Patel',   'Project closed under budget'),

    # Trail (GREEN)
    (cp_trail,'Design & Permits',          'DESIGN',       '2024-05-31','2024-06-10','COMPLETED',  100,'L. Patel',   None),
    (cp_trail,'Grading & Base Course',     'CONSTRUCTION', '2024-08-31', None,       'IN_PROGRESS', 55,'L. Patel',   None),
    (cp_trail,'Paving & Amenities',        'CONSTRUCTION', '2024-11-15', None,       'NOT_STARTED',  0,'L. Patel',   None),
    (cp_trail,'Final Inspection',          'INSPECTION',   '2024-12-15', None,       'NOT_STARTED',  0,'L. Patel',   None),

    # Water Main (YELLOW)
    (cp_water,'Design Package',            'DESIGN',       '2024-01-31','2024-02-05','COMPLETED',  100,'M. Torres',  None),
    (cp_water,'Permit & Right-of-Way',     'PERMITTING',   '2024-03-31','2024-04-18','COMPLETED',  100,'M. Torres',  None),
    (cp_water,'Main Replacement Phase 1',  'CONSTRUCTION', '2024-07-31', None,       'IN_PROGRESS', 70,'M. Torres',  None),
    (cp_water,'Main Replacement Phase 2',  'CONSTRUCTION', '2024-10-31', None,       'AT_RISK',      5,'M. Torres',  'Design error CO pending — may affect scope'),
    (cp_water,'Final Pressure Test',       'INSPECTION',   '2024-11-30', None,       'NOT_STARTED',  0,'M. Torres',  None),

    # Library (GREEN — early)
    (cp_library,'Site Selection Final',    'PLANNING',     '2024-09-30','2024-10-01','COMPLETED',  100,'R. Okonkwo', None),
    (cp_library,'Architect Selection',     'DESIGN',       '2024-12-31', None,       'IN_PROGRESS', 60,'R. Okonkwo', None),
    (cp_library,'Schematic Design',        'DESIGN',       '2025-06-30', None,       'NOT_STARTED',  0,'R. Okonkwo', None),
    (cp_library,'Design Development',      'DESIGN',       '2025-12-31', None,       'NOT_STARTED',  0,'R. Okonkwo', None),
    (cp_library,'Permit Submission',       'PERMITTING',   '2026-06-30', None,       'NOT_STARTED',  0,'R. Okonkwo', None),

    # Streetscape (YELLOW)
    (cp_street,'Design Complete',          'DESIGN',       '2024-03-31','2024-04-02','COMPLETED',  100,'D. Nguyen',  None),
    (cp_street,'Permits',                  'PERMITTING',   '2024-04-30','2024-05-10','COMPLETED',  100,'D. Nguyen',  None),
    (cp_street,'50% Construction',         'CONSTRUCTION', '2024-08-31', None,       'IN_PROGRESS', 68,'D. Nguyen',  None),
    (cp_street,'Substantial Completion',   'CONSTRUCTION', '2024-11-30', None,       'NOT_STARTED',  0,'D. Nguyen',  None),
    (cp_street,'Final Acceptance',         'CLOSEOUT',     '2024-12-31', None,       'NOT_STARTED',  0,'D. Nguyen',  None),

    # Fire Station (GREEN — early)
    (cp_fire, 'Needs Assessment',          'PLANNING',     '2024-05-31','2024-05-28','COMPLETED',  100,'R. Okonkwo', None),
    (cp_fire, 'Architect RFP & Selection', 'DESIGN',       '2024-08-31','2024-09-10','COMPLETED',  100,'R. Okonkwo', None),
    (cp_fire, 'Schematic Design',          'DESIGN',       '2024-12-31', None,       'IN_PROGRESS', 45,'R. Okonkwo', None),
    (cp_fire, 'Design Development & CDs',  'DESIGN',       '2025-06-30', None,       'NOT_STARTED',  0,'R. Okonkwo', None),
    (cp_fire, 'Building Permit',           'PERMITTING',   '2025-09-30', None,       'NOT_STARTED',  0,'R. Okonkwo', None),
    (cp_fire, 'Construction NTP',          'CONSTRUCTION', '2025-12-01', None,       'NOT_STARTED',  0,'R. Okonkwo', None),
]

for r in milestones:
    (pid, mname, mtype, planned, actual, status, pct, resp, notes) = r
    run(mname[:20], f'''INSERT INTO "{S}"."I_Milestone"
        ("milestone_id","project_id","milestone_name","milestone_type",
         "planned_date","actual_date","status","completion_pct","responsible_party","notes")
        VALUES(?,?,?,?,?,?,?,?,?,?)''',
        [id20(), pid, mname, mtype, planned, actual, status, pct, resp, notes])

# ── Capital Project Views ──────────────────────────────────────────────────────
run("V_ProjectHealth", f'''
CREATE OR REPLACE VIEW "{S}"."V_ProjectHealth" AS
SELECT
  cp."project_id", cp."project_number", cp."project_name", cp."project_type",
  cp."department", cp."description", cp."total_budget", cp."spent_to_date",
  cp."encumbrances", cp."project_status", cp."phase", cp."start_date",
  cp."expected_completion", cp."actual_completion", cp."fund_id", cp."grant_id",
  cp."priority", cp."project_manager",
  COUNT(DISTINCT co."change_order_id")                                               AS CHANGE_ORDER_COUNT,
  SUM(CASE WHEN co."status" = 'APPROVED' THEN co."cost_impact"         ELSE 0 END) AS APPROVED_CO_IMPACT,
  SUM(CASE WHEN co."status" = 'APPROVED' THEN co."schedule_impact_days" ELSE 0 END) AS SCHEDULE_DAYS_ADDED,
  COUNT(DISTINCT m."milestone_id")                                                   AS TOTAL_MILESTONES,
  SUM(CASE WHEN m."status" = 'COMPLETED'   THEN 1 ELSE 0 END)                       AS MILESTONES_COMPLETE,
  SUM(CASE WHEN m."status" = 'AT_RISK'     THEN 1 ELSE 0 END)                       AS MILESTONES_AT_RISK,
  SUM(CASE WHEN m."status" = 'IN_PROGRESS' THEN 1 ELSE 0 END)                       AS MILESTONES_IN_PROGRESS,
  ROUND(cp."spent_to_date" / NULLIF(cp."total_budget", 0) * 100, 1)                 AS SPEND_PCT,
  ROUND((cp."spent_to_date" + cp."encumbrances") / NULLIF(cp."total_budget", 0) * 100, 1) AS COMMITTED_PCT,
  cp."total_budget" - cp."spent_to_date" - cp."encumbrances"                         AS BUDGET_REMAINING,
  CASE
    WHEN cp."project_status" = 'CANCELLED'  THEN 'GREY'
    WHEN cp."project_status" = 'COMPLETED'  THEN 'GREEN'
    WHEN cp."spent_to_date" > cp."total_budget" THEN 'RED'
    WHEN SUM(CASE WHEN m."status" = 'AT_RISK' THEN 1 ELSE 0 END) > 1 THEN 'RED'
    WHEN (cp."spent_to_date" + cp."encumbrances") / NULLIF(cp."total_budget", 0) > 0.95 THEN 'YELLOW'
    WHEN SUM(CASE WHEN m."status" = 'AT_RISK' THEN 1 ELSE 0 END) > 0 THEN 'YELLOW'
    ELSE 'GREEN'
  END AS HEALTH_STATUS
FROM "{S}"."I_CapitalProject" cp
LEFT JOIN "{S}"."I_ChangeOrder" co ON co."project_id" = cp."project_id"
LEFT JOIN "{S}"."I_Milestone"   m  ON m."project_id"  = cp."project_id"
GROUP BY
  cp."project_id", cp."project_number", cp."project_name", cp."project_type",
  cp."department", cp."description", cp."total_budget", cp."spent_to_date",
  cp."encumbrances", cp."project_status", cp."phase", cp."start_date",
  cp."expected_completion", cp."actual_completion", cp."fund_id", cp."grant_id",
  cp."priority", cp."project_manager"''')

run("V_CIPSummary", f'''
CREATE OR REPLACE VIEW "{S}"."V_CIPSummary" AS
SELECT
  "project_type"                                                               AS "project_type",
  COUNT(*)                                                                     AS "PROJECT_COUNT",
  SUM("total_budget")                                                          AS "TOTAL_BUDGET",
  SUM("spent_to_date")                                                         AS "TOTAL_SPENT",
  SUM("encumbrances")                                                          AS "TOTAL_ENCUMBRANCES",
  ROUND(SUM("spent_to_date") / NULLIF(SUM("total_budget"), 0) * 100, 1)       AS "SPEND_PCT",
  SUM(CASE WHEN "project_status" = 'ACTIVE'    THEN 1 ELSE 0 END)             AS "ACTIVE_COUNT",
  SUM(CASE WHEN "project_status" = 'ON_HOLD'   THEN 1 ELSE 0 END)             AS "ON_HOLD_COUNT",
  SUM(CASE WHEN "project_status" = 'COMPLETED' THEN 1 ELSE 0 END)             AS "COMPLETED_COUNT"
FROM "{S}"."I_CapitalProject"
GROUP BY "project_type"''')

# ── Final row counts ──────────────────────────────────────────────────────────
print(f"\n{'='*65}")
print(f"  DONE  ✓ {ok}  ✗ {err}  Total: {ok+err}")
print(f"{'='*65}")
print("  Row counts:")
for t in [
    'I_Program','I_Fund','I_GrantMaster','I_AllowabilityRule',
    'I_Subrecipient','I_Subaward','I_SubrecipientMonitoring',
    'I_CorrectiveAction','I_Document','I_ApprovalRecord',
    'I_ControlEvidence','I_OutcomeMetric','I_OutcomeTarget',
    'I_OutcomeActual','I_CostToServeUnit','I_FundBalanceClassification',
    'I_ScenarioVersion','I_ForecastEntry','I_AuditLog',
    'I_Vendor','I_Contract','I_PurchaseOrder','I_Invoice',
    'I_BudgetLine','I_JournalEntry','I_CloseTask','I_InterfundTransfer',
    'I_CapitalProject','I_ChangeOrder','I_ProjectFunding','I_Milestone',
]:
    cur.execute(f'SELECT COUNT(*) FROM "{S}"."{t}"')
    cnt = cur.fetchone()[0]
    sym = '✓' if cnt > 0 else '○'
    print(f"    {sym}  {t:<42} {cnt:>4}")
conn.close()
print()
