# Agent Hub — Agentic AI

The Agent Hub hosts 4 autonomous AI agents. Unlike Sierra Intelligence (which answers questions), agents **proactively review their full domain**, identify risks, and produce structured intelligence reports.

## The 4 Agents

| Agent | Domain | Data Sources |
|---|---|---|
| 🏛 **Grants Intelligence** | Grant portfolio, compliance, subrecipient, outcomes | 9 data sources |
| 🛒 **Procurement Intelligence** | Contracts, vendors, AP, spend | 9 data sources |
| ⚙️ **Operations Intelligence** | Assets, fleet, capital projects, inventory | 16 data sources |
| 🏛️ **Executive AI Briefing** | Full platform cross-domain synthesis | 24 data sources |

---

## How Agents Work

Each agent follows a 3-step process:

```
1. Fetch  — Pulls all relevant data in parallel from SAP HANA Cloud
2. Trim   — Limits arrays to 12 rows to keep within AI model constraints
3. Analyze — Sends full dataset to Sierra AI with a structured-output prompt
```

This produces a deterministic, comprehensive analysis every time — not a conversational exchange.

---

## Running an Agent

1. Navigate to **Agent Hub** in the sidebar
2. Click **▶ Run Analysis** on any agent card
3. A thinking animation appears while the agent fetches data and generates the report (typically 15–30 seconds)
4. The structured report appears below the cards

You can run multiple agents sequentially — each report persists until you navigate away.

---

## Understanding the Agent Report

Every AgentReport has the same structure:

### Risk Level Badge
**HIGH** · **MEDIUM** · **LOW** — the agent's overall assessment of the domain's risk posture, displayed prominently at the top.

### Headline Metrics
6 key metrics for the domain, each with a status indicator:

- 🟢 **ok** — within normal range
- 🟡 **warn** — approaching threshold
- 🔴 **alert** — requires attention

### Risk Findings
Color-coded findings sorted by severity:

- 🔴 **HIGH** — Requires immediate executive awareness or action
- 🟡 **MEDIUM** — Should be addressed this week/month
- 🟢 **LOW** — Monitor; no urgent action required

Each finding includes a title, specific detail with numbers, and a domain tag.

### Recommended Actions
Numbered priority list with:
- Specific actionable step
- Rationale (why this matters, what the impact is)
- Deadline: **Immediate** / **This Week** / **This Month** / **This Quarter**

### Analysis Sections
4–5 narrative sections covering different aspects of the domain. Each section is 2–3 sentences with specific numbers from the live data.

---

## Agent Descriptions

### 🏛 Grants Intelligence Agent
Performs a comprehensive grants portfolio review:

- Compliance posture across all grants (scores, risk tiers)
- Burn rate analysis (which grants are over/under spending)
- Subrecipient monitoring gaps
- Outcome performance vs targets
- Forecast position

Best used: **Weekly** before grant status meetings, or after any significant drawdown event.

### 🛒 Procurement Intelligence Agent
Procurement health check:

- Contracts expiring in ≤90 days
- Vendor risk distribution
- AP aging by bucket and department
- Budget vs spend analysis
- Inventory procurement needs

Best used: **Monthly** before procurement committee meetings.

### ⚙️ Operations Intelligence Agent
Cross-operational risk sweep:

- Critical assets and emergency work orders
- Fleet out-of-service and inspection compliance
- Capital project delays and change order accumulation
- Inventory out-of-stock and low-stock items

Best used: **Weekly** as an operational risk pulse check.

### 🏛️ Executive AI Briefing
Full-platform cross-domain synthesis for senior leadership:

- Fiscal health (grants, funds, treasury, budget)
- Procurement & vendor status
- Capital & operations readiness
- Workforce posture and vacancy risk
- Strategic outlook and forward-looking recommendations

Best used: **Daily** as the first morning briefing, or before any board/council meeting.

---

## Comparison: Sierra Intelligence vs Agent Hub

| | Sierra Intelligence | Agent Hub |
|---|---|---|
| **Mode** | Reactive (you ask, it answers) | Proactive (agent reviews everything) |
| **Trigger** | Your question | "Run Analysis" button |
| **Output** | Conversational answer + chart | Structured report (risks, actions, sections) |
| **Depth** | Focused on the question asked | Full domain portfolio review |
| **Follow-ups** | AI-generated context-aware suggestions | N/A (run again for fresh report) |
| **Best for** | Specific queries, ad-hoc analysis | Regular scheduled reviews, executive briefings |
