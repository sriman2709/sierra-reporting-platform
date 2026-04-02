"""seed_sample_data.py — SLED realistic sample data, schema-accurate"""
import os, uuid
from dotenv import load_dotenv
from hdbcli import dbapi

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))
conn = dbapi.connect(address=os.getenv("HANA_HOST"), port=443,
    user=os.getenv("HANA_USER"), password=os.getenv("HANA_PASSWORD"),
    encrypt=True, sslValidateCertificate=False)
cur = conn.cursor()
S = "PUBLIC_SECTOR#PUBLIC_SECTOR_WRITER"
ok = err = 0

def run(label, sql, params=None):
    global ok, err
    try:
        cur.execute(sql, params or [])
        conn.commit()
        ok += 1
    except Exception as e:
        print(f"  ERR {label}: {str(e)[:110]}")
        err += 1

def id20(): return uuid.uuid4().hex[:20]
def id30(): return uuid.uuid4().hex[:28]
def id50(): return str(uuid.uuid4())[:50]
def yn(v):  return 'Y' if v else 'N'

print("="*60)
print("  SLED Sample Data Seeder")
print("="*60)

print("\nClearing tables...")
for t in ['I_ForecastEntry','I_ScenarioAssumption','I_ScenarioVersion',
          'I_FundBalanceClassification','I_CostToServeUnit','I_OutcomeActual',
          'I_OutcomeTarget','I_OutcomeMetric','I_CorrectiveAction',
          'I_SubrecipientMonitoring','I_ControlEvidence','I_AuditLog',
          'I_ApprovalRecord','I_Document','I_Subaward','I_Subrecipient',
          'I_AllowabilityRule','I_Fund','I_GrantMaster','I_Program']:
    run(f"CLR {t}", f'DELETE FROM "{S}"."{t}"')

# Stable IDs
p_housing=id20(); p_workforce=id20(); p_education=id20()
f_general=id20(); f_cdbg=id20(); f_title1=id20(); f_wf=id20(); f_cap=id20()
g_cdbg=id20(); g_title1=id20(); g_wioa=id20(); g_esser=id20()
g_home=id20(); g_headstart=id20(); g_slfrf=id20(); g_rap=id20()
g_snap=id20(); g_idea=id20()
sr_hope=id20(); sr_nextgen=id20(); sr_green=id20(); sr_unity=id20()
sr_bright=id20(); sr_metro=id20(); sr_valley=id20(); sr_summit=id20()
met_hu=id30(); met_hp=id30(); met_hc=id30()
met_j=id30();  met_w=id30();  met_r=id30()
met_pr=id30(); met_gr=id30(); met_at=id30()
sc_base=id30(); sc_opt=id30(); sc_cons=id30()

print("\n── Programs ──")
for r in [
    (p_housing,  'Housing & Community Dev','HCD-001','COMMUNITY_DEVELOPMENT','Housing',   '2023-01-01','2025-12-31',4200000,'Metro Region',   'Reduce homelessness by 25%'),
    (p_workforce,'Workforce Development',  'WFD-001','WORKFORCE',           'Labor',      '2023-07-01','2026-06-30',3100000,'Statewide',      'Increase employment among low-income adults'),
    (p_education,'K-12 Education Support', 'EDU-001','EDUCATION',           'Education',  '2023-08-01','2026-07-31',5800000,'School District','Close Title I achievement gap'),
]:
    run(r[1], f'INSERT INTO "{S}"."I_Program" ("program_id","program_name","program_code","program_type","department_id","start_date","end_date","total_budget","service_area","strategic_goal","program_status","created_by") VALUES(?,?,?,?,?,?,?,?,?,?,\'ACTIVE\',\'seed\')', list(r))

