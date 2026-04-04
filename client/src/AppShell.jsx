import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getUser, logout } from './auth';

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
  { to: '/finance',      label: 'Finance Controller',    icon: '🏦' },
  { to: '/procurement',  label: 'Procurement & AP',      icon: '🛒' },
  { section: 'AI' },
  { to: '/ai',           label: 'Sierra Intelligence',   icon: '✦'  },
  { section: 'Resources' },
  { to: '/guide',        label: 'SAC Dev Guide',         icon: '📖' },
  { to: '/roadmap',      label: 'Roadmap',               icon: '🗺', roadmap: true },
];

export default function AppShell({ pageTitle }) {
  const user = getUser();
  const navigate = useNavigate();

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
          <span className="top-bar-badge">HANA Cloud Live</span>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
