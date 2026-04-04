/**
 * ai.tools.js — OpenAI function definitions
 * Each tool maps directly to an existing service method.
 * GPT-4o reads these descriptions to decide which to call.
 */
export const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_grants_kpis',
      description: 'Get high-level grant KPIs: total grants count, total award value, active grants, expiring grants. Use for summary questions about the grants portfolio.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_compliance_posture',
      description: 'Get compliance posture score (0-100) for every grant, including risk tier (STRONG/ADEQUATE/NEEDS_IMPROVEMENT/AT_RISK), document count, approval count, evidence count, open findings, high findings. Use for questions about grant risk, compliance health, which grants need attention.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_allowability_rules',
      description: 'Get cost allowability rules: which cost categories are allowable/not allowable under federal CFR regulations. Use for questions about allowable costs, cost compliance, federal regulations.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_subrecipient_risk',
      description: 'Get subrecipient monitoring records with risk ratings (HIGH/MEDIUM/LOW), findings count, report status, follow-up required. Use for questions about subrecipient oversight, high-risk subrecipients, monitoring gaps.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_grant_burn_rate',
      description: 'Get grant burn rate: spend % vs time elapsed % for each grant. Identifies OVER_BURNING (spending faster than time), UNDER_BURNING (spending slower), and ON_TRACK grants. Use for budget pacing, drawdown rate, grant spending velocity questions.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_funds_kpis',
      description: 'Get fund accounting KPIs: total funds, total balance, total restricted, total unassigned, total encumbrances, total available, over-budget fund count. Use for high-level fund portfolio questions.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_funds_available',
      description: 'Get available-to-spend for every fund: budget, expenditures YTD, encumbrances, available balance, burn %, budget status (OVER_BUDGET/CRITICAL/WARNING/ON_TRACK). Use for questions about which funds are over budget, available balances, fund financial health.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_outcome_effectiveness',
      description: 'Get program effectiveness scores (0-100) for each program, including on-track/at-risk/off-track metric counts, cost per unit vs peer average, efficiency rating. Use for outcome performance, program effectiveness, impact questions.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_outcome_trend',
      description: 'Get time-series actuals for all outcome metrics across fiscal periods. Use for trend analysis, performance over time, improving/declining metrics questions.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_cost_effectiveness',
      description: 'Get cost-effectiveness analysis: cost per unit vs peer average for each program/service unit. Efficiency ratings: EFFICIENT/AT_PEER/ABOVE_PEER/INEFFICIENT. Use for cost efficiency, value for money, cost benchmarking questions.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_grant_linkage',
      description: 'Get grant-to-outcome linkage: which grants are linked to which programs and outcome metrics, and their overall outcome status (ON_TRACK/AT_RISK/OFF_TRACK/NO_METRICS). Use for questions linking grants to program results.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_forecast_what_if',
      description: 'Get base fund data for what-if scenario modelling: budget, expenditures, encumbrances, available balance, spend % per fund. Use for budget scenario questions, forecasting, what-if analysis.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_sensitivity_analysis',
      description: 'Get fund sensitivity analysis: impact of 10% budget cut and 10% cost increase on each fund, with sensitivity ratings (HIGH/MEDIUM/LOW). Use for risk scenario questions, budget shock analysis, which funds are most vulnerable.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },

  // ── Phase 1 Sprint 9: Procurement & AP ────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'get_procurement_kpis',
      description: 'Get procurement and AP high-level KPIs: total contracts, total contract value, expiring contracts, suspended contracts, overdue invoices, AP backlog amount, flagged vendors, average cycle days. Use for procurement health summary questions.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_contracts',
      description: 'Get all contracts with utilization %, days to expiry, procurement method, vendor risk score, and debarment status. Use for questions about contract expiry, sole-source spend, contract utilization, which contracts are at risk, emergency procurement.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_ap_aging',
      description: 'Get accounts payable aging: unpaid invoices with aging bucket (CURRENT/OVERDUE_30/OVERDUE_60/OVERDUE_90PLUS), aging days, duplicate risk flag, vendor name. Use for AP backlog questions, overdue payments, invoice risk, cash flow questions.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_vendor_risk',
      description: 'Get vendor risk profiles: risk score 0-100, debarment status (CLEAR/FLAGGED/PENDING_REVIEW), certification status (CURRENT/EXPIRING/EXPIRED), diversity category. Use for vendor compliance questions, high-risk vendors, debarred vendors, certification expiry.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_procurement_pipeline',
      description: 'Get purchase order pipeline: PO amounts, departments, req-to-PO cycle times, vendor info, contract linkage, invoice counts. Use for procurement bottleneck questions, cycle time analysis, departmental spend, PO status questions.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },

  // ── Phase 2 Sprint 12: Assets & Plant Maintenance ────────────────────────────
  {
    type: 'function',
    function: {
      name: 'get_asset_kpis',
      description: 'Get asset management KPIs: total assets, total replacement value, critical/poor condition count, open work orders, emergency work orders, overdue preventive maintenance plans, maintenance cost YTD. Use for fleet/facility/infrastructure health overview questions.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_asset_health',
      description: 'Get per-asset health dashboard: condition rating (1-5), open work order count, overdue PM count, total failures, maintenance cost YTD, and overall health status (GOOD/FAIR/POOR/CRITICAL). Use for questions about which assets need attention, worst-condition assets, high-maintenance assets.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_work_orders',
      description: 'Get all work orders with type (EMERGENCY/CORRECTIVE/PREVENTIVE/INSPECTION), priority (CRITICAL/HIGH/MEDIUM/LOW), labor and parts cost, age in days, assigned technician, asset info. Use for maintenance backlog questions, emergency repairs, high-cost work orders, overdue work orders.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_pm_compliance',
      description: 'Get preventive maintenance plan compliance: PM status (OVERDUE/DUE_SOON/ON_SCHEDULE), days overdue, frequency (MONTHLY/QUARTERLY/ANNUAL etc.), estimated cost, assigned technician per asset. Use for PM compliance rate questions, overdue maintenance, which assets are missing scheduled PMs.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_failure_analysis',
      description: 'Get asset failure event log: failure type (MECHANICAL/ELECTRICAL/STRUCTURAL/WEAR/OPERATOR_ERROR), downtime hours, repair cost, recurring failure flag, whether failure was PM-preventable. Use for failure pattern analysis, recurring failure identification, downtime cost, PM ROI questions.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },

  // ── Phase 2 Sprint 11: Capital Projects & CIP ────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'get_capital_kpis',
      description: 'Get Capital Improvement Plan (CIP) high-level KPIs: total CIP budget, total spent to date, total remaining, active/on-hold/completed project counts, red/yellow/green health counts, pending change orders, approved change order cost impact. Use for capital program overview, CIP portfolio summary questions.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_project_health',
      description: 'Get per-project health dashboard: spend %, committed %, budget remaining, change order count and cost impact, milestone completion rate, at-risk milestone count, and overall health status (GREEN/YELLOW/RED). Use for questions about which projects are over budget, behind schedule, at risk, or need attention.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_change_orders',
      description: 'Get all capital project change orders: reason (SCOPE_CHANGE/UNFORESEEN_CONDITIONS/DESIGN_ERROR/OWNER_REQUEST/WEATHER/REGULATORY), cost impact (positive = cost increase), schedule impact in days, approval status (PENDING/APPROVED/REJECTED). Use for questions about cost overruns, schedule slippage, change order backlog, most impacted projects.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_milestone_status',
      description: 'Get all capital project milestones with status (COMPLETED/IN_PROGRESS/AT_RISK/NOT_STARTED), completion %, planned vs actual dates, milestone type (DESIGN/PERMITTING/CONSTRUCTION/INSPECTION/CLOSEOUT). Use for schedule tracking, at-risk milestone identification, project phase progress questions.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_cip_funding',
      description: 'Get capital project funding sources: source type (BOND/GRANT/GENERAL_FUND/SPECIAL_ASSESSMENT/DEVELOPER_CONTRIBUTION), allocated amount, amount drawn, draw % per project. Use for questions about grant-funded vs bond-funded projects, funding utilization, undrawn balances, funding mix analysis.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },

  // ── Phase 1 Sprint 10: Finance & Budget Controller ─────────────────────────
  {
    type: 'function',
    function: {
      name: 'get_finance_kpis',
      description: 'Get finance controller KPIs: total budget, total actuals, total encumbrances, total available balance, overrun budget lines count, journal exceptions count, overdue close tasks, close completion percentage. Use for financial health summary, budget overview questions.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_budget_variance',
      description: 'Get budget variance by department, fund, and account: original vs revised budget, encumbrances, actuals, available balance, spend %, committed %, budget status (OVERRUN/AT_RISK/ON_TRACK/UNDER_BUDGET). Use for budget control questions, overspend alerts, department variance analysis.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_close_readiness',
      description: 'Get period close task status: completion %, overdue tasks, not-started tasks, task categories (RECONCILIATION/JOURNAL/REPORTING/APPROVAL/AUDIT), assigned owners, due dates. Use for close readiness questions, period end status, overdue close tasks.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
];

// Maps tool name → service call
import { GrantsService }      from '../grants/grants.service.js';
import { FundsService }       from '../funds/funds.service.js';
import { CapitalService }     from '../capital/capital.service.js';
import { AssetsService }      from '../assets/assets.service.js';
import { OutcomesService }    from '../outcomes/outcomes.service.js';
import { ForecastService }    from '../forecast/forecast.service.js';
import { ProcurementService } from '../procurement/procurement.service.js';
import { FinanceService }     from '../finance/finance.service.js';

export const TOOL_EXECUTORS = {
  // Grants & Compliance
  get_grants_kpis:           () => GrantsService.getKPIs(),
  get_compliance_posture:    () => GrantsService.getCompliancePosture(),
  get_allowability_rules:    () => GrantsService.getAllowability(),
  get_subrecipient_risk:     () => GrantsService.getSubrecipientRisk(),
  get_grant_burn_rate:       () => GrantsService.getBurnRate(),
  // Funds
  get_funds_kpis:            () => FundsService.getKPIs(),
  get_funds_available:       () => FundsService.getAvailable(),
  // Outcomes
  get_outcome_effectiveness: () => OutcomesService.getEffectiveness(),
  get_outcome_trend:         () => OutcomesService.getTrend(),
  get_cost_effectiveness:    () => OutcomesService.getCostEffectiveness(),
  get_grant_linkage:         () => OutcomesService.getGrantLinkage(),
  // Forecast
  get_forecast_what_if:      () => ForecastService.getWhatIfBase(),
  get_sensitivity_analysis:  () => ForecastService.getSensitivity(),
  // Procurement & AP (Phase 1 Sprint 9)
  get_procurement_kpis:      () => ProcurementService.getKPIs(),
  get_contracts:             () => ProcurementService.getContracts(),
  get_ap_aging:              () => ProcurementService.getAPAging(),
  get_vendor_risk:           () => ProcurementService.getVendors(),
  get_procurement_pipeline:  () => ProcurementService.getPipeline(),
  // Finance Controller (Phase 1 Sprint 10)
  get_finance_kpis:          () => FinanceService.getKPIs(),
  get_budget_variance:       () => FinanceService.getBudgetVariance(),
  get_close_readiness:       () => FinanceService.getCloseReadiness(),
  // Assets & Plant Maintenance (Phase 2 Sprint 12)
  get_asset_kpis:            () => AssetsService.getKPIs(),
  get_asset_health:          () => AssetsService.getAssets(),
  get_work_orders:           () => AssetsService.getWorkOrders(),
  get_pm_compliance:         () => AssetsService.getPMPlans(),
  get_failure_analysis:      () => AssetsService.getFailures(),
  // Capital Projects & CIP (Phase 2 Sprint 11)
  get_capital_kpis:          () => CapitalService.getKPIs(),
  get_project_health:        () => CapitalService.getProjects(),
  get_change_orders:         () => CapitalService.getChangeOrders(),
  get_milestone_status:      () => CapitalService.getMilestones(),
  get_cip_funding:           () => CapitalService.getFunding(),
};
