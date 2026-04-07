/**
 * agents.service.js
 *
 * Phase 6 — Agentic AI
 * Each agent:
 *  1. Pre-fetches all domain data in parallel (deterministic, no LLM tool-calling loop)
 *  2. Passes the full dataset to GPT-4o with a structured-output prompt
 *  3. Returns a typed AgentReport
 *
 * Pattern: fetch-all-first → single GPT-4o synthesis → structured JSON
 */
import OpenAI          from 'openai';
import { AGENT_CONFIGS } from './agent.configs.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * runAgent(type)
 * @param {string} type - 'grants' | 'procurement' | 'operations' | 'executive'
 * @returns {Promise<AgentReport>}
 */
export async function runAgent(type) {
  const config = AGENT_CONFIGS[type];
  if (!config) throw new Error(`Unknown agent type: ${type}`);

  const startMs = Date.now();

  // ── 1. Fetch all domain data in parallel ────────────────────────────────────
  let data;
  try {
    data = await config.fetchData();
  } catch (err) {
    throw new Error(`Data fetch failed for ${type} agent: ${err.message}`);
  }

  // ── 2. Build the analysis prompt ────────────────────────────────────────────
  const analysisPrompt = config.analysisPrompt(data);

  // ── 3. Call GPT-4o for structured analysis ───────────────────────────────────
  let raw;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,      // low temperature → consistent, factual output
      messages: [
        { role: 'system', content: config.persona },
        { role: 'user',   content: analysisPrompt },
      ],
    });
    raw = completion.choices[0].message.content || '';
  } catch (err) {
    throw new Error(`GPT-4o analysis failed: ${err.message}`);
  }

  // ── 4. Parse structured report ───────────────────────────────────────────────
  const report = parseReport(raw);

  return {
    agent:      type,
    agent_name: config.name,
    run_at:     new Date().toISOString(),
    elapsed_ms: Date.now() - startMs,
    ...report,
  };
}

// ── Parse & validate the GPT-4o response ─────────────────────────────────────
function parseReport(raw) {
  try {
    const clean = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/,     '')
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
    // Graceful fallback — return raw text wrapped in minimal structure
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
