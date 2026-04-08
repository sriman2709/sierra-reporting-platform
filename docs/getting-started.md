# Getting Started

## Logging In

Navigate to the platform URL and log in with your assigned credentials.

![Login screen](assets/login.png)

1. Enter your **username** and **password**
2. Click **Sign In**
3. You will be redirected to the Dashboard

!!! info "Session expiry"
    Sessions use JWT tokens valid for 8 hours. If your session expires, you will be automatically redirected to the login page.

---

## Platform Navigation

After logging in, you will see the main application shell with a **left sidebar** and the active page in the main area.

### Sidebar Sections

| Section | Modules |
|---|---|
| **Core Modules** | Dashboard |
| **Financial Management** | Grants, Fund Accounting, Subawards |
| **Analytics** | Outcomes, Audit, Forecast |
| **Enterprise Expansion** | Finance, Procurement, Capital Projects, Assets, Inventory |
| **Workforce & Fleet** | HR & Workforce, Fleet Management |
| **Phase 4 · Treasury & Executive** | Treasury & Revenue, Executive Command Center |
| **Phase 5 · Public Transparency** | Public Portal (external link) |
| **Phase 6 · Agentic AI** | Agent Hub |
| **AI** | Sierra Intelligence |
| **Resources** | SAC Dev Guide, Roadmap |

### Top Bar

The top bar shows:
- Current **page title**
- **HANA Cloud Live** badge (confirms database connectivity)
- Your **username** and **role** in the sidebar footer
- **Sign out** button

---

## Dashboard

The Dashboard is your entry point. It shows:

- **Platform banner** with live connectivity status
- **10 cross-domain KPI tiles** (grants, funds, cash, contracts, employees, fleet, etc.)
- **14 module cards** — click any to navigate directly
- **AI & Agents quick-launch** — shortcuts to Agent Hub and Sierra Intelligence

---

## Understanding the Data

All data is live from **SAP HANA Cloud** via SAP Datasphere. There is no cached or sample data — every number you see reflects the current state of the database.

### Refresh
Pages automatically load fresh data each time you navigate to them. To refresh, simply navigate away and back, or reload the browser tab.

### Data Currency
Data is as current as the last transaction written to HANA Cloud. For real-time operational systems (HR, Fleet, Inventory), this may be near-real-time. For financial period data (Fund Accounting, Treasury), updates reflect period-close postings.

---

## Getting Help

- Use **[Sierra Intelligence](ai/sierra-intelligence.md)** to ask questions in plain English
- Refer to this documentation for module-specific guidance
- For technical issues, contact your system administrator
