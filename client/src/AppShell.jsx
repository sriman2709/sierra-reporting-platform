import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getUser, logout } from './auth';
import HelpDrawer from './components/HelpDrawer';

const NAV = [
  { to: '/',             label: 'Dashboard',             icon: '⊞'  },
  { section: 'Core Modules' },
  { to: '/grants',       label: 'Grants Management',     icon: '🏛' },
  { to: '/funds',        label: 'Fund Accounting',       icon: '💰' },
  { to: '/subawards',    label: 'Subaward & Compliance', icon: '📋' },
  { section: 'Analytics' },
  { to: '/outcomes',     label: 'Outcome Metrics',       icon: '📈' },
  { to: '/audit',        label: 'Audit Readiness',       icon: '🔍' },
  { to: '/forecast',     label: 'Financial Forecast',    icon: '📊' },
  { section: 'Enterprise Expansion' },
  { to: '/finance',           label: 'Finance Controller',    icon: '🏦' },
  { to: '/procurement',       label: 'Procurement & AP',      icon: '🛒' },
  { to: '/capital-projects',  label: 'Capital Projects & CIP',icon: '🏗' },
  { to: '/assets',            label: 'Assets & Maintenance',  icon: '🔧' },
  { to: '/inventory',         label: 'Inventory & Warehouse', icon: '📦' },
  { to: '/hr',                label: 'HR & Workforce',        icon: '👥' },
  { to: '/fleet',             label: 'Fleet Management',      icon: '🚗' },
  { section: 'Phase 4 · Treasury & Executive' },
  { to: '/treasury',          label: 'Treasury & Revenue',    icon: '🏦' },
  { to: '/executive',         label: 'Executive Command Ctr', icon: '🎯' },
  { section: 'Phase 6 · Agentic AI' },
  { to: '/agents',       label: 'Agent Hub',             icon: '✦'  },
  { to: '/ai',           label: 'Sierra Intelligence',   icon: '◈'  },
  { section: 'Phase 5 · Public Transparency' },
  { to: '/transparency', label: 'Public Portal',         icon: '🌐' },
  { section: 'Resources' },
  { to: '/help',         label: 'Help Centre',           icon: '❓' },
  { to: '/guide',        label: 'SAC Dev Guide',         icon: '📖' },
  { to: '/roadmap',      label: 'Roadmap',               icon: '🗺', roadmap: true },
];

export default function AppShell({ pageTitle }) {
  const user = getUser();
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Sierra SLED</h2>
          <p>Public Sector Reporting</p>
        </div>
        <nav>
          {NAV.map((item, i) =>
            item.section ? (
              <div key={i} className="nav-section">{item.section}</div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                style={item.roadmap ? { marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 } : undefined}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            )
          )}
        </nav>
        <div className="sidebar-footer">
          <strong>{user?.name || user?.username}</strong>
          <span style={{ textTransform: 'capitalize', fontSize: 11 }}>{user?.role?.replace('_', ' ')}</span>
          <button className="logout-btn" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>

      <div className="main-area">
        <header className="top-bar">
          <h1>{pageTitle || 'Dashboard'}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="top-bar-badge">HANA Cloud Live</span>

            {/* Contextual help button */}
            <button
              onClick={() => setHelpOpen(true)}
              title="Help for this page"
              style={{
                width: 34, height: 34,
                borderRadius: 8,
                background: '#1a5c9e',
                border: '1.5px solid #1a5c9e',
                color: '#fff',
                fontSize: 15, fontWeight: 700,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#154a80'}
              onMouseLeave={e => e.currentTarget.style.background = '#1a5c9e'}
            >?</button>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Contextual help drawer — knows the current route via useLocation inside */}
      <HelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
