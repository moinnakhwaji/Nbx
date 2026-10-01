import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Toasts } from './ui';
import { ROLES, CAP_LABEL } from '../data';

const NAV = [
  { group: 'Your bank', items: [
    { to: '/',         label: 'Home' },
    { to: '/users',    label: 'Users' },
    { to: '/approvals',label: 'Approvals', badge: (s) => s.approvals.filter(a => a.status === 'pending').length },
    { to: '/team',     label: 'Team' },
  ]},
  { group: 'Setup', items: [
    { to: '/features',  label: 'Features' },
    { to: '/sessions-policy', label: 'Session policy' },
    { to: '/payments',  label: 'Payment security' },
    { to: '/integrations', label: 'Integrations' },
    { to: '/clients',   label: 'API clients & keys' },
  ]},
  { group: 'Commercial', items: [
    { to: '/commission', label: 'Commission & fees' },
    { to: '/limits',     label: 'Order limits' },
  ]},
  { group: 'Activity', items: [
    { to: '/orders',    label: 'Orders' },
    { to: '/payops',    label: 'Payment operations', badge: (s) => s.payops.filter(p => p.status === 'abandoned').length },
    { to: '/sessions',  label: 'Customer sessions' },
    { to: '/webhooks',  label: 'Webhooks' },
    { to: '/audit',     label: 'Audit log' },
    { to: '/usage',     label: 'Usage' },
  ]},
  { group: 'You', items: [
    { to: '/account', label: 'My account' },
  ]},
];

export default function Shell({ children }) {
  const { user, logout, toasts } = useStore();
  const navigate = useNavigate();
  const role = ROLES[user?.role];
  const store = useStore.getState();

  return (
    <div className="grid min-h-screen" style={{ gridTemplateColumns: '250px 1fr' }}>
      {/* Sidebar */}
      <aside className="flex flex-col gap-1 sticky top-0 h-screen overflow-y-auto" style={{ background: 'var(--side)', color: 'var(--side-ink)' }}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 pb-5 border-b border-white/5">
          <span className="w-7 h-7 rounded-lg grid place-items-center text-white text-xs font-bold flex-none" style={{ background: '#0f7a63' }}>NBF</span>
          <div>
            <div className="font-bold text-sm text-white">NBF · Gold & Silver</div>
            <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--side-dim)' }}>Bank portal · by NUQI</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 px-3">
          {NAV.map(({ group, items }) => (
            <div key={group}>
              <div className="text-[10px] uppercase tracking-widest px-2 py-3 pt-4" style={{ color: 'var(--side-dim)' }}>{group}</div>
              {items.map(({ to, label, badge }) => {
                const count = badge ? badge(store) : 0;
                return (
                  <NavLink key={to} to={to} end={to === '/'}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-1.5 rounded-lg text-sm mb-0.5 no-underline transition-colors ${isActive ? 'text-white font-medium' : 'hover:bg-white/5'}`
                    }
                    style={({ isActive }) => isActive ? { background: 'rgba(229,192,104,.14)', boxShadow: 'inset 2px 0 0 #e5c068' } : {}}
                  >
                    <span>{label}</span>
                    {count > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#b3261e', color: '#fff' }}>{count}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-white/10 text-xs">
          <div style={{ color: 'var(--side-dim)' }}>Signed in as</div>
          <div className="font-semibold text-white mt-0.5">{user?.name}</div>
          <div className="mt-0.5 break-all" style={{ color: 'var(--side-dim)' }}>{user?.email}</div>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: '#f8f0dd', color: '#8a6415' }}>
              {role?.label}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.values(CAP_LABEL).map(c => (
              <span key={c} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#173b31', color: '#cfe0d9' }}>{c}</span>
            ))}
          </div>
          <button onClick={logout} className="mt-3 w-full text-xs py-1.5 rounded-lg border transition-colors hover:bg-white/5"
            style={{ background: 'transparent', color: 'var(--side-ink)', borderColor: '#1c3d33' }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="min-w-0">
        {/* Topbar */}
        <div className="flex items-center gap-3 px-7 py-3 bg-white border-b border-[#e3e7e4] sticky top-0 z-10">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: '#0f7a631a', color: '#0f7a63' }}>●</span>
            NBF <span className="font-normal text-[#66736e] ml-1 text-xs">🔒 your bank only</span>
          </div>
          <span className="ml-auto text-[11px] font-semibold tracking-wider px-3 py-1 rounded-full border" style={{ color: '#b8892b', background: '#f8f0dd', borderColor: '#ecd9a8' }}>
            DEMO · DUMMY DATA
          </span>
        </div>

        {/* Content */}
        <div className="px-7 py-6 max-w-[1200px]">
          {children}
        </div>
      </main>

      <Toasts toasts={toasts} />
    </div>
  );
}
