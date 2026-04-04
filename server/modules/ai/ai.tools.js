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
];

// Maps tool name → service call
import { GrantsService }   from '../grants/grants.service.js';
import { FundsService }    from '../funds/funds.service.js';
import { OutcomesService } from '../outcomes/outcomes.service.js';
import { ForecastService } from '../forecast/forecast.service.js';

export const TOOL_EXECUTORS = {
  get_grants_kpis:           () => GrantsService.getKPIs(),
  get_compliance_posture:    () => GrantsService.getCompliancePosture(),
  get_allowability_rules:    () => GrantsService.getAllowability(),
  get_subrecipient_risk:     () => GrantsService.getSubrecipientRisk(),
  get_grant_burn_rate:       () => GrantsService.getBurnRate(),
  get_funds_kpis:            () => FundsService.getKPIs(),
  get_funds_available:       () => FundsService.getAvailable(),
  get_outcome_effectiveness: () => OutcomesService.getEffectiveness(),
  get_outcome_trend:         () => OutcomesService.getTrend(),
  get_cost_effectiveness:    () => OutcomesService.getCostEffectiveness(),
  get_grant_linkage:         () => OutcomesService.getGrantLinkage(),
  get_forecast_what_if:      () => ForecastService.getWhatIfBase(),
  get_sensitivity_analysis:  () => ForecastService.getSensitivity(),
};
