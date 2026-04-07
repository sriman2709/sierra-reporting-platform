/**
 * agent.configs.js
 * Defines the identity, scope, and data-gathering strategy for each
 * of the four Phase 6 AI Agents.
 *
 * Each agent fetches its domain data in parallel, then passes the full
 * context to GPT-4o with a structured-output prompt.
 */

import { GrantsService }      from '../grants/grants.service.js';
import { FundsService }       from '../funds/funds.service.js';
import { OutcomesService }    from '../outcomes/outcomes.service.js';
import { ForecastService }    from '../forecast/forecast.service.js';
import { ProcurementService } from '../procurement/procurement.service.js';
import { FinanceService }     from '../finance/finance.service.js';
import { AssetsService }      from '../assets/assets.service.js';
import { CapitalService }     from '../capital/capital.service.js';
import { InventoryService }   from '../inventory/inventory.service.js';
import { HRService }          from '../hr/hr.service.js';
import { FleetService }       from '../fleet/fleet.service.js';
import { TreasuryService }    from '../treasury/treasury.service.js';
import { ExecutiveService }   from '../executive/executive.service.js';

// ── Shared safe-fetch helper ──────────────────────────────────────────────────
async function safe(label, fn) {
  try   { return { [label]: await fn() }; }
  catch { return { [label]: null };       }
}

// ── Data fetchers (run in parallel per agent) ─────────────────────────────────

