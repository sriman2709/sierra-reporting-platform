/**
 * helpContent.js — Single source of truth for all help content.
 * Used by both Help.jsx (full help centre) and HelpDrawer.jsx (contextual slide-over).
 */

export const HELP_CONTENT = {
  '/': {
    icon: '⊞', label: 'Dashboard', color: '#1a5c9e',
    summary: 'The Dashboard is your platform home — 10 live cross-domain KPI tiles, 14 module cards, and quick-launch shortcuts to the AI Agent Hub and Sierra Intelligence.',
    tabs: ['Platform KPIs', 'Module Cards', 'AI Quick-Launch'],
    tips: [
      'Click any module card to navigate directly to that module.',
      'The 10 KPI tiles pull live data from SAP HANA Cloud on every page load — no caching.',
      'Use the Agent Hub card to kick off a full domain risk analysis in one click.',
    ],
    ai_examples: [
      'What is our overall financial health across all domains?',
      'Which modules have the most critical alerts right now?',
      'Give me a cross-domain executive summary for today.',
    ],
  },

  '/grants': {
    icon: '🏛', label: 'Grants Management', color: '#1a5c9e',
    summary: 'Manage the full grant lifecycle — compliance posture scoring, burn rate monitoring, subrecipient risk, and 2 CFR Part 200 allowability rules.',
    tabs: ['Portfolio Overview', 'Compliance Posture', 'Subrecipient Risk', 'Allowability Rules', 'Audit Findings'],
    tips: [
      'Burn rate > 1.0 means spending faster than time elapsed — flag for program officer review.',
      'Any grant with compliance score below 40 is AT_RISK and should be your first priority.',
      'Use the Allowability Rules tab before approving expenditures to avoid disallowed costs.',
    ],
    ai_examples: [
      'Which grants are over-burning their budget this quarter?',
      'Show me compliance posture for all federal grants.',
      'Which subrecipients are high risk and what findings do they have?',
    ],
  },

  '/funds': {
    icon: '💰', label: 'Fund Accounting', color: '#38a169',
    summary: 'Track fund balances, available-to-spend, encumbrances, and GASB-54 fund type classifications across the entire fund portfolio.',
    tabs: ['Portfolio Overview', 'Available-to-Spend', 'GASB-54 Classifications', 'Budget vs Actuals Trend'],
    tips: [
      'Available-to-Spend = Budget − YTD Expenditures − Encumbrances. Watch this number, not just the balance.',
      'CRITICAL status means less than 10% of budget remains — escalate immediately.',
      'Encumbrances represent committed but unpaid obligations — they reduce available funds even before payment.',
    ],
    ai_examples: [
      'Which funds are over budget or critically low on available balance?',
      'What is total available-to-spend across all restricted funds?',
      'Show me budget vs actuals by department for the current fiscal year.',
    ],
  },

  '/finance': {
    icon: '📒', label: 'Finance Controller', color: '#2c7a7b',
    summary: 'Monitor budget vs actuals by department, track period close readiness, and review journal entry exceptions and interfund activity.',
    tabs: ['Budget vs Actuals', 'Close Readiness', 'Journal Exceptions', 'Interfund Activity'],
    tips: [
      'Sort the variance table by Variance % descending to find the worst-performing departments first.',
      'Close readiness checklist should be 100% before the CFO signs off on the period.',
      'Journal exceptions with no supporting document reference are audit red flags — investigate promptly.',
    ],
    ai_examples: [
      'Which departments are over budget this fiscal year?',
      'What is the budget variance by department?',
      'Is the organization ready for period close?',
    ],
  },

  '/procurement': {
    icon: '🛒', label: 'Procurement & AP', color: '#7c3aed',
    summary: 'Monitor contracts for expiry risk, track AP aging and overdue invoices, score vendor risk, and manage the procurement pipeline.',
    tabs: ['Dashboard', 'Contracts', 'AP Aging', 'Vendor Risk', 'Procurement Pipeline'],
    tips: [
      'Start contract renewal at least 60 days before expiry — procurement cycles take time.',
      'Invoices 90+ days overdue are a vendor relationship risk — escalate to department heads.',
      'Never process payments to vendors with DEBARRED status — this is a federal compliance violation.',
    ],
    ai_examples: [
      'Which contracts are expiring in the next 60 days?',
      'Which vendors have the highest risk scores?',
      'What is our AP aging situation — how much is 90+ days overdue?',
    ],
  },

  '/treasury': {
    icon: '🏦', label: 'Treasury & Revenue', color: '#0369a1',
    summary: 'Monitor cash position across all accounts, manage the investment portfolio, track debt service obligations, and analyse tax revenue by type.',
    tabs: ['Overview', 'Cash Position', 'Investments', 'Debt Service', 'Tax Revenue'],
    tips: [
      'Review the Debt Service tab monthly — payments due within 30 days are flagged in red.',
      'Investments maturing within 90 days need a reinvestment decision — engage your investment advisor.',
      'Compare tax revenue collection to monthly budget to identify shortfalls early in the fiscal year.',
    ],
    ai_examples: [
      'What is our current cash position across all accounts?',
      'Which investments are maturing in the next 90 days?',
      'How is tax revenue tracking vs budget by type?',
    ],
  },

  '/subawards': {
    icon: '📋', label: 'Subaward & Compliance', color: '#d69e2e',
    summary: 'Track subrecipient monitoring obligations, manage corrective actions from findings, and validate cost allowability under 2 CFR Part 200.',
    tabs: ['Subrecipient Monitor', 'Corrective Actions', 'Allowability Rules'],
    tips: [
      'HIGH-risk subrecipients require on-site monitoring visits — schedule these proactively.',
      'Overdue progress reports must be escalated — they are a red flag in federal audits.',
      'Check the Allowability tab before approving any unusual expenditure charged to a federal grant.',
    ],
    ai_examples: [
      'Which subrecipients are high risk?',
      'Which subrecipients have overdue progress reports?',
      'Is entertainment expense allowable under federal grants?',
    ],
  },

  '/outcomes': {
    icon: '📈', label: 'Outcome Metrics', color: '#805ad5',
    summary: 'Measure program effectiveness with composite scores, compare cost-per-outcome to peer benchmarks, and link grant awards to program performance.',
    tabs: ['Dashboard', 'Program Effectiveness', 'Metric Trend', 'Cost-Effectiveness', 'Grant Linkage'],
    tips: [
      'Effectiveness score below 50 on a grant-funded program is a risk for grant renewal — flag for program officer.',
      'Cost-per-outcome above peer average signals inefficiency — investigate before the next budget cycle.',
      'The Grant Linkage tab is essential for federal performance reports (GPRA, SAM.gov submissions).',
    ],
    ai_examples: [
      'Which programs are most cost-effective vs peer benchmarks?',
      'Show me outcome trend data for all programs over time.',
      'Which grant-funded programs are not meeting their targets?',
    ],
  },

  '/audit': {
    icon: '🔍', label: 'Audit Readiness', color: '#dd6b20',
    summary: 'Track audit findings by severity, monitor evidence completeness by grant, and prepare Single Audit packages for federal submission.',
    tabs: ['Finding Summary', 'Finding Register', 'Evidence Completeness', 'Export Package'],
    tips: [
      'Material findings in federal programs must appear in your Schedule of Findings — never leave these untracked.',
      'Corrective actions past their due date will become repeat findings in the next audit cycle.',
      'Use the Export Package tab to generate FAC-ready submission documents before your auditor arrives.',
    ],
    ai_examples: [
      'How many open audit findings do we have and what is their severity?',
      'Which grants have material findings?',
      'Are any corrective actions past their due date?',
    ],
  },

  '/forecast': {
    icon: '📊', label: 'Financial Forecast', color: '#e53e3e',
    summary: 'Build what-if scenarios, run fund sensitivity analysis, and monitor budget variance trends across the fiscal year.',
    tabs: ['Variance Dashboard', 'What-If Scenarios', 'Sensitivity Analysis'],
    tips: [
      'Use sensitivity analysis before budget hearings to show council the impact of revenue shortfalls.',
      'Model a 10% revenue reduction scenario at the start of each quarter as a stress test.',
      'Funds rated HIGH sensitivity should have contingency plans in place before the fiscal year ends.',
    ],
    ai_examples: [
      'Run a sensitivity analysis on all funds.',
      'What happens to our General Fund if revenue drops 10%?',
      'Show me budget variance trends for the last 6 months.',
    ],
  },

  '/capital-projects': {
    icon: '🏗', label: 'Capital Projects & CIP', color: '#c05621',
    summary: 'Track capital project health (ON_TRACK/AT_RISK/DELAYED), manage milestones and change orders, and monitor CIP funding sources.',
    tabs: ['Dashboard', 'Project Register', 'Milestones', 'Change Orders', 'CIP Funding'],
    tips: [
      'AT_RISK projects need a recovery plan submitted within 2 weeks — document it in the change order log.',
      'Cumulative change orders exceeding 10% of original budget typically require a formal budget amendment.',
      'DELAYED projects past their scheduled completion date must be reported to the governing board.',
    ],
    ai_examples: [
      'Which capital projects are delayed or at risk?',
      'Show me change orders for all active projects.',
      'What percentage of the CIP is grant-funded?',
    ],
  },

  '/assets': {
    icon: '🔧', label: 'Assets & Maintenance', color: '#276749',
    summary: 'Track asset condition ratings (1–5), manage work orders by type and priority, monitor preventive maintenance compliance, and analyse failure events.',
    tabs: ['Dashboard', 'Asset Register', 'Work Orders', 'PM Compliance', 'Failure Analysis'],
    tips: [
      'Condition rating ≤ 2 means the asset is CRITICAL — escalate to department head immediately.',
      'EMERGENCY work orders should be dispatched within 2 hours of creation.',
      'PM compliance below 80% in a quarter leads to accelerated asset degradation and higher repair costs.',
    ],
    ai_examples: [
      'Which assets have a critical condition rating?',
      'How many emergency work orders are open right now?',
      'What is our PM compliance rate by department?',
    ],
  },

  '/inventory': {
    icon: '📦', label: 'Inventory & Warehouse', color: '#5a67d8',
    summary: 'Monitor stock levels across all warehouses, receive OUT_OF_STOCK and LOW_STOCK alerts, review reorder needs, and track stock transactions.',
    tabs: ['Dashboard', 'Inventory Items', 'Stock Alerts', 'Transactions', 'Warehouse Summary'],
    tips: [
      'OUT_OF_STOCK items at the top of the Alerts tab are your most urgent procurement needs.',
      'Current Stock ≤ Reorder Point means a purchase order should already be in flight.',
      'Check warehouse utilization — an overstocked warehouse ties up working capital unnecessarily.',
    ],
    ai_examples: [
      'Which items are out of stock across all warehouses?',
      'Show me stock alerts and what needs to be reordered.',
      'Which warehouse has the highest turnover ratio?',
    ],
  },

  '/hr': {
    icon: '👥', label: 'HR & Workforce', color: '#b7791f',
    summary: 'Monitor employee headcount, position control (budgeted vs filled), vacancy rate, grant-funded FTEs, and payroll allocation by fund.',
    tabs: ['Dashboard', 'Employee Roster', 'Position Control', 'Payroll Fund Allocation', 'Workforce Summary'],
    tips: [
      'Vacancy rates above 15% in critical departments may indicate service delivery risk — flag for HR director.',
      'Grant-funded positions must be filled to maintain federal drawdown rates — vacant grant FTEs risk refund demands.',
      'Payroll allocation to grants must match effort certifications — discrepancies are a common audit finding.',
    ],
    ai_examples: [
      'What is our current vacancy rate and how many positions are unfilled?',
      'How many FTEs are grant-funded and which grants are they charged to?',
      'Which departments have the highest turnover rates?',
    ],
  },

  '/fleet': {
    icon: '🚗', label: 'Fleet Management', color: '#2d3748',
    summary: 'Track vehicle health and status, monitor fuel consumption by department, enforce inspection compliance, and report fleet operating cost.',
    tabs: ['Dashboard', 'Vehicle Register', 'Fuel Consumption', 'Inspection Compliance', 'Fleet Cost by Dept'],
    tips: [
      'Vehicles with OVERDUE inspections should be pulled from service immediately — liability risk.',
      'OUT_OF_SERVICE fleet rate above 15% in a department may impact service delivery.',
      'Compare fuel cost per mile across vehicle types to identify inefficient vehicles for replacement.',
    ],
    ai_examples: [
      'Which vehicles are out of service right now?',
      'Which vehicles have overdue inspections?',
      'What is fleet fuel cost by department this year?',
    ],
  },

  '/executive': {
    icon: '🎯', label: 'Executive Command Center', color: '#dc2626',
    summary: 'Cross-domain situational awareness — domain tiles with alert counts, live KPI benchmarks vs targets and peer averages, consolidated risk alerts, and budget performance.',
    tabs: ['Command Center', 'Risk & Alerts', 'KPI Benchmarks', 'Budget vs Actual'],
    tips: [
      'Review the Risk & Alerts tab every morning — HIGH alerts require same-day awareness.',
      'KPI Benchmark tab shows where you stand vs peer jurisdictions — useful for council reporting.',
      'Domain tiles with red alert badges indicate modules with open HIGH-severity issues.',
    ],
    ai_examples: [
      'What are our biggest risks across all domains this week?',
      'Which KPIs are below target vs peer benchmarks?',
      'Summarize the executive situational report for today.',
    ],
  },

  '/agents': {
    icon: '✦', label: 'Agent Hub', color: '#1e293b',
    summary: 'Run any of 4 autonomous AI agents — each pre-fetches all domain data from HANA Cloud and generates a structured risk report with findings, prioritized actions, and a narrative briefing.',
    tabs: ['Agent Cards', 'Report Viewer'],
    tips: [
      'Run the Executive AI Briefing first thing every morning for a full-platform situational summary.',
      'Agent reports take 15–30 seconds — the agent is fetching live data from all sources in parallel.',
      'Risk level (HIGH/MEDIUM/LOW) at the top of each report is the agent\'s overall domain health assessment.',
    ],
    ai_examples: [
      'What should I run the Grants agent for?',
      'How does the Operations agent differ from Sierra Intelligence?',
      'What domains does the Executive Briefing cover?',
    ],
  },

  '/ai': {
    icon: '◈', label: 'Sierra Intelligence', color: '#2563eb',
    summary: 'Conversational AI analyst with live access to all 14 modules via 46 data tools. Ask any question in plain English — get a data-backed answer with chart and 3 contextual follow-up suggestions.',
    tabs: ['Chat Interface'],
    tips: [
      'Ask cross-domain questions — "Show me full cost picture for Public Works" pulls 6 modules at once.',
      'Follow-up chips after each answer are generated from the data in that answer — they\'re specific, not generic.',
      'The more specific your question, the better the answer — include department names, time periods, or thresholds.',
    ],
    ai_examples: [
      'Which departments are over budget AND have critical asset failures?',
      'How much are we spending on grant-funded employees?',
      'What is our biggest operational risk this month across all domains?',
    ],
  },

  '/transparency': {
    icon: '🌐', label: 'Public Transparency Portal', color: '#0891b2',
    summary: 'Citizen-facing portal accessible without login. Shows grant awards, fund spending, tax revenue, program outcomes, and CAFR summary to the public.',
    tabs: ['Overview', 'Grant Awards', 'Fund Spending', 'Tax Revenue', 'Program Outcomes', 'CAFR Summary'],
    tips: [
      'This portal requires no login — share the /transparency URL freely with citizens and media.',
      'Use the Grant Awards search box to quickly find specific grants by name, agency, or number.',
      'The CAFR Summary tab is suitable for inclusion in board presentations and public financial reports.',
    ],
    ai_examples: [
      'What data is visible to the public on the transparency portal?',
      'How does the public portal data differ from the internal grant module?',
    ],
  },
};