print("── Funds ──")
for r in [
    (f_general, 'GF-001','General Fund',            'GENERAL',        '2024',12500000,8200000,7900000,12800000,0,       0,       2000000,10800000,yn(0),'GASB-54'),
    (f_cdbg,    'SP-101','CDBG Special Revenue Fund','SPECIAL_REVENUE','2024',2800000, 1950000,1820000,2930000, 2930000,0,       0,       0,       yn(1),'GASB-54'),
    (f_title1,  'SP-102','Title I Education Fund',   'SPECIAL_REVENUE','2024',3200000, 2100000,2050000,3250000, 3250000,0,       0,       0,       yn(1),'GASB-54'),
    (f_wf,      'SP-103','WIOA Workforce Fund',      'SPECIAL_REVENUE','2024',1800000, 1200000,1150000,1850000, 1850000,0,       0,       0,       yn(1),'GASB-54'),
    (f_cap,     'CP-001','Capital Projects Fund',    'CAPITAL_PROJECTS','2024',5000000,500000, 320000, 5180000, 0,      5180000,0,       0,       yn(0),'GASB-54'),
]:
    run(r[2], f'INSERT INTO "{S}"."I_Fund" ("fund_id","fund_code","fund_name","fund_type","fiscal_year","beginning_balance","revenues_ytd","expenditures_ytd","ending_balance","restricted_amount","committed_amount","assigned_amount","unassigned_amount","is_grant_fund","gasb54_class") VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', list(r))

print("── Grants ──")
for r in [
    (g_cdbg,    'CDBG-2023-001','Community Development Block Grant',  'HUD',                 '14.218',1850000,'2023-01-01','2025-12-31','ACTIVE',  p_housing,  f_cdbg, 'ANNUAL'),
    (g_title1,  'ESEA-2023-002','Title I Part A — Improving Schools', 'US Dept of Education','84.010', 2400000,'2023-08-01','2026-07-31','ACTIVE',  p_education,f_title1,'ANNUAL'),
    (g_wioa,    'WIOA-2023-003','WIOA Adult & Dislocated Worker',     'US Dept of Labor',    '17.258', 1200000,'2023-07-01','2025-06-30','ACTIVE',  p_workforce,f_wf,   'QUARTERLY'),
    (g_esser,   'ESSER-2023-004','ESSER III — Learning Recovery',    'US Dept of Education','84.425', 3100000,'2023-03-15','2024-09-30','ACTIVE',  p_education,f_title1,'QUARTERLY'),
    (g_home,    'HOME-2023-005','HOME Investment Partnerships',       'HUD',                 '14.239', 980000, '2023-06-01','2026-05-31','ACTIVE',  p_housing,  f_cdbg, 'ANNUAL'),
    (g_headstart,'HEAD-2024-006','Head Start Early Childhood',        'HHS',                 '93.600', 1450000,'2024-01-01','2024-12-31','ACTIVE',  p_education,f_title1,'QUARTERLY'),
    (g_slfrf,   'SLFRF-2022-007','State & Local Fiscal Recovery',    'US Treasury',         '21.027', 4500000,'2022-03-11','2026-12-31','ACTIVE',  p_housing,  f_general,'SEMI_ANNUAL'),
    (g_rap,     'RAP-2023-008', 'Rental Assistance Program',         'HUD',                 '14.871', 620000, '2023-09-01','2024-08-31','EXPIRING',p_housing,  f_cdbg, 'MONTHLY'),
    (g_snap,    'SNAP-2024-009','SNAP Employment & Training',        'USDA',                '10.561', 380000, '2024-01-01','2024-12-31','ACTIVE',  p_workforce,f_wf,   'QUARTERLY'),
    (g_idea,    'IDEA-2023-010','IDEA Part B — Special Education',   'US Dept of Education','84.027', 1820000,'2023-08-01','2026-07-31','ACTIVE',  p_education,f_title1,'ANNUAL'),
]:
    run(r[1], f'INSERT INTO "{S}"."I_GrantMaster" ("grant_id","grant_number","grant_title","grantor_agency","cfda_number","award_amount","award_start_date","award_end_date","award_status","program_id","fund_id","reporting_frequency") VALUES(?,?,?,?,?,?,?,?,?,?,?,?)', list(r))

