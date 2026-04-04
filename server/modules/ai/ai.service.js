/**
 * ai.service.js — GPT-4o orchestration layer
 *
 * Flow:
 *  1. Send user question + 13 tool definitions to GPT-4o
 *  2. GPT-4o returns tool_calls (which data tools to invoke)
 *  3. Execute each tool via TOOL_EXECUTORS (direct service calls — no HTTP)
 *  4. Send tool results back to GPT-4o for final synthesis
 *  5. GPT-4o returns { answer, chart } JSON
 */
import OpenAI from 'openai';
import { TOOLS, TOOL_EXECUTORS } from './ai.tools.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are Sierra Intelligence, an AI analyst embedded in the Sierra SLED Public Sector Reporting Platform.
You have access to live data from SAP HANA Cloud covering grants management, fund accounting, outcome metrics, compliance posture, and financial forecasting for SLED (State, Local, Education, Defense) government clients.

When the user asks a question:
1. Call the relevant data tool(s) to fetch live data.
2. Analyse the results.
3. Respond with a JSON object (no markdown, no code fences) with exactly this shape:
{
  "answer": "<concise, insightful 2-5 sentence natural-language answer referencing specific numbers>",
  "chart": {
    "type": "bar"|"line"|"pie"|"none",
    "title": "<chart title>",
    "data": [ { "name": "...", "<metric>": <number>, ... }, ... ],
    "xKey": "<name field>",
    "yKeys": ["<metric1>", "<metric2>"]
  }
}

Chart guidance:
- Use "bar" for comparisons across grants/funds/programs (≤ 15 items).
- Use "line" for time-series trend data (actuals over fiscal periods).
- Use "pie" for part-of-whole breakdowns (risk tiers, compliance status, burn status) with ≤ 6 slices.
- Use "none" when no chart adds value (e.g. yes/no questions, allowability rules).
- Keep data arrays concise — top 10 items max for bar/pie, full series for line.
- For pie charts, use { "name": "...", "value": <number> } shape in data.

Always quote actual numbers from the data. If data is unavailable, say so clearly.`;

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
