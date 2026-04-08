# Deployment Guide

## Architecture

```
GitHub (sriman2709/sierra-reporting-platform)
    ↓  push to main
Azure App Service (public-sector-reporting, grants-management-rg, Central US)
    ↓  serves
React SPA (client/dist/) + Node.js API (server/)
    ↓  connects
SAP HANA Cloud via Datasphere (sierradigitalinc.us10.hcs.cloud.sap)
```

---

## Environment Variables (Azure App Settings)

| Variable | Description |
|---|---|
| `HANA_HOST` | SAP HANA Cloud hostname |
| `HANA_PORT` | HANA port (typically 443) |
| `HANA_USER` | HANA database user |
| `HANA_PASSWORD` | HANA database password |
| `JWT_SECRET` | Secret for JWT signing |
| `OPENAI_API_KEY` | OpenAI API key for Sierra AI |
| `SEED_SECRET` | One-time seed endpoint protection key |
| `NODE_ENV` | Set to `production` |

---

## Deployment Procedure

### Method 1: Lean-Zip Deploy (Recommended for Rapid Iteration)

```bash
# 1. Build the React frontend
cd /Users/srimannarayanan/projects/sierra-reporting-platform/client
PATH="/opt/homebrew/Cellar/node/25.8.1_1/bin:$PATH" npm run build

# 2. Create lean zip (excludes node_modules — Azure installs them)
cd /Users/srimannarayanan/projects/sierra-reporting-platform
zip -r /tmp/sierra-deploy.zip server client/dist package.json package-lock.json \
  -x "*/node_modules/*" -q

# 3. Deploy to Azure
PATH="/opt/homebrew/bin:$PATH" az webapp deploy \
  --resource-group grants-management-rg \
  --name public-sector-reporting \
  --src-path /tmp/sierra-deploy.zip \
  --type zip --async false
```

Typical deploy time: 60–90 seconds. The zip is ~330KB.

### Method 2: GitHub Actions CI/CD

Push to the `main` branch triggers automatic deployment via `.github/workflows/`. This is slower than Method 1 (2–5 minutes) but provides an audit trail in GitHub.

```bash
git add <files>
git commit -m "Sprint N: description"
git push origin main
```

---

## npm and az CLI Paths (This Machine)

```bash
npm path:  /opt/homebrew/Cellar/node/25.8.1_1/bin
az path:   /opt/homebrew/bin/az
```

---

## Seeding HANA Data

HANA Cloud only allows connections from allowlisted IP addresses. Local development machines may not be on the allowlist. Use the server-side seed endpoint:

```bash
# After deploying, call the seed endpoint from Azure
curl -X POST https://public-sector-reporting.azurewebsites.net/api/treasury/seed \
  -H "x-seed-secret: sierra-phase4-seed-446357eb76ed22e8"
```

This creates all Phase 4 tables (`I_CashAccount`, `I_Investment`, `I_DebtService`, `I_TaxRevenue`, `I_ExecutiveAlert`, `I_KPIBenchmark`) and seeds sample data.

!!! warning "One-time operation"
    The seed endpoint uses `CREATE TABLE IF NOT EXISTS` — it is safe to call multiple times but will not overwrite existing data.

---

## Running Regression Tests

```bash
# Phase 5 — Public endpoints
BASE_URL=https://public-sector-reporting.azurewebsites.net \
  bash scripts/regression_phase5.sh

# Phase 6 — Agent Hub (runs live AI calls — allow 5–10 minutes)
BASE_URL=https://public-sector-reporting.azurewebsites.net \
  bash scripts/regression_phase6.sh
```

---

## Azure CLI Quick Reference

```bash
# List web apps
az webapp list --output table

# View app logs
az webapp log tail --name public-sector-reporting --resource-group grants-management-rg

# Restart the app
az webapp restart --name public-sector-reporting --resource-group grants-management-rg

# View app settings
az webapp config appsettings list \
  --name public-sector-reporting \
  --resource-group grants-management-rg
```