print("── Allowability Rules ──")
for r in [
    ('Personnel costs — direct staff',         yn(1),yn(1),yn(1),yn(1),'2 CFR 200.430'),
    ('Fringe benefits — documented',           yn(1),yn(1),yn(1),yn(1),'2 CFR 200.431'),
    ('Travel — in-state, per diem rates',      yn(1),yn(1),yn(1),yn(1),'2 CFR 200.474'),
    ('Equipment — over $5,000 unit cost',      yn(1),yn(1),yn(1),yn(0),'2 CFR 200.439'),
    ('Indirect costs — approved rate only',    yn(1),yn(1),yn(1),yn(1),'2 CFR 200.414'),
    ('Entertainment expenses',                 yn(0),yn(0),yn(0),yn(0),'2 CFR 200.438'),
    ('Lobbying activities',                    yn(0),yn(0),yn(0),yn(0),'2 CFR 200.450'),
    ('Advertising — programmatic only',        yn(1),yn(1),yn(0),yn(0),'2 CFR 200.421'),
    ('Subcontractor costs — competitively bid',yn(1),yn(1),yn(1),yn(1),'2 CFR 200.317'),
    ('Alcohol purchases',                      yn(0),yn(0),yn(0),yn(0),'2 CFR 200.423'),
]:
    run(r[0][:25], f'INSERT INTO "{S}"."I_AllowabilityRule" ("rule_id","cost_category","is_necessary","is_reasonable","is_allocable","is_allowable","cfr_reference","created_by") VALUES(?,?,?,?,?,?,?,\'seed\')', [id20()]+list(r))

print("── Subrecipients ──")
for r in [
    (sr_hope,  'Hope Housing Foundation',       'UEI-4A7B2C', 'DUNS-12345','NONPROFIT', 'TX','28','LOW',   yn(1),'2025-06-30'),
    (sr_nextgen,'NextGen Workforce Institute',  'UEI-5B8C3D', 'DUNS-23456','NONPROFIT', 'TX','42','MEDIUM',yn(1),'2025-03-15'),
    (sr_green, 'GreenPath Community Services',  'UEI-6C9D4E', 'DUNS-34567','NONPROFIT', 'TX','18','LOW',   yn(1),'2025-09-30'),
    (sr_unity, 'Unity Education Collaborative', 'UEI-7D0E5F', 'DUNS-45678','EDUCATION', 'TX','65','HIGH',  yn(1),'2025-01-31'),
    (sr_bright,'Bright Futures Learning Center','UEI-8E1F6G', 'DUNS-56789','NONPROFIT', 'TX','31','LOW',   yn(1),'2025-07-31'),
    (sr_metro, 'Metro Area Transit Authority',  'UEI-9F2G7H', 'DUNS-67890','GOVERNMENT','TX','22','LOW',   yn(1),'2026-02-28'),
    (sr_valley,'Valley Skills Training Center', 'UEI-0G3H8I', 'DUNS-78901','NONPROFIT', 'TX','78','HIGH',  yn(0),'2024-12-31'),
    (sr_summit,'Summit Community Action Agency','UEI-1H4I9J', 'DUNS-89012','NONPROFIT', 'TX','35','MEDIUM',yn(1),'2025-05-31'),
]:
    run(r[1][:25], f'INSERT INTO "{S}"."I_Subrecipient" ("subrecipient_id","subrecipient_name","uei_number","duns_number","entity_type","address_state","risk_score","risk_classification","sam_gov_registered","sam_gov_expiry","address_city","monitoring_status","is_active","created_by") VALUES(?,?,?,?,?,?,?,?,?,?,\'Austin\',\'STANDARD\',\'Y\',\'seed\')', list(r))

