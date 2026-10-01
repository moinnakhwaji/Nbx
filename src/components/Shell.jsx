import { NavLink } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Toasts } from './ui';
import { ROLES, CAP_LABEL } from '../data';

const NAV = [
  { group: 'Your bank', items: [
    { to: '/',               label: 'Home' },
    { to: '/users',          label: 'Users' },
    { to: '/approvals',      label: 'Approvals', badge: s => s.approvals.filter(a => a.status === 'pending').length },
    { to: '/team',           label: 'Team' },
  ]},
  { group: 'Setup', items: [
    { to: '/features',        label: 'Features' },
    { to: '/sessions-policy', label: 'Session policy' },
    { to: '/payments',        label: 'Payment security' },
    { to: '/integrations',    label: 'Integrations' },
    { to: '/clients',         label: 'API clients & keys' },
  ]},
  { group: 'Commercial', items: [
    { to: '/commission', label: 'Commission & fees' },
    { to: '/limits',     label: 'Order limits' },
  ]},
  { group: 'Activity', items: [
    { to: '/orders',   label: 'Orders' },
    { to: '/payops',   label: 'Payment operations', badge: s => s.payops.filter(p => p.status === 'abandoned').length },
    { to: '/sessions', label: 'Customer sessions' },
    { to: '/webhooks', label: 'Webhooks' },
    { to: '/audit',    label: 'Audit log' },
    { to: '/usage',    label: 'Usage' },
  ]},
  { group: 'You', items: [
    { to: '/account', label: 'My account' },
  ]},
];

/* Logo mark — reused in sidebar and login */
export function LogoMark({ size = 26 }) {
  return (
    <i style={{
      width: size, height: size, borderRadius: 9,
      background: 'linear-gradient(135deg, #27a383, #0f7a63)',
      display: 'inline-grid', placeItems: 'center',
      color: '#fff', fontStyle: 'normal', fontSize: size * 0.44, flexShrink: 0,
    }}>NBF</i>
  );
}

export default function Shell({ children }) {
  const { user, logout, toasts } = useStore();
  const store = useStore.getState();
  const role = ROLES[user?.role];

  return (
    <div className="grid min-h-screen" style={{ gridTemplateColumns: '250px 1fr' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="flex flex-col sticky top-0 h-screen overflow-y-auto px-3 py-[18px]"
        style={{ background: 'var(--side)', color: 'var(--side-ink)' }}>

        {/* Logo — aside .logo { padding:4px 8px 16px; font-size:16px; line-height:1.2; gap:10px } */}
        <div className="flex items-center gap-[10px] tracking-[.02em]"
          style={{ padding: '4px 8px 16px', color: '#fff', fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>
          <LogoMark size={26} />
          <div>
            NBF · Gold &amp; Silver
            {/* .logo small { font-size:11px; font-weight:500; letter-spacing:.18em; uppercase; color:var(--side-dim) } */}
            <br />
            <small style={{ fontSize: 11, fontWeight: 500, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--side-dim)' }}>
              Bank portal · by NUQI
            </small>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 mt-1">
          {NAV.map(({ group, items }) => (
            <div key={group}>
              <div className="text-[10.5px] uppercase tracking-[.14em] px-[10px] pt-[14px] pb-1"
                style={{ color: 'var(--side-dim)' }}>
                {group}
              </div>
              {items.map(({ to, label, badge }) => {
                const count = badge ? badge(store) : 0;
                return (
                  <NavLink key={to} to={to} end={to === '/'}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-[10px] py-[7px] rounded-lg text-[13.5px] no-underline mb-0.5 transition-colors
                       ${isActive
                          ? 'text-white font-medium shadow-[inset_2px_0_0_#e5c068] bg-[rgba(229,192,104,.14)]'
                          : 'hover:bg-white/5'}`
                    }
                    style={{ color: 'var(--side-ink)' }}
                  >
                    <span>{label}</span>
                    {count > 0 && (
                      <span className="pill bad" style={{ fontSize: 10, padding: '0 6px' }}>{count}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Who am I */}
        <div className="mt-auto border-t border-[#1c3d33] pt-[14px] pb-1 px-2 text-[12.5px]">
          <div style={{ color: 'var(--side-dim)' }}>Signed in as</div>
          <b className="text-white">{user?.name}</b>
          <div className="font-mono break-all mt-0.5" style={{ color: 'var(--side-dim)', fontSize: 12 }}>
            {user?.email}
          </div>
          <div className="mt-2">
            <span className="pill gold">{role?.label}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.values(CAP_LABEL).map(c => (
              <span key={c} className="text-[10.5px] px-[6px] py-px rounded"
                style={{ background: '#173b31', color: '#cfe0d9' }}>
                {c}
              </span>
            ))}
          </div>
          <button onClick={logout}
            className="w-full mt-3 text-[12.5px] py-[6px] rounded-lg border hover:bg-white/5 transition-colors"
            style={{ background: 'transparent', color: 'var(--side-ink)', borderColor: '#1c3d33' }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <main className="min-w-0">
        {/* Topbar */}
        <div className="flex items-center gap-[14px] px-7 py-3 bg-white border-b border-[var(--line)] sticky top-0 z-10">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <span className="pill" style={{ background: '#0f7a631a', color: '#0f7a63' }}>●</span>
            NBF
            <small className="font-normal text-[11.5px] text-[var(--dim)] ml-1">🔒 your bank only</small>
          </div>
          <span className="ml-auto text-[11px] font-semibold tracking-[.12em] px-[10px] py-1 rounded-full border"
            style={{ color: 'var(--gold)', background: 'var(--gold-soft)', borderColor: '#ecd9a8' }}>
            DEMO · DUMMY DATA
          </span>
        </div>

        {/* Content */}
        <div className="px-7 py-[26px] pb-[60px] max-w-[1200px]">
          {children}
        </div>
      </main>

      <Toasts toasts={toasts} />
    </div>
  );
}