// ── Ordered list for the full help page ────────────────────────────────────
export const HELP_SECTIONS = [
  {
    heading: 'Getting Started',
    items: ['/'],
  },
  {
    heading: 'Financial Management',
    items: ['/grants', '/funds', '/finance', '/procurement', '/treasury', '/forecast'],
  },
  {
    heading: 'Program & Compliance',
    items: ['/subawards', '/outcomes', '/audit'],
  },
  {
    heading: 'Enterprise Operations',
    items: ['/capital-projects', '/assets', '/inventory'],
  },
  {
    heading: 'Workforce & Fleet',
    items: ['/hr', '/fleet'],
  },
  {
    heading: 'Executive & Cross-Domain',
    items: ['/executive'],
  },
  {
    heading: 'Sierra AI',
    items: ['/agents', '/ai'],
  },
  {
    heading: 'Public Portal',
    items: ['/transparency'],
  },
];

// ── Glossary of public-sector / financial terms ────────────────────────────
export const GLOSSARY = [
  { term: 'Available-to-Spend', def: 'Budget minus YTD expenditures minus encumbrances. The actual cash you can still spend in a fund.' },
  { term: 'Burn Rate', def: 'Spend % divided by time elapsed %. A burn rate > 1.0 means spending faster than the grant period allows.' },
  { term: 'CAFR', def: 'Comprehensive Annual Financial Report. The official audited financial statements of a government entity.' },
  { term: 'CFR Part 200', def: '2 CFR Part 200 — the Uniform Guidance governing federal grant management. Defines allowability, procurement, and audit requirements.' },
  { term: 'CIP', def: 'Capital Improvement Plan. A multi-year schedule of capital projects with planned funding sources.' },
  { term: 'Compliance Score', def: 'Sierra\'s 0–100 score per grant based on document completeness, findings, approvals, and evidence.' },
  { term: 'Debarment', def: 'Federal exclusion preventing an entity from receiving federal contracts or grants. Payments to debarred vendors are prohibited.' },
  { term: 'Encumbrance', def: 'A commitment of funds (e.g., approved PO) that reduces available-to-spend but has not yet been paid.' },
  { term: 'FAC', def: 'Federal Audit Clearinghouse. The repository for Single Audit submissions required by the Uniform Guidance.' },
  { term: 'GASB-54', def: 'Government Accounting Standards Board Statement 54. Defines the hierarchy of fund balance classifications: Nonspendable, Restricted, Committed, Assigned, Unassigned.' },
  { term: 'GPRA', def: 'Government Performance and Results Act. Requires federal agencies and grantees to set performance goals and report outcomes.' },
  { term: 'Indirect Cost Rate (IDC)', def: 'A negotiated rate applied to direct costs to recover overhead. Must be in an approved rate agreement before charging to grants.' },
  { term: 'MTBF', def: 'Mean Time Between Failures. Average time an asset operates before breaking down — key reliability metric.' },
  { term: 'Pass-Through Entity', def: 'An organization that receives federal funds and awards subawards to subrecipients. Carries federal monitoring obligations.' },
  { term: 'PM Compliance', def: 'Preventive Maintenance compliance — percentage of scheduled PM tasks completed on time.' },
  { term: 'Position Control', def: 'Budget authorization for FTE positions. A filled position requires both a budget authorization and an employee in the role.' },
  { term: 'Single Audit', def: 'Annual audit required for entities expending $750,000+ in federal funds. Covers financial statements and compliance with major federal programs.' },
  { term: 'Subrecipient', def: 'An organization that receives federal funds via a subaward from a pass-through entity. Subject to monitoring by the pass-through.' },
  { term: 'TPM', def: 'Tokens Per Minute. Rate limit for AI model calls. Sierra Intelligence uses gpt-4o-mini which has a higher TPM limit.' },
  { term: 'Unallowable Cost', def: 'An expenditure that cannot be charged to a federal grant per 2 CFR Part 200 — e.g., entertainment, lobbying, alcohol.' },
];