print("── Subawards ──")
for r in [
    (id30(),g_cdbg,     sr_hope,  'SA-CDBG-001','CONSTRUCTION',485000,'2023-03-01','2024-02-28','ACTIVE',   yn(1),yn(1)),
    (id30(),g_cdbg,     sr_green, 'SA-CDBG-002','SERVICES',    225000,'2023-04-01','2024-03-31','ACTIVE',   yn(1),yn(1)),
    (id30(),g_title1,   sr_unity, 'SA-T1-001',  'EDUCATION',   380000,'2023-09-01','2024-06-30','ACTIVE',   yn(1),yn(1)),
    (id30(),g_title1,   sr_bright,'SA-T1-002',  'EDUCATION',   290000,'2023-09-01','2024-06-30','ACTIVE',   yn(1),yn(1)),
    (id30(),g_wioa,     sr_nextgen,'SA-WIOA-001','TRAINING',   320000,'2023-08-01','2024-07-31','ACTIVE',   yn(1),yn(1)),
    (id30(),g_wioa,     sr_valley,'SA-WIOA-002','TRAINING',    180000,'2023-08-01','2024-07-31','SUSPENDED',yn(1),yn(0)),
    (id30(),g_home,     sr_hope,  'SA-HOME-001','CONSTRUCTION',410000,'2023-07-01','2025-06-30','ACTIVE',   yn(1),yn(1)),
    (id30(),g_headstart,sr_summit,'SA-HEAD-001','SERVICES',     95000,'2024-02-01','2024-12-31','ACTIVE',   yn(1),yn(1)),
]:
    run(r[4], f'INSERT INTO "{S}"."I_Subaward" ("subaward_id","grant_id","subrecipient_id","subaward_number","subaward_type","subaward_amount","period_start","period_end","subaward_status","exceeds_threshold","sam_gov_reported","place_of_performance_city","place_of_performance_state","reporting_required","created_by") VALUES(?,?,?,?,?,?,?,?,?,?,?,\'Austin\',\'TX\',\'Y\',\'seed\')', list(r))

print("── Subrecipient Monitoring ──")
for r in [
    (sr_hope,  'DESK_REVIEW','2024-01-15','No findings',                           'LOW'),
    (sr_nextgen,'SITE_VISIT','2024-02-20','Minor procurement documentation issues', 'MEDIUM'),
    (sr_unity, 'SITE_VISIT', '2024-03-10','Timekeeping procedures inadequate',     'HIGH'),
    (sr_valley,'SITE_VISIT', '2024-01-08','Internal controls weak; unallowable payments','HIGH'),
    (sr_green, 'DESK_REVIEW','2024-04-01','Clean — all documents received',        'LOW'),
    (sr_bright,'DESK_REVIEW','2024-03-25','One late report, resolved',             'LOW'),
]:
    run(r[0][:8], f'INSERT INTO "{S}"."I_SubrecipientMonitoring" ("monitoring_id","subrecipient_id","monitoring_type","monitoring_date","findings_summary","risk_rating","report_status","created_by") VALUES(?,?,?,?,?,?,\'COMPLETE\',\'seed\')', [id30()]+list(r))

print("── Corrective Actions ──")
for r in [
    (sr_unity, g_title1,'Timekeeping does not meet 2 CFR 200.430','INTERNAL_CONTROL','HIGH',  'Implement biometric time system',   'IN_PROGRESS','2024-06-30'),
    (sr_valley,g_wioa,  'Unallowable costs — entertainment $4,200','UNALLOWABLE_COST','HIGH', 'Repay $4,200; strengthen approvals','OPEN',        '2024-05-15'),
    (sr_nextgen,g_wioa, 'Procurement docs missing for 3 vendors',  'PROCUREMENT',    'MEDIUM','Obtain retroactive documentation',  'IN_PROGRESS','2024-05-31'),
]:
    run(r[2][:25], f'INSERT INTO "{S}"."I_CorrectiveAction" ("action_id","subrecipient_id","grant_id","finding_description","finding_category","severity","action_required","status","due_date","created_by") VALUES(?,?,?,?,?,?,?,?,?,\'seed\')', [id30()]+list(r))

