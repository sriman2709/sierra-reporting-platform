# User Roles & Access Control

The platform uses **Role-Based Access Control (RBAC)**. Each user is assigned exactly one role, which determines which modules they can access.

## Role Definitions

| Role | Modules Accessible |
|---|---|
| **executive** | All 14 modules + Executive Command Center |
| **finance_analyst** | Grants, Funds, Forecast, Audit, Procurement, Finance, Capital, Assets, Inventory, HR, Fleet, Treasury |
| **grants_manager** | Grants, Subawards, Audit, Procurement |
| **program_manager** | Outcomes, Grants |
| **auditor** | Audit, Grants, Subawards, Procurement, Finance, Capital, Assets, Inventory, HR, Fleet |
| **public_user** | Grants (read-only) |

!!! note "Public Transparency Portal"
    The `/transparency` portal requires **no login** — it is publicly accessible to any user without credentials.

## What Happens When Access is Denied

If you try to access a module your role doesn't permit, the API returns a `403 Access Denied` error. The sidebar only shows links relevant to your role in most deployments — contact your administrator to request elevated access.

## Sierra Intelligence & Agent Hub

Sierra Intelligence and the Agent Hub respect the same role restrictions. If your role cannot access the underlying module (e.g., a `grants_manager` cannot access Fleet data), queries touching that module will return limited or no data.

The **executive** role has full unrestricted access across all domains.
