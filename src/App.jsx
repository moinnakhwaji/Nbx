import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Shell from './components/Shell';
import Login from './auth/Login';

import Home             from './pages/Home';
import Users            from './pages/Users';
import Approvals        from './pages/Approvals';
import Team             from './pages/Team';
import Features         from './pages/Features';
import SessionPolicy    from './pages/SessionPolicy';
import Payments         from './pages/Payments';
import Integrations     from './pages/Integrations';
import Clients          from './pages/Clients';
import Commission       from './pages/Commission';
import Limits           from './pages/Limits';
import Orders           from './pages/Orders';
import PayOps           from './pages/PayOps';
import CustomerSessions from './pages/CustomerSessions';
import Webhooks         from './pages/Webhooks';
import AuditLog         from './pages/AuditLog';
import Usage            from './pages/Usage';
import Account          from './pages/Account';

export default function App() {
  const user = useStore(s => s.user);

  if (!user) return <BrowserRouter><Login /></BrowserRouter>;

  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/"                 element={<Home />} />
          <Route path="/users"            element={<Users />} />
          <Route path="/approvals"        element={<Approvals />} />
          <Route path="/team"             element={<Team />} />
          <Route path="/features"         element={<Features />} />
          <Route path="/sessions-policy"  element={<SessionPolicy />} />
          <Route path="/payments"         element={<Payments />} />
          <Route path="/integrations"     element={<Integrations />} />
          <Route path="/clients"          element={<Clients />} />
          <Route path="/commission"       element={<Commission />} />
          <Route path="/limits"           element={<Limits />} />
          <Route path="/orders"           element={<Orders />} />
          <Route path="/payops"           element={<PayOps />} />
          <Route path="/sessions"         element={<CustomerSessions />} />
          <Route path="/webhooks"         element={<Webhooks />} />
          <Route path="/audit"            element={<AuditLog />} />
          <Route path="/usage"            element={<Usage />} />
          <Route path="/account"          element={<Account />} />
          <Route path="*"                 element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