print("── Documents ──")
for r in [
    (g_cdbg,    'GRANT_AGREEMENT','CDBG Award Agreement FY2023',        'LEGAL',    '2023-01-15',1850000),
    (g_cdbg,    'PROGRESS_REPORT','CDBG Q1 2024 Progress Report',       'REPORTING','2024-04-15',None),
    (g_title1,  'GRANT_AGREEMENT','Title I Award Agreement FY2023',     'LEGAL',    '2023-08-10',2400000),
    (g_title1,  'FINANCIAL_REPORT','Title I Q2 Financial Report',       'FINANCIAL','2024-01-31',None),
    (g_wioa,    'GRANT_AGREEMENT','WIOA PY2023 Grant Agreement',        'LEGAL',    '2023-07-01',1200000),
    (g_wioa,    'AUDIT_REPORT',   'WIOA Single Audit FY2023',           'AUDIT',    '2024-03-31',None),
    (g_esser,   'GRANT_AGREEMENT','ESSER III Award Letter',             'LEGAL',    '2023-03-20',3100000),
    (g_home,    'GRANT_AGREEMENT','HOME Partnership Agreement',         'LEGAL',    '2023-06-15',980000),
    (g_headstart,'PROGRESS_REPORT','Head Start Semi-Annual Report',     'REPORTING','2024-07-15',None),
    (g_slfrf,   'GRANT_AGREEMENT','SLFRF Award Terms & Conditions',     'LEGAL',    '2022-05-01',4500000),
    (g_slfrf,   'FINANCIAL_REPORT','SLFRF Project & Expenditure Report','FINANCIAL','2024-04-30',None),
    (g_idea,    'GRANT_AGREEMENT','IDEA Part B State Allocation Letter','LEGAL',    '2023-08-05',1820000),
]:
    run(r[2][:25], f'INSERT INTO "{S}"."I_Document" ("document_id","grant_id","document_type","document_title","document_category","reference_type","reference_id","document_date","amount","status","retention_years","access_level","created_by") VALUES(?,?,?,?,?,\'GRANT\',?,?,?,\'APPROVED\',7,\'INTERNAL\',\'seed\')', [id50(),r[0],r[1],r[2],r[3],r[0],r[4],r[5]])

print("── Approval Records ──")
for r in [
    (g_cdbg,    'GRANT','AWARD_ACCEPTANCE','Director of Grants',  'grants_manager','APPROVED','2023-01-20'),
    (g_title1,  'GRANT','AWARD_ACCEPTANCE','Superintendent',      'executive',     'APPROVED','2023-08-12'),
    (g_wioa,    'GRANT','AWARD_ACCEPTANCE','Workforce Board Chair','executive',    'APPROVED','2023-07-05'),
    (g_esser,   'GRANT','AWARD_ACCEPTANCE','Director of Finance', 'finance_analyst','APPROVED','2023-03-22'),
    (g_home,    'GRANT','AWARD_ACCEPTANCE','Housing Director',    'grants_manager','APPROVED','2023-06-18'),
    (g_slfrf,   'GRANT','AMENDMENT',       'City Manager',        'executive',     'APPROVED','2023-09-15'),
    (g_rap,     'GRANT','CLOSEOUT_REVIEW', 'Director of Grants',  'grants_manager','PENDING', None),
    (g_idea,    'GRANT','AWARD_ACCEPTANCE','Special Ed Director', 'grants_manager','APPROVED','2023-08-08'),
]:
    run(r[2], f'INSERT INTO "{S}"."I_ApprovalRecord" ("approval_id","grant_id","reference_type","reference_id","approval_type","approver_name","approver_role","approval_status","decision_date") VALUES(?,?,?,?,?,?,?,?,?)', [id50(),r[0],r[1],r[0],r[2],r[3],r[4],r[5],r[6]])

print("── Control Evidence ──")
for r in [
    (g_cdbg,  'Procurement compliance review',      'PREVENTIVE','2 CFR 200.317','UNIFORM_GUIDANCE','PASS','2024-02-15'),
    (g_cdbg,  'Subrecipient risk assessment',       'DETECTIVE', '2 CFR 200.331','UNIFORM_GUIDANCE','PASS','2024-01-30'),
    (g_title1,'Eligibility verification — students','PREVENTIVE','34 CFR 200.78','ESEA',            'PASS','2024-03-01'),
    (g_title1,'Supplement not supplant review',     'DETECTIVE', '34 CFR 200.79','ESEA',            'FAIL','2024-03-15'),
    (g_wioa,  'Performance metrics validation',     'DETECTIVE', '20 CFR 683.100','WIOA',           'PASS','2024-02-28'),
    (g_wioa,  'Participant eligibility docs',       'PREVENTIVE','20 CFR 680.110','WIOA',           'PASS','2024-03-10'),
    (g_esser, 'Allowable use of funds review',      'PREVENTIVE','2 CFR 200.405','UNIFORM_GUIDANCE','PASS','2024-01-20'),
    (g_home,  'Environmental review compliance',    'PREVENTIVE','24 CFR 58',    'HOME',            'PASS','2024-02-10'),
    (g_slfrf, 'Project & expenditure reporting',    'DETECTIVE', '31 CFR 35',    'SLFRF',           'PASS','2024-04-25'),
    (g_idea,  'Child count accuracy verification',  'DETECTIVE', '34 CFR 300.640','IDEA',           'PASS','2024-03-20'),
]:
    run(r[1][:25], f'INSERT INTO "{S}"."I_ControlEvidence" ("evidence_id","grant_id","control_name","control_type","cfr_reference","compliance_framework","test_result","evidence_date","fiscal_year","created_by") VALUES(?,?,?,?,?,?,?,?,\'2024\',\'seed\')', [id50()]+list(r))

