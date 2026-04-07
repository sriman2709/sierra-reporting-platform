#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# regression_phase4.sh  —  Phase 4 regression: Treasury & Executive endpoints
# Usage:
#   ./scripts/regression_phase4.sh                  # test local (port 4000)
#   BASE=https://public-sector-reporting.azurewebsites.net ./scripts/regression_phase4.sh
# ─────────────────────────────────────────────────────────────────────────────
BASE=${BASE:-http://localhost:4000}
PASS=0; FAIL=0; SKIP=0

# ── Colours ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'

# ── Helpers ──────────────────────────────────────────────────────────────────
check() {
  local label="$1" url="$2" expect="$3"
  local body; body=$(curl -s -w '\n%{http_code}' -H "Authorization: Bearer $TOKEN" "$url")
  local code; code=$(echo "$body" | tail -1)
  local json; json=$(echo "$body" | head -n -1)

  if [[ "$code" != "200" ]]; then
    echo -e "  ${RED}✗${NC} $label  →  HTTP $code"
    ((FAIL++)); return
  fi

  if [[ -n "$expect" ]]; then
    if echo "$json" | grep -q "$expect"; then
      echo -e "  ${GREEN}✓${NC} $label"
      ((PASS++))
    else
      echo -e "  ${RED}✗${NC} $label  (expected '$expect' in response)"
      echo "    Response: ${json:0:120}"
      ((FAIL++))
    fi
  else
    echo -e "  ${GREEN}✓${NC} $label"
    ((PASS++))
  fi
}

# ── Login and get token ───────────────────────────────────────────────────────
echo ""
echo "Sierra SLED — Phase 4 Regression"
echo "  Target: $BASE"
echo "─────────────────────────────────────────────────────"

AUTH=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"sierra2024"}')

TOKEN=$(echo "$AUTH" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"//')

if [[ -z "$TOKEN" ]]; then
  echo -e "  ${RED}✗${NC} Login failed — cannot proceed"
  echo "    Response: $AUTH"
  exit 1
fi
echo -e "  ${GREEN}✓${NC} Login OK"
echo ""

# ── Health check ─────────────────────────────────────────────────────────────
echo "HEALTH"
check "Health endpoint"            "$BASE/health"    '"status":"ok"'
echo ""

# ── Treasury endpoints ────────────────────────────────────────────────────────
echo "TREASURY MODULE"
check "Treasury KPIs"              "$BASE/api/treasury/kpis"                 "total_cash_position"
check "Cash Accounts"              "$BASE/api/treasury/cash-accounts"        "account_name"
check "Investments"                "$BASE/api/treasury/investments"          "investment_type"
check "Debt Service"               "$BASE/api/treasury/debt-service"         "bond_description"
check "Tax Trend"                  "$BASE/api/treasury/tax-trend"            "tax_type"
check "Revenue by Type"            "$BASE/api/treasury/revenue-by-type"      "total_collected"
check "Cash by Type"               "$BASE/api/treasury/cash-by-type"         "account_type"
check "Investments by Type"        "$BASE/api/treasury/investments-by-type"  "investment_type"
echo ""

# ── Executive endpoints ───────────────────────────────────────────────────────
echo "EXECUTIVE MODULE"
check "Executive KPIs"             "$BASE/api/executive/kpis"                "active_grants"
check "Executive Alerts"           "$BASE/api/executive/alerts"              "severity"
check "KPI Benchmarks"             "$BASE/api/executive/benchmarks"          "kpi_name"
check "Grant Trend"                "$BASE/api/executive/grant-trend"         ""
check "Domain Risk"                "$BASE/api/executive/domain-risk"         "domain"
check "Budget vs Actual"           "$BASE/api/executive/budget-actual"       "department"
echo ""

# ── Existing modules (smoke test — ensure Phase 4 didn't break anything) ──────
echo "REGRESSION — EXISTING MODULES (smoke)"
check "Grants list"                "$BASE/api/grants/list"                   ""
check "Funds balance"              "$BASE/api/funds/balance"                 ""
check "Procurement KPIs"           "$BASE/api/procurement/kpis"              ""
check "Finance KPIs"               "$BASE/api/finance/kpis"                  ""
check "Capital Projects"           "$BASE/api/capital/projects"              ""
check "Assets KPIs"                "$BASE/api/assets/kpis"                   ""
check "Inventory KPIs"             "$BASE/api/inventory/kpis"                ""
check "HR KPIs"                    "$BASE/api/hr/kpis"                       ""
check "Fleet KPIs"                 "$BASE/api/fleet/kpis"                    ""
echo ""

# ── Summary ──────────────────────────────────────────────────────────────────
TOTAL=$((PASS + FAIL + SKIP))
echo "─────────────────────────────────────────────────────"
echo -e "  ${GREEN}PASS${NC} $PASS / $TOTAL    ${RED}FAIL${NC} $FAIL    ${YELLOW}SKIP${NC} $SKIP"
echo ""

if [[ $FAIL -gt 0 ]]; then
  echo -e "  ${RED}❌  $FAIL test(s) failed — review above${NC}"
  exit 1
else
  echo -e "  ${GREEN}✅  All Phase 4 regression tests passed${NC}"
  exit 0
fi
