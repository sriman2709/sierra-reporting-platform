#!/bin/bash
# Sierra SLED Phase 1 Full Regression — 37 endpoints
BASE="https://public-sector-reporting.azurewebsites.net"
PASS=0; FAIL=0; TOTAL=0

# Login
TOKEN=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}' | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token',''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "AUTH FAILED — cannot continue"; exit 1
fi
echo "Token: ${TOKEN:0:30}..."
echo ""

check() {
  local label="$1"; local url="$2"; local expect="$3"
  TOTAL=$((TOTAL+1))
  BODY=$(curl -s -H "Authorization: Bearer $TOKEN" "$url")
  if echo "$BODY" | python3 -c "
import sys,json
try:
  d=json.load(sys.stdin)
  exp='$expect'
  if exp=='obj': ok = isinstance(d,dict) and len(d)>0
  elif exp.startswith('>'): ok = isinstance(d,list) and len(d)>=int(exp[1:])
  elif exp.isdigit(): ok = isinstance(d,list) and len(d)==int(exp)
  else: ok=True
  sys.exit(0 if ok else 1)
except: sys.exit(1)
" 2>/dev/null; then
    echo "OK    $label"
    PASS=$((PASS+1))
  else
    echo "FAIL  $label → ${BODY:0:80}"
    FAIL=$((FAIL+1))
  fi
}

echo "=== GRANTS & COMPLIANCE ==="
check "/api/grants/kpis"              "$BASE/api/grants/kpis"              "obj"
check "/api/grants"                   "$BASE/api/grants"                   ">1"
check "/api/grants/compliance-posture" "$BASE/api/grants/compliance-posture" ">1"
check "/api/grants/allowability"      "$BASE/api/grants/allowability"      ">1"
check "/api/grants/subrecipient-risk" "$BASE/api/grants/subrecipient-risk" ">1"
check "/api/grants/burn-rate"         "$BASE/api/grants/burn-rate"         ">1"

echo ""
echo "=== FUNDS ==="
check "/api/funds/kpis"      "$BASE/api/funds/kpis"      "obj"
check "/api/funds/available" "$BASE/api/funds/available" ">1"

echo ""
echo "=== OUTCOMES ==="
check "/api/outcomes/kpis"             "$BASE/api/outcomes/kpis"             "obj"
check "/api/outcomes/scorecard"        "$BASE/api/outcomes/scorecard"        ">1"
check "/api/outcomes/effectiveness"    "$BASE/api/outcomes/effectiveness"    ">1"
check "/api/outcomes/grant-linkage"    "$BASE/api/outcomes/grant-linkage"    ">1"
check "/api/outcomes/trend"            "$BASE/api/outcomes/trend"            ">1"
check "/api/outcomes/cost-effectiveness" "$BASE/api/outcomes/cost-effectiveness" ">1"

echo ""
echo "=== SUBAWARDS ==="
check "/api/subawards/kpis"          "$BASE/api/subawards/kpis"          "obj"
check "/api/subawards/subrecipients" "$BASE/api/subawards/subrecipients" ">1"
check "/api/subawards/monitoring"    "$BASE/api/subawards/monitoring"    ">1"
check "/api/subawards/corrective"    "$BASE/api/subawards/corrective"    ">1"

echo ""
echo "=== AUDIT ==="
check "/api/audit/kpis"      "$BASE/api/audit/kpis"      "obj"
check "/api/audit/readiness" "$BASE/api/audit/readiness" ">1"
check "/api/audit/evidence"  "$BASE/api/audit/evidence"  ">1"
check "/api/audit/documents" "$BASE/api/audit/documents" ">1"
check "/api/audit/approvals" "$BASE/api/audit/approvals" ">1"

echo ""
echo "--- Audit Drilldown (grant_id=b8cd399c46a6464ebc46) ---"
DRILL=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE/api/audit/drilldown/b8cd399c46a6464ebc46")
TOTAL=$((TOTAL+1))
if echo "$DRILL" | python3 -c "
import sys,json
d=json.load(sys.stdin)
keys=['grant','evidence','documents','approvals','findings','auditLog']
ok=all(k in d for k in keys)
print(str([k for k in keys if k in d]))
sys.exit(0 if ok else 1)
" 2>/dev/null; then
  echo "OK    /api/audit/drilldown/:id"
  PASS=$((PASS+1))
else
  echo "FAIL  /api/audit/drilldown/:id → ${DRILL:0:80}"
  FAIL=$((FAIL+1))
fi

echo ""
echo "=== FORECAST ==="
check "/api/forecast/kpis"          "$BASE/api/forecast/kpis"          "obj"
check "/api/forecast/what-if-base"  "$BASE/api/forecast/what-if-base"  ">1"
check "/api/forecast/sensitivity"   "$BASE/api/forecast/sensitivity"   ">1"

echo ""
echo "=== PROCUREMENT & AP (Phase 1 Sprint 9) ==="
check "/api/procurement/kpis"      "$BASE/api/procurement/kpis"      "obj"
check "/api/procurement/pipeline"  "$BASE/api/procurement/pipeline"  ">1"
check "/api/procurement/contracts" "$BASE/api/procurement/contracts" ">1"
check "/api/procurement/ap-aging"  "$BASE/api/procurement/ap-aging"  ">1"
check "/api/procurement/vendors"   "$BASE/api/procurement/vendors"   ">1"

echo ""
echo "=== FINANCE CONTROLLER (Phase 1 Sprint 10) ==="
check "/api/finance/kpis"            "$BASE/api/finance/kpis"            "obj"
check "/api/finance/budget-variance" "$BASE/api/finance/budget-variance" ">1"
check "/api/finance/close-readiness" "$BASE/api/finance/close-readiness" ">1"
check "/api/finance/journals"        "$BASE/api/finance/journals"        ">1"
check "/api/finance/interfund"       "$BASE/api/finance/interfund"       ">1"

echo ""
echo "================================"
echo "  PASS: $PASS   FAIL: $FAIL   TOTAL: $TOTAL"
echo "================================"