print("── Outcome Metrics ──")
mp = {met_hu:p_housing,met_hp:p_housing,met_hc:p_housing,
      met_j:p_workforce,met_w:p_workforce,met_r:p_workforce,
      met_pr:p_education,met_gr:p_education,met_at:p_education}
for r in [
    (met_hu,p_housing,  g_cdbg,    'Affordable Housing Units Created', 'OUTPUT',   'Units',  'ANNUAL',    'INCREASE'),
    (met_hp,p_housing,  g_home,    'Persons Housed (Homeless)',         'OUTCOME',  'Persons','QUARTERLY', 'INCREASE'),
    (met_hc,p_housing,  g_slfrf,   'Avg Cost per Housing Unit',         'EFFICIENCY','USD',   'ANNUAL',    'DECREASE'),
    (met_j, p_workforce,g_wioa,    'Adults Entered Employment',         'OUTCOME',  'Persons','QUARTERLY', 'INCREASE'),
    (met_w, p_workforce,g_wioa,    'Median Wage Gain at Placement',     'OUTCOME',  'USD',    'QUARTERLY', 'INCREASE'),
    (met_r, p_workforce,g_snap,    'Employment Retention 2nd Quarter',  'OUTCOME',  'Percent','SEMI_ANNUAL','INCREASE'),
    (met_pr,p_education,g_title1,  'Students Proficient Math',          'OUTCOME',  'Percent','ANNUAL',    'INCREASE'),
    (met_gr,p_education,g_idea,    'Graduation Rate Special Ed',        'OUTCOME',  'Percent','ANNUAL',    'INCREASE'),
    (met_at,p_education,g_headstart,'Average Daily Attendance',         'OUTPUT',   'Percent','MONTHLY',   'INCREASE'),
]:
    run(r[3][:25], f'INSERT INTO "{S}"."I_OutcomeMetric" ("metric_id","program_id","grant_id","metric_name","metric_type","unit_of_measure","measurement_frequency","direction","is_active","created_by") VALUES(?,?,?,?,?,?,?,?,\'Y\',\'seed\')', list(r))

print("── Outcome Targets ──")
for r in [
    (met_hu,'2024',p_housing,  120, 100,80),
    (met_hp,'2024',p_housing,  350, 300,250),
    (met_hc,'2024',p_housing,  185000,200000,220000),
    (met_j, '2024',p_workforce,280, 240,200),
    (met_w, '2024',p_workforce,8500,7200,6000),
    (met_r, '2024',p_workforce,80,  72, 65),
    (met_pr,'2024',p_education,68,  62, 55),
    (met_gr,'2024',p_education,85,  80, 75),
    (met_at,'2024',p_education,92,  88, 85),
]:
    run(r[0][:8], f'INSERT INTO "{S}"."I_OutcomeTarget" ("target_id","metric_id","program_id","fiscal_year","target_value","stretch_target","minimum_threshold","created_by") VALUES(?,?,?,?,?,?,?,\'seed\')', [id30(),r[0],r[2],r[1],r[4],r[3],r[5]])

