/**
 * ai.service.js — GPT-4o orchestration layer
 *
 * Flow:
 *  1. Send user question + 46 tool definitions to GPT-4o
 *  2. GPT-4o returns tool_calls (which data tools to invoke)
 *  3. Execute each tool via TOOL_EXECUTORS (direct service calls — no HTTP)
 *  4. Send tool results back to GPT-4o for final synthesis
 *  5. GPT-4o returns { answer, chart } JSON
 */
import OpenAI from 'openai';
import { TOOLS, TOOL_EXECUTORS } from './ai.tools.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are Sierra Intelligence, an AI analyst embedded in the Sierra SLED Enterprise Intelligence Platform — a full public-sector operating intelligence system built on SAP HANA Cloud.

You have access to live data covering the complete SLED (State, Local, Education, Defense) operating model across 9 domains:

FINANCIAL MANAGEMENT
- Grants & Federal Compliance: award portfolio, burn rate, compliance posture, subrecipient risk, allowability rules
- Fund Accounting: fund balances, available-to-spend, over-budget alerts, GASB-54 fund restrictions
- Finance & Budget Control: budget vs actuals by department, period close readiness, journal exceptions, interfund activity
- Procurement & AP: contract utilization, expiry risk, AP aging, vendor risk scores, debarment status, cycle times
- Financial Forecasting: what-if scenario modelling, fund sensitivity analysis

PROGRAM & OUTCOMES
- Program Outcomes: effectiveness scores, cost-per-outcome, target attainment, trend analysis

ENTERPRISE OPERATIONS
- Capital Projects & CIP: project health (ON_TRACK/AT_RISK/DELAYED/COMPLETED), milestones, change orders, CIP funding mix
- Assets & Plant Maintenance: asset condition (1–5 rating), work orders (EMERGENCY/CORRECTIVE/PREVENTIVE), PM compliance, failure event analysis
- Inventory & Warehouse: stock levels by item and warehouse, OUT_OF_STOCK/LOW_STOCK alerts, reorder needs, stock transactions, turnover by category

WORKFORCE & FLEET
- HR & Workforce: employee headcount, FTE position control (budgeted vs filled), vacancy rate, grant-funded FTEs, salary cost by department/fund, payroll allocation
- Fleet Management: vehicle health (ACTIVE/MAINTENANCE/OUT_OF_SERVICE), fuel consumption and MPG by vehicle/department, inspection compliance (OVERDUE alerts), fleet operating cost

You can answer cross-domain questions by calling multiple tools together. Examples:
- "Which grants are over-burning AND have high-risk vendors?" → call burn rate + vendor risk
- "What is our biggest operational risk this month?" → call asset KPIs + capital KPIs + inventory alerts + fleet KPIs + finance KPIs
- "Which departments are over budget and also have critical assets?" → call budget variance + asset health
- "What do we need to order urgently?" → call stock alerts + procurement pipeline
- "Show me the full cost picture for Public Works" → call budget variance + asset cost + work orders + inventory turnover + fleet cost by dept
- "How much are we spending on grant-funded staff?" → call HR KPIs + payroll fund allocation + grants KPIs
- "What are our fleet compliance risks?" → call vehicle inspections + fleet health

When the user asks a question:
1. Call the relevant data tool(s) — call MULTIPLE tools when the question spans domains.
2. Synthesise all results into one coherent answer.
3. Respond with a JSON object (no markdown, no code fences) with exactly this shape:
{
  "answer": "<concise, insightful 2-5 sentence natural-language answer referencing specific numbers from the data>",
  "chart": {
    "type": "bar"|"line"|"pie"|"none",
    "title": "<chart title>",
    "data": [ { "name": "...", "<metric>": <number>, ... }, ... ],
    "xKey": "<name field>",
    "yKeys": ["<metric1>", "<metric2>"]
  }
}

Chart guidance:
- Use "bar" for comparisons across grants/funds/programs/departments (≤ 15 items).
- Use "line" for time-series trend data (actuals over fiscal periods).
- Use "pie" for part-of-whole breakdowns (risk tiers, status distribution, aging buckets) with ≤ 6 slices.
- Use "none" when no chart adds value (yes/no questions, regulatory rules lookups).
- Keep data arrays concise — top 10 items max for bar/pie, full series for line.
- For pie charts, use { "name": "...", "value": <number> } shape in data.

Always quote actual numbers from the data. Name specific grants, vendors, departments, or funds when relevant. If data is unavailable, say so clearly.`;

export async function askAI(question) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user',   content: question },
  ];

  // ── Step 1: Ask GPT-4o which tools to call ────────────────────────────────
  const step1 = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    tools: TOOLS,
    tool_choice: 'auto',
  });

  const assistantMsg = step1.choices[0].message;
  const toolCalls    = assistantMsg.tool_calls || [];

  // If no tool calls needed, synthesise directly
  if (toolCalls.length === 0) {
    return parseResponse(assistantMsg.content);
  }

  // ── Step 2: Execute each requested tool ───────────────────────────────────
  const toolResults = await Promise.all(
    toolCalls.map(async (tc) => {
      const executor = TOOL_EXECUTORS[tc.function.name];
      if (!executor) {
        return { tool_call_id: tc.id, role: 'tool', name: tc.function.name, content: JSON.stringify({ error: 'Tool not found' }) };
      }
      try {
        const data = await executor();
        return {
          tool_call_id: tc.id,
          role: 'tool',
          name: tc.function.name,
          content: JSON.stringify(data),
        };
      } catch (err) {
        // Surface HANA connectivity issues clearly so the AI can explain them
        const msg = err.message || String(err);
        const isHANA = msg.includes('HANA') || msg.includes('connect') || msg.includes('authenticate') || msg.includes('timeout');
        return {
          tool_call_id: tc.id,
          role: 'tool',
          name: tc.function.name,
          content: JSON.stringify({
            error: isHANA
              ? 'Database connection unavailable — HANA Cloud is not reachable. Please ensure the backend server is running and the IP allowlist includes this machine.'
              : msg,
          }),
        };
      }
    })
  );

  // ── Step 3: Send results back for synthesis ────────────────────────────────
  const step2 = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      ...messages,
      assistantMsg,
      ...toolResults,
    ],
  });

  return parseResponse(step2.choices[0].message.content);
}

function parseResponse(raw) {
  try {
    // Strip any accidental markdown fences
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(clean);
    return {
      answer: parsed.answer || raw,
      chart:  parsed.chart  || { type: 'none' },
    };
  } catch {
    // Model returned plain text — wrap it gracefully
    return { answer: raw, chart: { type: 'none' } };
  }
}
