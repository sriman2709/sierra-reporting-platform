import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn } from './auth';
import Login     from './pages/Login';
import AppShell  from './AppShell';
import Dashboard from './pages/Dashboard';
import Grants    from './pages/Grants';
import Funds     from './pages/Funds';
import Subawards from './pages/Subawards';
import Outcomes  from './pages/Outcomes';
import Audit     from './pages/Audit';
import Forecast  from './pages/Forecast';
import SACGuide  from './pages/SACGuide';

const PAGE_TITLES = {
  '/':          'Platform Overview',
  '/grants':    'Grants Management',
  '/funds':     'Fund Accounting',
  '/subawards': 'Subaward & Compliance',
  '/outcomes':  'Outcome Metrics',
  '/audit':     'Audit Readiness',
  '/forecast':  'Financial Forecast',
  '/guide':     'SAC Development Guide',
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
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route index          element={<Dashboard />} />
          <Route path="/grants"    element={<Grants />} />
          <Route path="/funds"     element={<Funds />} />
          <Route path="/subawards" element={<Subawards />} />
          <Route path="/outcomes"  element={<Outcomes />} />
          <Route path="/audit"     element={<Audit />} />
          <Route path="/forecast"  element={<Forecast />} />
          <Route path="/guide"     element={<SACGuide />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
