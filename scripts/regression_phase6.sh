#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# regression_phase6.sh  –  Phase 6 · Agentic AI
#
# Usage:
#   BASE_URL=https://public-sector-reporting.azurewebsites.net ./scripts/regression_phase6.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4000}"
PASS=0; FAIL=0

GREEN='\033[0;32m'; RED='\033[0;31m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

pass() { echo -e "${GREEN}  ✓ PASS${NC}  $1"; ((PASS++)); }
fail() { echo -e "${RED}  ✗ FAIL${NC}  $1  →  $2"; ((FAIL++)); }
section() { echo -e "\n${CYAN}${BOLD}▸ $1${NC}"; }

# ── Auth helper ───────────────────────────────────────────────────────────────
TOKEN=""
get_token() {
  local resp
  resp=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"Admin@123"}')
  TOKEN=$(echo "$resp" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  if [[ -z "$TOKEN" ]]; then
    echo -e "${RED}  ✗ Login failed — cannot continue${NC}"
    exit 1
  fi
}

# ── Authenticated GET ─────────────────────────────────────────────────────────
auth_get() {
  local label="$1" path="$2" expect="${3:-}"
  local body status
  body=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" "${BASE_URL}${path}")
  status=$(printf '%s' "$body" | tail -n1)
  body=$(printf '%s' "$body" | awk 'NR>1{print prev} {prev=$0}')
  if [[ "$status" != "200" ]]; then
    fail "$label" "HTTP $status"; return
  fi
  if [[ -n "$expect" ]] && ! echo "$body" | grep -q "$expect"; then
    fail "$label" "expected '$expect' not found"; return
  fi
  pass "$label"
}

# ── Authenticated POST (with timeout for long agent runs) ────────────────────
auth_post() {
  local label="$1" path="$2" expect="${3:-}"
  local body status
  body=$(curl -s -w "\n%{http_code}" -m 120 \
    -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    "${BASE_URL}${path}")
  status=$(printf '%s' "$body" | tail -n1)
  body=$(printf '%s' "$body" | awk 'NR>1{print prev} {prev=$0}')
  if [[ "$status" != "200" ]]; then
    fail "$label" "HTTP $status  body: ${body:0:120}"; return
  fi
  if [[ -n "$expect" ]] && ! echo "$body" | grep -q "$expect"; then
    fail "$label" "expected '$expect' not found"; return
  fi
  pass "$label"
}

echo -e "\n${BOLD}══════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Sierra SLED · Phase 6 Regression  ·  ${BASE_URL}${NC}"
echo -e "${BOLD}══════════════════════════════════════════════════════════${NC}"

# ── 1. Login ──────────────────────────────────────────────────────────────────
section "Authentication"
get_token && pass "Admin login"

# ── 2. Agent catalog (GET) ────────────────────────────────────────────────────
section "Agent Catalog"
auth_get "GET /api/agents/catalog" "/api/agents/catalog" "grants"

# ── 3. Agent route auth-gating ────────────────────────────────────────────────
section "Agent routes require auth (no token → 401)"
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/agents/grants/run")
[[ "$status" == "401" ]] && pass "Grants agent auth-gated (401)" || fail "Grants agent auth-gated" "got HTTP $status"

status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/agents/executive/run")
[[ "$status" == "401" ]] && pass "Executive agent auth-gated (401)" || fail "Executive agent auth-gated" "got HTTP $status"

# ── 4. Run each agent (live GPT-4o + HANA — allow ~120s each) ─────────────────
section "Run Agents (live GPT-4o analysis — may take 20-60s each)"

echo "  → Running Grants Intelligence Agent…"
auth_post "Grants Agent run"      "/api/agents/grants/run"      "risk_level"

echo "  → Running Procurement Intelligence Agent…"
auth_post "Procurement Agent run" "/api/agents/procurement/run" "risk_level"

echo "  → Running Operations Intelligence Agent…"
auth_post "Operations Agent run"  "/api/agents/operations/run"  "risk_level"

echo "  → Running Executive AI Briefing…"
auth_post "Executive Briefing run" "/api/agents/executive/run"  "risk_level"

# ── 5. Verify report structure ────────────────────────────────────────────────
section "Report structure validation"
body=$(curl -s -m 120 -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "${BASE_URL}/api/agents/grants/run")

check_field() {
  local field="$1"
  echo "$body" | grep -q "\"$field\"" && pass "Report has field: $field" || fail "Report missing field: $field" ""
}
check_field "summary"
check_field "risk_level"
check_field "headline_metrics"
check_field "risks"
check_field "actions"
check_field "sections"

# ── 6. Phase 5 regression smoke ───────────────────────────────────────────────
section "Phase 5 smoke (public endpoints still work)"
status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/public/kpis")
[[ "$status" == "200" ]] && pass "Public KPIs still 200" || fail "Public KPIs" "got $status"

# ── Summary ───────────────────────────────────────────────────────────────────
TOTAL=$((PASS + FAIL))
echo -e "\n${BOLD}══════════════════════════════════════════════════════════${NC}"
[[ $FAIL -eq 0 ]] && echo -e "${GREEN}${BOLD}  ALL ${TOTAL} TESTS PASSED  ✓${NC}" || echo -e "${RED}${BOLD}  ${FAIL}/${TOTAL} TESTS FAILED${NC}"
echo -e "${BOLD}══════════════════════════════════════════════════════════${NC}\n"
[[ $FAIL -eq 0 ]]