print("── Outcome Actuals ──")
for r in [
    (met_hu,p_housing,  '2024','Q1','2024-03-31',28,  'ON_TRACK'),
    (met_hu,p_housing,  '2024','Q2','2024-06-30',61,  'ON_TRACK'),
    (met_hp,p_housing,  '2024','Q1','2024-03-31',72,  'ON_TRACK'),
    (met_hp,p_housing,  '2024','Q2','2024-06-30',158, 'ON_TRACK'),
    (met_j, p_workforce,'2024','Q1','2024-03-31',52,  'AT_RISK'),
    (met_j, p_workforce,'2024','Q2','2024-06-30',118, 'AT_RISK'),
    (met_w, p_workforce,'2024','Q1','2024-03-31',7100,'ON_TRACK'),
    (met_w, p_workforce,'2024','Q2','2024-06-30',7350,'ON_TRACK'),
    (met_r, p_workforce,'2024','H1','2024-06-30',74,  'AT_RISK'),
    (met_pr,p_education,'2024','FY','2024-06-30',59,  'AT_RISK'),
    (met_gr,p_education,'2024','FY','2024-06-30',83,  'ON_TRACK'),
    (met_at,p_education,'2024','Q1','2024-03-31',91.2,'ON_TRACK'),
    (met_at,p_education,'2024','Q2','2024-06-30',89.8,'ON_TRACK'),
]:
    run(f"{r[0][:8]} {r[3]}", f'INSERT INTO "{S}"."I_OutcomeActual" ("actual_id","metric_id","program_id","fiscal_year","period","measurement_date","actual_value","performance_status","created_by") VALUES(?,?,?,?,?,?,?,?,\'seed\')', [id30()]+list(r))

print("── Cost to Serve ──")
for r in [
    (p_housing,  '2024','Q2','Housing Unit',    2220000,1998000,222000,120, 18500,22000),
    (p_workforce,'2024','Q2','Job Placement',   1176000,1058400,117600,280, 4200, 5800),
    (p_education,'2024','Q2','Student Served',  2682500,2414250,268250,1450,1850, 2200),
]:
    run(r[3], f'INSERT INTO "{S}"."I_CostToServeUnit" ("cost_unit_id","program_id","fiscal_year","period","service_unit","total_cost","direct_cost","indirect_cost","units_delivered","cost_per_unit","benchmark_cost","created_by") VALUES(?,?,?,?,?,?,?,?,?,?,?,\'seed\')', [id30()]+list(r))

print("── Fund Balance Classifications ──")
for r in [
    (f_general,'2024','Q2',0,      0,      2000000,3000000,7800000,12800000,'GASB 54 Para 34'),
    (f_cdbg,   '2024','Q2',0,      2930000,0,      0,      0,      2930000, 'GASB 54 Para 22'),
    (f_title1, '2024','Q2',0,      3250000,0,      0,      0,      3250000, 'GASB 54 Para 22'),
    (f_wf,     '2024','Q2',0,      1850000,0,      0,      0,      1850000, 'GASB 54 Para 22'),
    (f_cap,    '2024','Q2',0,      0,      5180000,0,      0,      5180000, 'GASB 54 Para 26'),
]:
    run(r[0][:8], f'INSERT INTO "{S}"."I_FundBalanceClassification" ("classification_id","fund_id","fiscal_year","period","nonspendable_amount","restricted_amount","committed_amount","assigned_amount","unassigned_amount","total_fund_balance","gasb_statement_ref","as_of_date","created_by") VALUES(?,?,?,?,?,?,?,?,?,?,?,\'2024-06-30\',\'seed\')', [id30()]+list(r))

print("── Scenario Versions ──")
for r in [
    (sc_base,'FY2024 Base Budget',      'BASE',        '2024',f_general,'APPROVED'),
    (sc_opt, 'FY2024 Optimistic +8%',   'OPTIMISTIC',  '2024',f_general,'DRAFT'),
    (sc_cons,'FY2024 Conservative -5%', 'CONSERVATIVE','2024',f_general,'APPROVED'),
]:
    run(r[1], f'INSERT INTO "{S}"."I_ScenarioVersion" ("scenario_id","scenario_name","scenario_type","fiscal_year","fund_id","status","created_by") VALUES(?,?,?,?,?,?,\'seed\')', list(r))

