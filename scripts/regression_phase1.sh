#!/bin/bash
# Sierra SLED Phase 1 Regression — fixed Python exit bug
BASE="https://public-sector-reporting.azurewebsites.net"
PASS=0; FAIL=0; TOTAL=0

TOKEN=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}' | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token',''))" 2>/dev/null)

[ -z "$TOKEN" ] && echo "AUTH FAILED" && exit 1
echo "Token OK"
echo ""

check() {
  local label="$1" url="$2"
  TOTAL=$((TOTAL+1))
  BODY=$(curl -s -H "Authorization: Bearer $TOKEN" "$url")
  # Use grep to detect error — avoids Python sys.exit/except conflict
  if echo "$BODY" | grep -q '"error"'; then
    echo "FAIL  $label → ${BODY:0:80}"
    FAIL=$((FAIL+1))
  elif [ -z "$BODY" ] || [ "$BODY" = "null" ]; then
    echo "FAIL  $label → (empty)"
    FAIL=$((FAIL+1))
  else
    COUNT=$(echo "$BODY" | python3 -c "
import sys,json
try:
  d=json.load(sys.stdin)
  print(f'({len(d)} rows)' if isinstance(d,list) else '(obj)')
except:
  print('(?)')
" 2>/dev/null)
    echo "OK    $label $COUNT"
    PASS=$((PASS+1))
  fi
}

echo "=== GRANTS & COMPLIANCE ==="
check "/api/grants/kpis"               "$BASE/api/grants/kpis"
check "/api/grants"                    "$BASE/api/grants"
check "/api/grants/compliance-posture" "$BASE/api/grants/compliance-posture"
check "/api/grants/allowability"       "$BASE/api/grants/allowability"
check "/api/grants/subrecipient-risk"  "$BASE/api/grants/subrecipient-risk"
check "/api/grants/burn-rate"          "$BASE/api/grants/burn-rate"

echo ""
echo "=== FUNDS ==="
check "/api/funds/kpis"      "$BASE/api/funds/kpis"
check "/api/funds/available" "$BASE/api/funds/available"

echo ""
echo "=== OUTCOMES ==="
check "/api/outcomes/kpis"               "$BASE/api/outcomes/kpis"
check "/api/outcomes/scorecard"          "$BASE/api/outcomes/scorecard"
check "/api/outcomes/effectiveness"      "$BASE/api/outcomes/effectiveness"
check "/api/outcomes/grant-linkage"      "$BASE/api/outcomes/grant-linkage"
check "/api/outcomes/trend"              "$BASE/api/outcomes/trend"
check "/api/outcomes/cost-effectiveness" "$BASE/api/outcomes/cost-effectiveness"

echo ""
echo "=== SUBAWARDS ==="
check "/api/subawards/kpis"          "$BASE/api/subawards/kpis"
check "/api/subawards/subrecipients" "$BASE/api/subawards/subrecipients"
check "/api/subawards/monitoring"    "$BASE/api/subawards/monitoring"
check "/api/subawards/corrective"    "$BASE/api/subawards/corrective"

echo ""
echo "=== AUDIT ==="
check "/api/audit/kpis"      "$BASE/api/audit/kpis"
check "/api/audit/readiness" "$BASE/api/audit/readiness"
check "/api/audit/evidence"  "$BASE/api/audit/evidence"
check "/api/audit/documents" "$BASE/api/audit/documents"
check "/api/audit/approvals" "$BASE/api/audit/approvals"

echo ""
echo "--- Drilldown ---"
TOTAL=$((TOTAL+1))
DRILL=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE/api/audit/drilldown/b8cd399c46a6464ebc46")
if echo "$DRILL" | grep -q '"grant"' && echo "$DRILL" | grep -q '"evidence"'; then
  echo "OK    /api/audit/drilldown/:id"; PASS=$((PASS+1))
else
  echo "FAIL  /api/audit/drilldown/:id → ${DRILL:0:80}"; FAIL=$((FAIL+1))
fi

echo ""
echo "=== FORECAST ==="
check "/api/forecast/kpis"         "$BASE/api/forecast/kpis"
check "/api/forecast/what-if-base" "$BASE/api/forecast/what-if-base"
check "/api/forecast/sensitivity"  "$BASE/api/forecast/sensitivity"

echo ""
echo "=== PROCUREMENT (Sprint 9) ==="
check "/api/procurement/kpis"      "$BASE/api/procurement/kpis"
check "/api/procurement/pipeline"  "$BASE/api/procurement/pipeline"
check "/api/procurement/contracts" "$BASE/api/procurement/contracts"
check "/api/procurement/ap-aging"  "$BASE/api/procurement/ap-aging"
check "/api/procurement/vendors"   "$BASE/api/procurement/vendors"

echo ""
echo "=== FINANCE CONTROLLER (Sprint 10) ==="
check "/api/finance/kpis"            "$BASE/api/finance/kpis"
check "/api/finance/budget-variance" "$BASE/api/finance/budget-variance"
check "/api/finance/close-readiness" "$BASE/api/finance/close-readiness"
check "/api/finance/journals"        "$BASE/api/finance/journals"
check "/api/finance/interfund"       "$BASE/api/finance/interfund"

echo ""
echo "================================"
echo "  PASS: $PASS   FAIL: $FAIL   TOTAL: $TOTAL"
echo "================================"
