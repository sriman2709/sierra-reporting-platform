#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# regression_phase5.sh  –  Phase 5 · Public Transparency Portal
# NO authentication token required for /api/public/* endpoints
#
# Usage:
#   chmod +x scripts/regression_phase5.sh
#   BASE_URL=https://public-sector-reporting.azurewebsites.net ./scripts/regression_phase5.sh
#   # or local:
#   ./scripts/regression_phase5.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4000}"
PASS=0; FAIL=0

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

pass() { echo -e "${GREEN}  ✓ PASS${NC}  $1"; ((PASS++)); }
fail() { echo -e "${RED}  ✗ FAIL${NC}  $1  →  $2"; ((FAIL++)); }
section() { echo -e "\n${CYAN}${BOLD}▸ $1${NC}"; }

# ── Helper: GET without auth token ───────────────────────────────────────────
pub_get() {
  local label="$1" path="$2" expect="${3:-}"
  local http body status

  body=$(curl -s -w "\n%{http_code}" "${BASE_URL}${path}")
  status=$(printf '%s' "$body" | tail -n1)
  # strip last line (status code) from body
  body=$(printf '%s' "$body" | awk 'NR>1{print prev} {prev=$0}')

  if [[ "$status" != "200" ]]; then
    fail "$label" "HTTP $status"
    return
  fi

  if [[ -n "$expect" ]]; then
    if echo "$body" | grep -q "$expect"; then
      pass "$label"
    else
      fail "$label" "expected '$expect' not found in response"
    fi
  else
    pass "$label"
  fi
}

echo -e "\n${BOLD}══════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Sierra SLED · Phase 5 Regression  ·  ${BASE_URL}${NC}"
echo -e "${BOLD}══════════════════════════════════════════════════════════${NC}"

# ── 1. Health check ───────────────────────────────────────────────────────────
section "Health"
pub_get "Health endpoint" "/health" "ok"

# ── 2. Public transparency endpoints (no token) ───────────────────────────────
section "Public Transparency — /api/public/* (no auth)"

pub_get "KPIs"              "/api/public/kpis"            "active_grants"
pub_get "Grant Awards"      "/api/public/grants"          "grant_number"
pub_get "Spending by Fund"  "/api/public/spending"        "fund_name"
pub_get "CAFR Summary"      "/api/public/cafr"            "fund_type"
pub_get "Tax Revenue"       "/api/public/tax"             "tax_type"
pub_get "Tax Trend"         "/api/public/tax-trend"       "fiscal_month"
pub_get "Program Outcomes"  "/api/public/outcomes"        "metric_name"
pub_get "Grants by Agency"  "/api/public/grants-by-agency" "grantor_agency"
pub_get "Contracts"         "/api/public/contracts"       "contract_number"

# ── 3. Verify public endpoints return NO auth error ───────────────────────────
section "Public endpoints must NOT require auth (no 401/403)"

check_no_auth() {
  local label="$1" path="$2"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${path}")
  if [[ "$status" == "401" || "$status" == "403" ]]; then
    fail "$label" "Got HTTP $status — endpoint is auth-gated!"
  else
    pass "$label (HTTP $status — open)"
  fi
}

check_no_auth "KPIs no-auth"             "/api/public/kpis"
check_no_auth "Grants no-auth"           "/api/public/grants"
check_no_auth "Spending no-auth"         "/api/public/spending"
check_no_auth "CAFR no-auth"            "/api/public/cafr"
check_no_auth "Tax Revenue no-auth"     "/api/public/tax"
check_no_auth "Tax Trend no-auth"       "/api/public/tax-trend"
check_no_auth "Outcomes no-auth"        "/api/public/outcomes"
check_no_auth "Grants-by-Agency no-auth" "/api/public/grants-by-agency"
check_no_auth "Contracts no-auth"       "/api/public/contracts"

# ── 4. Smoke tests — existing Phase 1–4 endpoints still work ─────────────────
section "Smoke — Phase 1–4 protected routes still require auth"

check_requires_auth() {
  local label="$1" path="$2"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${path}")
  if [[ "$status" == "401" || "$status" == "403" ]]; then
    pass "$label (correctly returns HTTP $status)"
  else
    fail "$label" "Expected 401/403 but got HTTP $status"
  fi
}

check_requires_auth "Grants module auth-gated"    "/api/grants/kpis"
check_requires_auth "Treasury module auth-gated"  "/api/treasury/kpis"
check_requires_auth "Executive module auth-gated" "/api/executive/kpis"

# ── Summary ───────────────────────────────────────────────────────────────────
TOTAL=$((PASS + FAIL))
echo -e "\n${BOLD}══════════════════════════════════════════════════════════${NC}"
if [[ $FAIL -eq 0 ]]; then
  echo -e "${GREEN}${BOLD}  ALL ${TOTAL} TESTS PASSED  ✓${NC}"
else
  echo -e "${RED}${BOLD}  ${FAIL}/${TOTAL} TESTS FAILED${NC}"
fi
echo -e "${BOLD}══════════════════════════════════════════════════════════${NC}\n"

[[ $FAIL -eq 0 ]]
