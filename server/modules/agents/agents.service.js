/**
 * agents.service.js  —  Phase 6 · Agentic AI
 *
 * Each agent:
 *  1. Pre-fetches all domain data in parallel (deterministic, no tool-calling loop)
 *  2. Trims large arrays to keep the context window lean
 *  3. Passes the dataset to the Sierra AI model for structured synthesis
 *  4. Returns a typed AgentReport
 *
 * Pattern: fetch-all-first → trim → single AI synthesis call → structured JSON
 */
import OpenAI            from 'openai';
import { AGENT_CONFIGS } from './agent.configs.js';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Trim large arrays so the context window stays under the token limit ──────
// Keeps the first N rows from every array anywhere in the data tree.
function trimForAI(val, maxRows = 12) {
  if (Array.isArray(val))             return val.slice(0, maxRows).map(v => trimForAI(v, maxRows));
  if (val && typeof val === 'object') return Object.fromEntries(
    Object.entries(val).map(([k, v]) => [k, trimForAI(v, maxRows)])
  );
  return val;
}

/**
 * runAgent(type)
 * @param {string} type  'grants' | 'procurement' | 'operations' | 'executive'
 * @returns {Promise<AgentReport>}
 */
export async function runAgent(type) {
  const config = AGENT_CONFIGS[type];
  if (!config) throw new Error(`Unknown agent type: ${type}`);

  const startMs = Date.now();

  // ── 1. Fetch all domain data in parallel ─────────────────────────────────
  let raw;
  try {
    raw = await config.fetchData();
  } catch (err) {
    throw new Error(`Data fetch failed for ${type} agent: ${err.message}`);
  }

  // ── 2. Trim arrays to control token count ────────────────────────────────
  const data = trimForAI(raw);

  // ── 3. Build the analysis prompt ─────────────────────────────────────────
  const prompt = config.analysisPrompt(data);

  // ── 4. Call Sierra AI for structured analysis ─────────────────────────────
  let content;
  try {
    const completion = await client.chat.completions.create({
      model:       'gpt-4o-mini',   // higher TPM tier — keeps analysis within rate limits
      temperature: 0.2,             // low temperature → consistent, factual output
      messages: [
        { role: 'system', content: config.persona },
        { role: 'user',   content: prompt },
      ],
    });
    content = completion.choices[0].message.content || '';
  } catch (err) {
    throw new Error(`Sierra AI analysis failed: ${err.message}`);
  }

  // ── 5. Parse structured report ────────────────────────────────────────────
  const report = parseReport(content);

  return {
    agent:      type,
    agent_name: config.name,
    run_at:     new Date().toISOString(),
    elapsed_ms: Date.now() - startMs,
    ...report,
  };
}

// ── Parse and validate the AI response ───────────────────────────────────────
function parseReport(raw) {
  try {
    const clean = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i,     '')
      .replace(/```\s*$/,      '')
      .trim();
    const parsed = JSON.parse(clean);

    return {
      summary:          parsed.summary          || 'Analysis complete.',
      risk_level:       parsed.risk_level        || 'MEDIUM',
      headline_metrics: parsed.headline_metrics  || [],
      risks:            parsed.risks             || [],
      actions:          parsed.actions           || [],
      sections:         parsed.sections          || [],
    };
  } catch {
    return {
      summary:          raw,
      risk_level:       'MEDIUM',
      headline_metrics: [],
      risks:            [],
      actions:          [],
      sections:         [],
    };
  }
}