print("── Forecast Entries ──")
for i,r in enumerate([
    (sc_base,f_cdbg, g_cdbg, p_housing,  '2024','Q1','EXPENDITURE',1850000,1850000,412000, 0,    480000, 1850000,0,     0.0,'85','HISTORICAL_TREND','N','NONE'),
    (sc_base,f_cdbg, g_cdbg, p_housing,  '2024','Q2','EXPENDITURE',1850000,1850000,890000, 45000,980000, 1850000,0,     0.0,'88','HISTORICAL_TREND','N','NONE'),
    (sc_base,f_title1,g_title1,p_education,'2024','Q1','EXPENDITURE',2400000,2400000,520000,0,    600000, 2400000,0,    0.0,'90','HISTORICAL_TREND','N','NONE'),
    (sc_base,f_title1,g_esser,p_education,'2024','Q2','EXPENDITURE',3100000,3100000,1800000,120000,2100000,3100000,0,   0.0,'82','HISTORICAL_TREND','Y','MEDIUM'),
    (sc_base,f_wf,   g_wioa, p_workforce,'2024','Q1','EXPENDITURE',1200000,1200000,220000, 0,    280000, 1200000,-80000,-6.7,'75','REGRESSION',     'Y','HIGH'),
    (sc_base,f_wf,   g_wioa, p_workforce,'2024','Q2','EXPENDITURE',1200000,1200000,480000, 30000,560000, 1200000,-40000,-3.3,'78','REGRESSION',     'N','MEDIUM'),
    (sc_base,f_general,g_slfrf,p_housing,'2024','Q1','EXPENDITURE',4500000,4500000,980000, 0,    1100000,4500000,0,    0.0,'92','HISTORICAL_TREND','N','NONE'),
    (sc_cons,f_cdbg, g_cdbg, p_housing,  '2024','Q2','EXPENDITURE',1850000,1757500,890000, 45000,930000, 1757500,-92500,-5.0,'75','MANAGEMENT_INPUT','N','LOW'),
    (sc_opt, f_title1,g_title1,p_education,'2024','Q2','EXPENDITURE',2400000,2592000,520000,0,   640000, 2592000,192000,8.0,'70','MANAGEMENT_INPUT','N','NONE'),
]):
    run(f"Forecast {i+1}", f'INSERT INTO "{S}"."I_ForecastEntry" ("forecast_id","scenario_id","fund_id","grant_id","program_id","fiscal_year","period","forecast_type","original_budget","revised_budget","actuals_to_date","encumbrances","forecast_amount","year_end_projection","variance_from_budget","variance_pct","confidence_level","forecast_basis","early_warning_flag","underspend_risk","created_by") VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,\'seed\')', [id30()]+list(r))

print("── Audit Log ──")
for r in [
    ('I_GrantMaster', g_cdbg,  'INSERT','admin', 'admin@sierradigitalinc.com'),
    ('I_Subaward',    id20(),   'INSERT','system','grants@sierradigitalinc.com'),
    ('I_GrantMaster', g_wioa,  'UPDATE','admin', 'admin@sierradigitalinc.com'),
    ('I_Subrecipient',sr_valley,'UPDATE','system','grants@sierradigitalinc.com'),
    ('I_Subaward',    id20(),   'UPDATE','admin', 'admin@sierradigitalinc.com'),
]:
    run(r[2]+' '+r[0], f'INSERT INTO "{S}"."I_AuditLog" ("log_id","entity_type","entity_id","event_type","user_id","user_name","ip_address") VALUES(?,?,?,?,?,?,\'127.0.0.1\')', [id50(),r[0],r[1],r[2],r[3],r[4]])

print(f"\n{'='*60}")
print(f"  DONE  OK:{ok}  ERR:{err}  Total:{ok+err}")
print(f"{'='*60}\nRow counts:")
for t in ['I_Program','I_Fund','I_GrantMaster','I_AllowabilityRule',
          'I_Subrecipient','I_Subaward','I_SubrecipientMonitoring',
          'I_CorrectiveAction','I_Document','I_ApprovalRecord',
          'I_ControlEvidence','I_OutcomeMetric','I_OutcomeTarget',
          'I_OutcomeActual','I_CostToServeUnit','I_FundBalanceClassification',
          'I_ScenarioVersion','I_ForecastEntry','I_AuditLog']:
    cur.execute(f'SELECT COUNT(*) FROM "{S}"."{t}"')
    cnt = cur.fetchone()[0]
    print(f"  {'✓' if cnt>0 else '○'} {t:<40} {cnt}")
conn.close()
