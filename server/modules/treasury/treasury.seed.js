/**
 * treasury.seed.js
 * Called once via POST /api/treasury/seed (protected by SEED_SECRET env var)
 * Creates Phase 4 tables and inserts demo data into HANA.
 */
import { query, SCHEMA as S } from '../../connectors/hana.js';

async function run(label, sql) {
  try {
    await query(sql);
    console.log(`  ✓ ${label}`);
  } catch (e) {
    console.warn(`  ⚠ ${label}: ${e.message}`);
  }
}

export async function seedPhase4() {
  const logs = [];
  const log  = (msg) => { console.log(msg); logs.push(msg); };

  log('Phase 4 seed — start');

  // ── I_CashAccount ────────────────────────────────────────────────────────
  await run('drop I_CashAccount',  `DROP TABLE ${S}."I_CashAccount" CASCADE`);
  await run('create I_CashAccount', `
    CREATE TABLE ${S}."I_CashAccount" (
      "account_id"            NVARCHAR(20)  PRIMARY KEY,
      "account_name"          NVARCHAR(100) NOT NULL,
      "account_type"          NVARCHAR(20)  NOT NULL,
      "fund_id"               NVARCHAR(20),
      "balance"               DECIMAL(18,2) NOT NULL,
      "as_of_date"            DATE          NOT NULL,
      "bank_name"             NVARCHAR(80)  NOT NULL,
      "account_number_last4"  NVARCHAR(4)   NOT NULL
    )`);

  const cashRows = [
    `('CA-001','General Fund Operating','OPERATING','GF-001',18450000,'2026-03-31','First National Bank','4821')`,
    `('CA-002','Public Safety Operations','OPERATING','PS-002',5230000,'2026-03-31','First National Bank','3917')`,
    `('CA-003','Capital Improvement Reserve','RESERVE','CIP-003',12750000,'2026-03-31','State Treasury Dept','6643')`,
    `('CA-004','Emergency Reserve Fund','RESERVE','ER-004',8100000,'2026-03-31','State Treasury Dept','5512')`,
    `('CA-005','CDBG Grant Restricted','RESTRICTED','GR-005',2340000,'2026-03-31','Community Bank','7890')`,
    `('CA-006','ARPA Federal Restricted','RESTRICTED','GR-006',6880000,'2026-03-31','Community Bank','2234')`,
    `('CA-007','Debt Service Reserve','RESERVE','DS-007',4500000,'2026-03-31','Municipal Trust Co','8801')`,
    `('CA-008','Water Utility Operating','OPERATING','UT-008',3125000,'2026-03-31','First National Bank','1156')`,
    `('CA-009','Transportation Fund','OPERATING','TR-009',2670000,'2026-03-31','Regional Savings Bank','9923')`,
    `('CA-010','Investment Pool Account','INVESTMENT',NULL,22000000,'2026-03-31','State Investment Pool','0044')`,
  ];
  for (const r of cashRows) await run(`insert cash ${r.slice(1,8)}`, `INSERT INTO ${S}."I_CashAccount" VALUES ${r}`);

  // ── I_Investment ─────────────────────────────────────────────────────────
  await run('drop I_Investment',  `DROP TABLE ${S}."I_Investment" CASCADE`);
  await run('create I_Investment', `
    CREATE TABLE ${S}."I_Investment" (
      "investment_id"   NVARCHAR(20)  PRIMARY KEY,
      "investment_type" NVARCHAR(20)  NOT NULL,
      "issuer"          NVARCHAR(100) NOT NULL,
      "par_value"       DECIMAL(18,2) NOT NULL,
      "current_value"   DECIMAL(18,2) NOT NULL,
      "purchase_date"   DATE          NOT NULL,
      "maturity_date"   DATE          NOT NULL,
      "yield_rate"      DECIMAL(6,4)  NOT NULL,
      "rating"          NVARCHAR(10),
      "status"          NVARCHAR(15)  NOT NULL
    )`);

  const invRows = [
    `('INV-001','TBILL','US Treasury',3000000,3008400,'2025-10-01',ADD_DAYS(CURRENT_DATE,45),0.0531,'AAA','ACTIVE')`,
    `('INV-002','TBILL','US Treasury',2500000,2507500,'2025-11-15',ADD_DAYS(CURRENT_DATE,72),0.0525,'AAA','ACTIVE')`,
    `('INV-003','BOND','State of California',5000000,5125000,'2023-06-01',ADD_DAYS(CURRENT_DATE,450),0.0425,'AA+','ACTIVE')`,
    `('INV-004','BOND','City of San Francisco GO',2000000,1985000,'2022-09-15',ADD_DAYS(CURRENT_DATE,820),0.0380,'AA','ACTIVE')`,
    `('INV-005','MONEY_MARKET','Federated Investors',4000000,4018200,'2026-01-01',ADD_DAYS(CURRENT_DATE,180),0.0512,'AAA','ACTIVE')`,
    `('INV-006','MONEY_MARKET','Vanguard Prime MMF',3500000,3514700,'2026-02-01',ADD_DAYS(CURRENT_DATE,150),0.0508,'AAA','ACTIVE')`,
    `('INV-007','CD','First National Bank',1000000,1011000,'2025-09-01',ADD_DAYS(CURRENT_DATE,60),0.0465,'AA-','ACTIVE')`,
    `('INV-008','CD','Regional Savings Bank',1500000,1518750,'2025-07-15',ADD_DAYS(CURRENT_DATE,100),0.0450,'A+','ACTIVE')`,
    `('INV-009','AGENCY','Federal Home Loan Bank',3000000,3042000,'2024-03-01',ADD_DAYS(CURRENT_DATE,600),0.0395,'AAA','ACTIVE')`,
    `('INV-010','BOND','Sacramento Unified SD Bond',1500000,1467000,'2021-11-01',ADD_DAYS(CURRENT_DATE,1200),0.0315,'AA','ACTIVE')`,
    `('INV-011','TBILL','US Treasury',2000000,2012000,'2025-08-01',ADD_DAYS(CURRENT_DATE,-15),0.0518,'AAA','MATURED')`,
    `('INV-012','CD','Community Bank',500000,512500,'2024-06-01',ADD_DAYS(CURRENT_DATE,320),0.0442,'A','ACTIVE')`,
  ];
  for (const r of invRows) await run(`insert inv ${r.slice(1,8)}`, `INSERT INTO ${S}."I_Investment" VALUES ${r}`);

  // ── I_DebtService ─────────────────────────────────────────────────────────
  await run('drop I_DebtService',  `DROP TABLE ${S}."I_DebtService" CASCADE`);
  await run('create I_DebtService', `
    CREATE TABLE ${S}."I_DebtService" (
      "debt_id"             NVARCHAR(20)  PRIMARY KEY,
      "bond_description"    NVARCHAR(150) NOT NULL,
      "bond_type"           NVARCHAR(20)  NOT NULL,
      "original_principal"  DECIMAL(18,2) NOT NULL,
      "outstanding_balance" DECIMAL(18,2) NOT NULL,
      "interest_rate"       DECIMAL(6,4)  NOT NULL,
      "next_payment_date"   DATE          NOT NULL,
      "annual_payment"      DECIMAL(18,2) NOT NULL,
      "maturity_year"       SMALLINT      NOT NULL
    )`);

  const debtRows = [
    `('DS-001','2018 GO Bonds - Streets & Roads','GO_BOND',25000000,18750000,0.0375,ADD_DAYS(CURRENT_DATE,25),1562500,2033)`,
    `('DS-002','2020 GO Bonds - Public Safety Facility','GO_BOND',15000000,13500000,0.0325,ADD_DAYS(CURRENT_DATE,55),1012500,2035)`,
    `('DS-003','2019 Revenue Bonds - Water Treatment Plant','REVENUE_BOND',30000000,22800000,0.0410,ADD_DAYS(CURRENT_DATE,82),1966800,2034)`,
    `('DS-004','2021 Revenue Bonds - Convention Center','REVENUE_BOND',20000000,18400000,0.0355,ADD_DAYS(CURRENT_DATE,110),1476200,2036)`,
    `('DS-005','2022 COP - Fleet & Equipment Replacement','COP',8000000,6400000,0.0285,ADD_DAYS(CURRENT_DATE,140),614400,2032)`,
    `('DS-006','2016 GO Refunding Bonds','GO_BOND',10000000,4500000,0.0290,ADD_DAYS(CURRENT_DATE,175),472500,2028)`,
    `('DS-007','2023 Lease Revenue Bonds - Library Renovation','LEASE',5000000,4750000,0.0420,ADD_DAYS(CURRENT_DATE,200),399000,2038)`,
    `('DS-008','2017 Revenue Bonds - Stormwater Infrastructure','REVENUE_BOND',12000000,7200000,0.0365,ADD_DAYS(CURRENT_DATE,250),810000,2030)`,
  ];
  for (const r of debtRows) await run(`insert debt ${r.slice(1,7)}`, `INSERT INTO ${S}."I_DebtService" VALUES ${r}`);

  // ── I_TaxRevenue ─────────────────────────────────────────────────────────
  await run('drop I_TaxRevenue',  `DROP TABLE ${S}."I_TaxRevenue" CASCADE`);
  await run('create I_TaxRevenue', `
    CREATE TABLE ${S}."I_TaxRevenue" (
      "record_id"        NVARCHAR(30)  PRIMARY KEY,
      "tax_type"         NVARCHAR(30)  NOT NULL,
      "fiscal_month"     SMALLINT      NOT NULL,
      "fiscal_year"      SMALLINT      NOT NULL,
      "period_label"     NVARCHAR(20)  NOT NULL,
      "amount_collected" DECIMAL(14,2) NOT NULL,
      "amount_budgeted"  DECIMAL(14,2) NOT NULL
    )`);

  // Tax data: 5 tax types × 2 years × 12 months
  const taxData = {
    PROPERTY_TAX:     { c:[1850000,1820000,1890000,1760000,1830000,1900000,1870000,1810000,1955000,1780000,1840000,1920000], b:1800000 },
    SALES_TAX:        { c:[2100000,2050000,2230000,1980000,2150000,2400000,2200000,2310000,2050000,1960000,2180000,2550000], b:2000000 },
    UTILITY_TAX:      { c:[720000,695000,710000,680000,705000,730000,715000,698000,722000,690000,708000,735000], b:700000 },
    BUSINESS_LICENSE: { c:[280000,295000,310000,270000,285000,300000,288000,292000,305000,275000,280000,315000], b:290000 },
    TRANSIENT_OCC_TAX:{ c:[195000,185000,210000,240000,290000,380000,420000,445000,380000,310000,220000,195000], b:280000 },
  };
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  const currYear = now.getFullYear();
  const currMonth = now.getMonth() + 1;

  for (const yr of [currYear - 1, currYear]) {
    for (let m = 1; m <= 12; m++) {
      if (yr === currYear && m > currMonth) break;
      for (const [tt, td] of Object.entries(taxData)) {
        const rid    = `${tt.slice(0,8)}-${yr}-${String(m).padStart(2,'0')}`;
        const label  = `${monthNames[m-1]} ${yr}`;
        const coll   = td.c[m - 1];
        const budg   = td.b;
        await run(`tax ${tt.slice(0,4)} ${label}`,
          `INSERT INTO ${S}."I_TaxRevenue" VALUES('${rid}','${tt}',${m},${yr},'${label}',${coll},${budg})`);
      }
    }
  }

  // ── I_ExecutiveAlert ─────────────────────────────────────────────────────
  await run('drop I_ExecutiveAlert',  `DROP TABLE ${S}."I_ExecutiveAlert" CASCADE`);
  await run('create I_ExecutiveAlert', `
    CREATE TABLE ${S}."I_ExecutiveAlert" (
      "alert_id"     NVARCHAR(20)  PRIMARY KEY,
      "domain"       NVARCHAR(30)  NOT NULL,
      "severity"     NVARCHAR(10)  NOT NULL,
      "title"        NVARCHAR(150) NOT NULL,
      "description"  NVARCHAR(500) NOT NULL,
      "created_date" DATE          NOT NULL,
      "status"       NVARCHAR(20)  NOT NULL,
      "assigned_to"  NVARCHAR(80)
    )`);

  const alertRows = [
    ['ALT-001','GRANTS','HIGH','Grant Burn Rate Below Threshold',
     'ARPA Economic Recovery grant at 34% spend with 5 months remaining. Risk of reversion if pace not increased.',
     '2026-03-28','OPEN','Grants Director'],
    ['ALT-002','PROCUREMENT','HIGH','3 Invoices Pending Over 60 Days',
     'Three vendor invoices totaling $148,500 exceed 60-day payment terms. Penalty interest accruing.',
     '2026-03-25','ACKNOWLEDGED','AP Manager'],
    ['ALT-003','FLEET','HIGH','Fire Department Vehicle OOS - Capacity Risk',
     'Unit FL-0042 out of service since Mar 18. No backup unit available. Fire coverage reduced in District 3.',
     '2026-03-18','OPEN','Fleet Director'],
    ['ALT-004','TREASURY','MEDIUM','Debt Payment Due in 25 Days',
     '2018 GO Bonds semi-annual payment of $781,250 due Apr 30. Confirm fund availability with Finance.',
     '2026-04-01','OPEN','Treasurer'],
    ['ALT-005','ASSETS','MEDIUM','HVAC Preventive Maintenance Overdue - City Hall',
     'City Hall HVAC PM last performed Oct 2025. Scheduled for Feb 2026 - now 45 days overdue.',
     '2026-03-20','ACKNOWLEDGED','Facilities Manager'],
    ['ALT-006','HR','MEDIUM','7 Vacant Positions in Critical Roles',
     'Engineering (3), IT (2), and Finance (2) positions unfilled over 90 days. Workload strain reported.',
     '2026-03-15','OPEN','HR Director'],
    ['ALT-007','INVENTORY','MEDIUM','Public Works Materials Below Reorder Point',
     'Asphalt, aggregate, and pipe fittings below reorder threshold. Spring construction season approaching.',
     '2026-03-29','OPEN','Warehouse Manager'],
    ['ALT-008','CAPITAL','MEDIUM','Downtown Plaza Project 12% Over Budget',
     'Project CP-0031 actual spend $2.85M vs $2.54M approved budget. Change order review required.',
     '2026-03-22','ACKNOWLEDGED','Capital Projects Dir'],
    ['ALT-009','FINANCE','LOW','Q3 Budget Variance Report Due',
     'Q3 FY2026 budget variance analysis due to City Council April 15. Draft preparation underway.',
     '2026-04-02','OPEN','Finance Director'],
    ['ALT-010','GRANTS','LOW','Annual Performance Report Deadline',
     'HUD CDBG annual performance report due June 30. Data collection to begin May 1.',
     '2026-03-30','OPEN','Grants Analyst'],
    ['ALT-011','TREASURY','LOW','3 T-Bills Maturing - Reinvestment Decision Needed',
     'US Treasury Bills INV-001 and INV-002 maturing within 45-72 days. Investment policy review required.',
     '2026-04-01','OPEN','Treasurer'],
    ['ALT-012','PROCUREMENT','LOW','2 Contracts Expiring Within 90 Days',
     'Janitorial services and landscaping contracts expire June 30. Renewal or re-bid required by May 1.',
     '2026-03-24','ACKNOWLEDGED','Procurement Manager'],
  ];
  for (const r of alertRows) {
    const [id,dom,sev,title,desc,dt,status,assigned] = r;
    await run(`alert ${id}`,
      `INSERT INTO ${S}."I_ExecutiveAlert" VALUES(` +
      `'${id}','${dom}','${sev}','${title.replace(/'/g,"''")}',` +
      `'${desc.replace(/'/g,"''")}','${dt}','${status}',` +
      `${assigned ? `'${assigned}'` : 'NULL'})`);
  }

  // ── I_KPIBenchmark ────────────────────────────────────────────────────────
  await run('drop I_KPIBenchmark',  `DROP TABLE ${S}."I_KPIBenchmark" CASCADE`);
  await run('create I_KPIBenchmark', `
    CREATE TABLE ${S}."I_KPIBenchmark" (
      "benchmark_id"  NVARCHAR(20)  PRIMARY KEY,
      "domain"        NVARCHAR(30)  NOT NULL,
      "kpi_name"      NVARCHAR(80)  NOT NULL,
      "current_value" DECIMAL(14,4) NOT NULL,
      "target_value"  DECIMAL(14,4) NOT NULL,
      "peer_avg"      DECIMAL(14,4) NOT NULL,
      "unit"          NVARCHAR(20)  NOT NULL,
      "trend"         NVARCHAR(10)  NOT NULL,
      "period"        NVARCHAR(20)  NOT NULL
    )`);

  const bmRows = [
    ['BM-001','GRANTS','Grant Spend Rate',87.4,95.0,82.1,'pct','UP','Q1 FY2026'],
    ['BM-002','GRANTS','Compliance Rate',96.2,98.0,94.5,'pct','STABLE','Q1 FY2026'],
    ['BM-003','GRANTS','Report Submission On-Time',91.7,100.0,88.0,'pct','UP','Q1 FY2026'],
    ['BM-004','FINANCE','Budget Utilisation Rate',72.8,85.0,75.3,'pct','UP','YTD FY2026'],
    ['BM-005','FINANCE','Days Cash on Hand',142.0,120.0,105.0,'days','UP','Mar 2026'],
    ['BM-006','FINANCE','Debt Coverage Ratio',2.4,2.0,1.8,'ratio','STABLE','FY2026'],
    ['BM-007','TREASURY','Investment Yield Avg',4.8,4.5,4.2,'pct','UP','Q1 FY2026'],
    ['BM-008','TREASURY','Tax Collection Rate',97.3,98.0,95.6,'pct','UP','FY2026 YTD'],
    ['BM-009','TREASURY','Debt-to-Revenue Ratio',18.4,20.0,22.5,'pct','DOWN','FY2026'],
    ['BM-010','HR','Employee Turnover Rate',8.2,7.0,9.5,'pct','DOWN','FY2026 YTD'],
    ['BM-011','HR','Vacancy Fill Time Days',52.0,45.0,58.0,'days','DOWN','Q1 FY2026'],
    ['BM-012','HR','Training Hours Per Employee',18.5,24.0,16.8,'hours','UP','FY2026 YTD'],
    ['BM-013','FLEET','Fleet Availability Rate',88.5,92.0,87.0,'pct','DOWN','Q1 FY2026'],
    ['BM-014','FLEET','Cost Per Mile',0.58,0.55,0.62,'USD','UP','Q1 FY2026'],
    ['BM-015','ASSETS','PM Completion Rate',78.4,90.0,81.2,'pct','DOWN','Q1 FY2026'],
    ['BM-016','ASSETS','Mean Time to Repair Hrs',14.2,12.0,16.5,'hours','DOWN','Q1 FY2026'],
    ['BM-017','PROCUREMENT','Invoice Processing Days',4.8,3.0,5.5,'days','DOWN','Q1 FY2026'],
    ['BM-018','PROCUREMENT','Competitive Bid Rate',72.3,80.0,69.8,'pct','UP','FY2026 YTD'],
    ['BM-019','INVENTORY','Inventory Turnover Rate',6.2,8.0,5.8,'turns','UP','FY2026 YTD'],
    ['BM-020','INVENTORY','Stockout Incidents',3.0,0.0,4.5,'count','DOWN','Q1 FY2026'],
  ];
  for (const r of bmRows) {
    const [id,dom,kpi,curr,tgt,peer,unit,trend,period] = r;
    await run(`benchmark ${id}`,
      `INSERT INTO ${S}."I_KPIBenchmark" VALUES('${id}','${dom}','${kpi}',${curr},${tgt},${peer},'${unit}','${trend}','${period}')`);
  }

  log('Phase 4 seed — complete');
  return logs;
}
