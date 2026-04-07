import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn } from './auth';
import Login       from './pages/Login';
import AppShell    from './AppShell';
import Dashboard   from './pages/Dashboard';
import Grants      from './pages/Grants';
import Funds       from './pages/Funds';
import Subawards   from './pages/Subawards';
import Outcomes    from './pages/Outcomes';
import Audit       from './pages/Audit';
import Forecast    from './pages/Forecast';
import SACGuide    from './pages/SACGuide';
import AIChat      from './pages/AIChat';
import Procurement    from './pages/Procurement';
import Finance        from './pages/Finance';
import CapitalProjects from './pages/CapitalProjects';
import Assets         from './pages/Assets';
import Inventory      from './pages/Inventory';
import HR             from './pages/HR';
import Fleet           from './pages/Fleet';
import Treasury        from './pages/Treasury';
import ExecutiveCenter from './pages/ExecutiveCenter';
import Roadmap         from './pages/Roadmap';
import Transparency    from './pages/Transparency';
import AgentHub        from './pages/AgentHub';

const PAGE_TITLES = {
  '/':             'Platform Overview',
  '/grants':       'Grants Management',
  '/funds':        'Fund Accounting',
  '/subawards':    'Subaward & Compliance',
  '/outcomes':     'Outcome Metrics',
  '/audit':        'Audit Readiness',
  '/forecast':     'Financial Forecast',
  '/guide':        'SAC Development Guide',
  '/ai':           'Sierra Intelligence · AI Analyst',
  '/procurement':        'Procurement & AP Intelligence',
  '/finance':            'Finance Controller',
  '/capital-projects':   'Capital Projects & CIP',
  '/assets':             'Assets & Plant Maintenance',
  '/inventory':          'Inventory & Warehouse',
  '/hr':                 'HR & Workforce',
  '/fleet':              'Fleet Management',
  '/treasury':           'Treasury & Revenue',
  '/executive':          'Executive Command Center',
  '/roadmap':            'Enterprise Roadmap',
  '/agents':             'Sierra Agentic AI',
};

function RequireAuth() {
  const location = useLocation();
  if (!isLoggedIn()) return <Navigate to="/login" state={{ from: location }} replace />;
  const title = PAGE_TITLES[location.pathname] || 'Dashboard';
  return <AppShell pageTitle={title} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"        element={<Login />} />
        <Route path="/transparency" element={<Transparency />} />  {/* public — no auth */}
        <Route element={<RequireAuth />}>
          <Route index          element={<Dashboard />} />
          <Route path="/grants"    element={<Grants />} />
          <Route path="/funds"     element={<Funds />} />
          <Route path="/subawards" element={<Subawards />} />
          <Route path="/outcomes"  element={<Outcomes />} />
          <Route path="/audit"     element={<Audit />} />
          <Route path="/forecast"  element={<Forecast />} />
          <Route path="/guide"       element={<SACGuide />} />
          <Route path="/ai"          element={<AIChat />} />
          <Route path="/procurement"      element={<Procurement />} />
          <Route path="/finance"          element={<Finance />} />
          <Route path="/capital-projects" element={<CapitalProjects />} />
          <Route path="/assets"           element={<Assets />} />
          <Route path="/inventory"        element={<Inventory />} />
          <Route path="/hr"               element={<HR />} />
          <Route path="/fleet"            element={<Fleet />} />
          <Route path="/treasury"         element={<Treasury />} />
          <Route path="/executive"        element={<ExecutiveCenter />} />
          <Route path="/roadmap"          element={<Roadmap />} />
          <Route path="/agents"           element={<AgentHub />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