export const AGENT_CONFIGS = {

  // ── Grants Intelligence Agent ───────────────────────────────────────────────
  grants: {
    name:        'Grants Intelligence Agent',
    icon:        '🏛',
    color:       '#2563eb',
    description: 'Full grants portfolio review — compliance posture, burn rates, expiry risk, subrecipient flags, outcome linkage.',
    persona:     `You are the Sierra Grants Intelligence Agent, a specialist AI analyst for public-sector grant management.
You have deep expertise in federal CFR Part 200, GAAP fund accounting, grant compliance, and performance measurement.`,

    fetchData: () => Promise.all([
      safe('kpis',             () => GrantsService.getKPIs()),
      safe('compliance',       () => GrantsService.getCompliancePosture()),
      safe('burn_rate',        () => GrantsService.getBurnRate()),
      safe('subrecipients',    () => GrantsService.getSubrecipientRisk()),
      safe('allowability',     () => GrantsService.getAllowability()),
      safe('funds_available',  () => FundsService.getAvailable()),
      safe('outcomes',         () => OutcomesService.getEffectiveness()),
      safe('grant_linkage',    () => OutcomesService.getGrantLinkage()),
      safe('forecast',         () => ForecastService.getWhatIfBase()),
    ]).then(results => Object.assign({}, ...results)),

    analysisPrompt: (data) => `
You are performing a comprehensive Grants Portfolio Review for a public-sector organization.
Analyze the following live data from all grants-related systems and produce a structured intelligence report.

=== LIVE DATA ===
${JSON.stringify(data, null, 2)}

=== INSTRUCTIONS ===
Analyze ALL the data above and produce a JSON report with this exact structure (no markdown, no code fences):
{
  "summary": "<3-4 sentence executive summary of overall grants portfolio health, referencing specific numbers>",
  "risk_level": "HIGH|MEDIUM|LOW",
  "headline_metrics": [
    { "label": "Active Grants", "value": "<number>", "status": "ok|warn|alert" },
    { "label": "Total Funding", "value": "$<amount>", "status": "ok|warn|alert" },
    { "label": "Compliance Score", "value": "<avg score>/100", "status": "ok|warn|alert" },
    { "label": "At-Risk Grants", "value": "<count>", "status": "ok|warn|alert" },
    { "label": "High-Risk Subrecipients", "value": "<count>", "status": "ok|warn|alert" },
    { "label": "Over-Burning Grants", "value": "<count>", "status": "ok|warn|alert" }
  ],
  "risks": [
    { "severity": "HIGH|MEDIUM|LOW", "title": "<specific risk title>", "detail": "<1-2 sentences with specific grant names/numbers>", "domain": "Compliance|Burn Rate|Subrecipient|Expiry|Outcome" }
  ],
  "actions": [
    { "priority": 1, "action": "<specific, actionable step>", "rationale": "<why this matters>", "deadline": "Immediate|This Week|This Month|This Quarter" }
  ],
  "sections": [
    { "title": "Compliance & Risk Posture", "content": "<2-3 sentence analysis with numbers>" },
    { "title": "Burn Rate Analysis", "content": "<2-3 sentence analysis>" },
    { "title": "Subrecipient Monitoring", "content": "<2-3 sentence analysis>" },
    { "title": "Outcome Performance", "content": "<2-3 sentence analysis>" }
  ]
}
Include at least 4 risks and 5 actions. Be specific — name actual grants, agencies, or programs from the data.`,
  },

  // ── Procurement Intelligence Agent ─────────────────────────────────────────
  procurement: {
    name:        'Procurement Intelligence Agent',
    icon:        '🛒',
    color:       '#7c3aed',
    description: 'Procurement health check — contract expiry risk, vendor risk scores, AP aging, spend anomalies, savings opportunities.',
    persona:     `You are the Sierra Procurement Intelligence Agent, a specialist AI for public-sector procurement and AP management.
You have expertise in contract lifecycle management, vendor risk, AP cycle efficiency, and public procurement compliance.`,

    fetchData: () => Promise.all([
      safe('kpis',            () => ProcurementService.getKPIs()),
      safe('contracts',       () => ProcurementService.getContracts()),
      safe('ap_aging',        () => ProcurementService.getAPAging()),
      safe('vendors',         () => ProcurementService.getVendors()),
      safe('pipeline',        () => ProcurementService.getPipeline()),
      safe('finance_kpis',    () => FinanceService.getKPIs()),
      safe('budget_variance', () => FinanceService.getBudgetVariance()),
      safe('inventory_kpis',  () => InventoryService.getKPIs()),
      safe('stock_alerts',    () => InventoryService.getAlerts()),
    ]).then(results => Object.assign({}, ...results)),

    analysisPrompt: (data) => `
You are performing a comprehensive Procurement Health Check for a public-sector organization.
Analyze all procurement, vendor, AP, and related financial data below and produce a structured intelligence report.

=== LIVE DATA ===
${JSON.stringify(data, null, 2)}

=== INSTRUCTIONS ===
Produce a JSON report (no markdown, no code fences):
{
  "summary": "<3-4 sentence executive summary of procurement portfolio health with specific numbers>",
  "risk_level": "HIGH|MEDIUM|LOW",
  "headline_metrics": [
    { "label": "Active Contracts", "value": "<number>", "status": "ok|warn|alert" },
    { "label": "Expiring in 90 Days", "value": "<count>", "status": "ok|warn|alert" },
    { "label": "AP Overdue Value", "value": "$<amount>", "status": "ok|warn|alert" },
    { "label": "High-Risk Vendors", "value": "<count>", "status": "ok|warn|alert" },
    { "label": "Open POs", "value": "<count>", "status": "ok|warn|alert" },
    { "label": "Avg Payment Days", "value": "<days>", "status": "ok|warn|alert" }
  ],
  "risks": [
    { "severity": "HIGH|MEDIUM|LOW", "title": "<risk>", "detail": "<specific detail from data>", "domain": "Contracts|Vendors|AP|Spend|Compliance" }
  ],
  "actions": [
    { "priority": 1, "action": "<specific step>", "rationale": "<why>", "deadline": "Immediate|This Week|This Month|This Quarter" }
  ],
  "sections": [
    { "title": "Contract Portfolio Health", "content": "<analysis with numbers>" },
    { "title": "Vendor Risk Assessment", "content": "<analysis>" },
    { "title": "Accounts Payable Status", "content": "<analysis>" },
    { "title": "Budget & Spend Analysis", "content": "<analysis>" }
  ]
}
Include at least 4 risks and 5 actions. Reference specific vendor names, contract IDs, or amounts from the data.`,
  },

  // ── Operations Intelligence Agent ───────────────────────────────────────────
  operations: {
    name:        'Operations Intelligence Agent',
    icon:        '⚙️',
    color:       '#059669',
    description: 'Operational risk sweep — asset health, fleet status, capital project delays, inventory shortfalls, maintenance backlog.',
    persona:     `You are the Sierra Operations Intelligence Agent, a specialist AI for public-sector operational management.
You have expertise in asset management, fleet operations, capital project delivery, inventory control, and maintenance planning.`,

    fetchData: () => Promise.all([
      safe('asset_kpis',     () => AssetsService.getKPIs()),
      safe('assets',         () => AssetsService.getAssets()),
      safe('work_orders',    () => AssetsService.getWorkOrders()),
      safe('pm_compliance',  () => AssetsService.getPMPlans()),
      safe('failures',       () => AssetsService.getFailures()),
      safe('capital_kpis',   () => CapitalService.getKPIs()),
      safe('projects',       () => CapitalService.getProjects()),
      safe('change_orders',  () => CapitalService.getChangeOrders()),
      safe('milestones',     () => CapitalService.getMilestones()),
      safe('fleet_kpis',     () => FleetService.getKPIs()),
      safe('fleet_health',   () => FleetService.getVehicles()),
      safe('inspections',    () => FleetService.getInspections()),
      safe('fuel',           () => FleetService.getFuel()),
      safe('inventory_kpis', () => InventoryService.getKPIs()),
      safe('stock_alerts',   () => InventoryService.getAlerts()),
      safe('warehouses',     () => InventoryService.getWarehouses()),
    ]).then(results => Object.assign({}, ...results)),

    analysisPrompt: (data) => `
You are performing a comprehensive Operations Risk Sweep for a public-sector organization.
Analyze assets, fleet, capital projects, and inventory data below and produce a structured intelligence report.

=== LIVE DATA ===
${JSON.stringify(data, null, 2)}

=== INSTRUCTIONS ===
Produce a JSON report (no markdown, no code fences):
{
  "summary": "<3-4 sentence executive summary of operational health with specific numbers>",
  "risk_level": "HIGH|MEDIUM|LOW",
  "headline_metrics": [
    { "label": "Critical Assets", "value": "<count>", "status": "ok|warn|alert" },
    { "label": "Open Work Orders", "value": "<count>", "status": "ok|warn|alert" },
    { "label": "Fleet Out-of-Service", "value": "<count>", "status": "ok|warn|alert" },
    { "label": "Delayed Projects", "value": "<count>", "status": "ok|warn|alert" },
    { "label": "Low/Out-of-Stock Items", "value": "<count>", "status": "ok|warn|alert" },
    { "label": "Overdue Inspections", "value": "<count>", "status": "ok|warn|alert" }
  ],
  "risks": [
    { "severity": "HIGH|MEDIUM|LOW", "title": "<risk>", "detail": "<specific detail with asset names/IDs/projects>", "domain": "Assets|Fleet|Capital|Inventory|Maintenance" }
  ],
  "actions": [
    { "priority": 1, "action": "<specific step>", "rationale": "<why>", "deadline": "Immediate|This Week|This Month|This Quarter" }
  ],
  "sections": [
    { "title": "Asset & Maintenance Health", "content": "<analysis with numbers>" },
    { "title": "Fleet Status", "content": "<analysis>" },
    { "title": "Capital Project Delivery", "content": "<analysis>" },
    { "title": "Inventory & Supply Chain", "content": "<analysis>" }
  ]
}
Include at least 5 risks and 6 actions. Be specific — name asset IDs, project names, vehicle types, warehouse locations.`,
  },

  // ── Executive AI Briefing ───────────────────────────────────────────────────
  executive: {
    name:        'Executive AI Briefing',
    icon:        '🏛️',
    color:       '#dc2626',
    description: 'Full-platform synthesis — cross-domain risk assessment, fiscal health, operational readiness, workforce posture, strategic recommendations.',
    persona:     `You are the Sierra Executive Intelligence Agent, the most senior AI analyst in the platform.
You synthesize data across all 12 operational domains to produce a concise executive briefing for the City Manager / Administrator.`,

    fetchData: () => Promise.all([
      // Finance & Grants
      safe('grants_kpis',       () => GrantsService.getKPIs()),
      safe('compliance',        () => GrantsService.getCompliancePosture()),
      safe('burn_rate',         () => GrantsService.getBurnRate()),
      safe('funds_available',   () => FundsService.getAvailable()),
      safe('finance_kpis',      () => FinanceService.getKPIs()),
      safe('budget_variance',   () => FinanceService.getBudgetVariance()),
      safe('treasury_kpis',     () => TreasuryService.getKPIs()),
      // Procurement
      safe('procurement_kpis',  () => ProcurementService.getKPIs()),
      safe('vendor_risk',       () => ProcurementService.getVendors()),
      safe('ap_aging',          () => ProcurementService.getAPAging()),
      // Operations
      safe('asset_kpis',        () => AssetsService.getKPIs()),
      safe('work_orders',       () => AssetsService.getWorkOrders()),
      safe('capital_kpis',      () => CapitalService.getKPIs()),
      safe('project_health',    () => CapitalService.getProjects()),
      safe('inventory_kpis',    () => InventoryService.getKPIs()),
      safe('stock_alerts',      () => InventoryService.getAlerts()),
      safe('fleet_kpis',        () => FleetService.getKPIs()),
      safe('inspections',       () => FleetService.getInspections()),
      // Workforce
      safe('hr_kpis',           () => HRService.getKPIs()),
      safe('workforce_health',  () => HRService.getEmployees()),
      safe('position_control',  () => HRService.getPositions()),
      // Executive KPIs & Alerts
      safe('exec_kpis',         () => ExecutiveService.getCrossDomainKPIs()),
      safe('exec_alerts',       () => ExecutiveService.getAlerts()),
      safe('benchmarks',        () => ExecutiveService.getBenchmarks()),
      safe('domain_risk',       () => ExecutiveService.getDomainRisk()),
    ]).then(results => Object.assign({}, ...results)),

    analysisPrompt: (data) => `
You are producing the Sierra Executive Intelligence Briefing — a concise, authoritative cross-domain situational report for the City Manager / Chief Administrative Officer.

Today's date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

=== LIVE DATA ACROSS ALL DOMAINS ===
${JSON.stringify(data, null, 2)}

=== INSTRUCTIONS ===
Synthesize ALL domains and produce a JSON executive briefing (no markdown, no code fences):
{
  "summary": "<4-5 sentence executive situational summary — financial health, operational status, key risks, tone should be formal and authoritative>",
  "risk_level": "HIGH|MEDIUM|LOW",
  "headline_metrics": [
    { "label": "Active Grants", "value": "<number>", "status": "ok|warn|alert" },
    { "label": "Cash Position", "value": "$<amount>", "status": "ok|warn|alert" },
    { "label": "Budget Utilization", "value": "<pct>%", "status": "ok|warn|alert" },
    { "label": "Open High Alerts", "value": "<count>", "status": "ok|warn|alert" },
    { "label": "Active Employees", "value": "<number>", "status": "ok|warn|alert" },
    { "label": "Capital Projects", "value": "<active count>", "status": "ok|warn|alert" }
  ],
  "risks": [
    { "severity": "HIGH|MEDIUM|LOW", "title": "<risk>", "detail": "<specific detail with numbers>", "domain": "Finance|Grants|Procurement|Operations|HR|Fleet|Inventory|Capital" }
  ],
  "actions": [
    { "priority": 1, "action": "<strategic action>", "rationale": "<impact and urgency>", "deadline": "Immediate|This Week|This Month|This Quarter" }
  ],
  "sections": [
    { "title": "Fiscal Health", "content": "<analysis of grants, funds, budget, treasury — 2-3 sentences with numbers>" },
    { "title": "Procurement & Contracts", "content": "<AP, vendor risk, contract status>" },
    { "title": "Capital & Operations", "content": "<projects, assets, fleet, inventory>" },
    { "title": "Workforce Posture", "content": "<headcount, vacancies, payroll, turnover>" },
    { "title": "Strategic Outlook", "content": "<forward-looking assessment — risks to monitor, opportunities, recommended focus areas>" }
  ]
}
Include 6+ risks spanning multiple domains and 6+ actions at the strategic level. This is for senior leadership — be precise and decisive.`,
  },
};
