import { create } from 'zustand';
import { CUSTOMERS_INIT, SESSIONS_INIT, ORDERS_INIT, PAYOPS_INIT, WEBHOOKS_INIT, TEAM_INIT, CFG_INIT, AUDIT_INIT, APPROVALS_INIT, ROLES } from '../data';

let seq = 102;

export const useStore = create((set, get) => ({
  user: null,
  pending: null,
  customers: [...CUSTOMERS_INIT],
  sessions: [...SESSIONS_INIT],
  orders: [...ORDERS_INIT],
  payops: [...PAYOPS_INIT],
  webhooks: [...WEBHOOKS_INIT],
  team: [...TEAM_INIT],
  approvals: [...APPROVALS_INIT],
  audit: [...AUDIT_INIT],
  cfg: JSON.parse(JSON.stringify(CFG_INIT)),
  toasts: [],
  selectedCustomer: null,

  // Auth
  login: (user) => set({ pending: user }),
  cancelMfa: () => set({ pending: null }),
  mfaConfirm: () => {
    const { pending } = get();
    get()._audit('user.login', pending.email, 'Signed in with password + two-factor');
    set({ user: pending, pending: null });
    get().toast(`Welcome, <b>${pending.name}</b> — signed in as Bank super admin at NBF.`);
  },
  logout: () => {
    get()._audit('user.logout', get().user?.email, 'Signed out');
    set({ user: null, pending: null });
  },

  // Internal audit helper
  _audit: (action, target, detail) => {
    const { user } = get();
    set(s => ({
      audit: [{ at: Date.now(), actor: user?.email ?? 'system', role: user ? ROLES[user.role]?.label ?? '' : 'system', side: 'bank', action, target, detail }, ...s.audit],
    }));
  },

  toast: (msg) => {
    const id = Date.now() + Math.random();
    set(s => ({ toasts: [...s.toasts, { id, msg }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4200);
  },

  setSelectedCustomer: (ref) => set({ selectedCustomer: ref }),

  // Customer actions
  blockCustomer: (ref) => {
    set(s => ({ customers: s.customers.map(c => c.ref === ref ? { ...c, status: 'blocked', kyc: 'review' } : c) }));
    get()._audit('customer.block', ref, 'Trading blocked; holdings kept safe');
    get().toast(`Trading blocked for ${ref}.`);
  },
  unblockCustomer: (ref) => {
    set(s => ({ customers: s.customers.map(c => c.ref === ref ? { ...c, status: 'active', kyc: 'passed' } : c) }));
    get()._audit('customer.unblock', ref, 'Trading unblocked');
    get().toast(`Trading unblocked for ${ref}.`);
  },

  // Session actions
  revokeSession: (sessionId) => {
    const sess = get().sessions.find(s => s.id === sessionId);
    set(s => ({ sessions: s.sessions.map(x => x.id === sessionId ? { ...x, live: false, revoked: true } : x) }));
    get()._audit('session.revoke', sess?.customer, `${sessionId} (${sess?.device}) ended`);
    get().toast('Session ended.');
  },
  revokeAllSessions: (ref) => {
    let n = 0;
    set(s => ({ sessions: s.sessions.map(x => x.customer === ref && x.live ? (n++, { ...x, live: false, revoked: true }) : x) }));
    get()._audit('session.revoke_all', ref, `${n} sessions ended`);
    get().toast(`${n} session(s) ended for ${ref}.`);
  },

  // Team actions
  inviteTeamMember: (email, role) => {
    set(s => ({ team: [...s.team, { role, name: email.split('@')[0], email, mfaOn: false, lastSeen: 0, status: 'invited' }] }));
    get()._audit('team.invite', 'NBF', `Invited ${email} as ${ROLES[role]?.label}`);
    get().toast(`Invitation sent to ${email}.`);
  },
  disableTeamMember: (email) => {
    set(s => ({ team: s.team.map(m => m.email === email ? { ...m, status: 'disabled' } : m) }));
    get()._audit('team.disable', 'NBF', `Disabled ${email}`);
    get().toast(`${email} disabled.`);
  },

  // Change management
  submitChange: (title, area, diff, applyFn, { sensitive = false } = {}) => {
    if (!sensitive) {
      applyFn(set);
      get()._audit('config.apply.bypass', 'NBF', `${title} — applied without second NBF approver`);
      get().toast(`⚡ Applied immediately: ${title}`);
    } else {
      const id = 'apr_' + seq++;
      const { user } = get();
      set(s => ({ approvals: [{ id, title, area, by: user.email, at: Date.now(), expires: Date.now() + 48*3600e3, status: 'pending', stages: ['bank','nuqi'], stage: 1, approvedBy: [user.email], bypassed: true, diff, applyFn }, ...s.approvals] }));
      get()._audit('config.propose', 'NBF', `${title} — NBF approval bypassed; waiting for NUQI`);
      get().toast(`📝 Sent to NUQI for co-approval: ${title}`);
    }
  },
  approveChange: (id) => {
    const ap = get().approvals.find(a => a.id === id);
    if (!ap) return;
    const isLast = ap.stage === ap.stages.length - 1;
    const email = get().user?.email;
    if (isLast) {
      ap.applyFn?.(set);
      set(s => ({ approvals: s.approvals.map(a => a.id === id ? { ...a, status: 'approved', approvedBy: [...a.approvedBy, email] } : a) }));
      get()._audit('config.approve', 'NBF', `${ap.title} — applied`);
      get().toast(`✅ Approved and applied: ${ap.title}`);
    } else {
      set(s => ({ approvals: s.approvals.map(a => a.id === id ? { ...a, stage: a.stage + 1, approvedBy: [...a.approvedBy, email] } : a) }));
      get()._audit('config.approve.stage', 'NBF', `${ap.title} — approved at NBF, sent to NUQI`);
      get().toast(`✅ Approved for NBF. Now waiting for NUQI.`);
    }
  },
  rejectChange: (id) => {
    const ap = get().approvals.find(a => a.id === id);
    set(s => ({ approvals: s.approvals.map(a => a.id === id ? { ...a, status: 'rejected' } : a) }));
    get()._audit('config.reject', 'NBF', ap?.title);
    get().toast(`Rejected: ${ap?.title}`);
  },
  nuqiApprove: (id) => {
    const ap = get().approvals.find(a => a.id === id);
    if (!ap) return;
    ap.applyFn?.(set);
    set(s => ({
      approvals: s.approvals.map(a => a.id === id ? { ...a, status: 'approved', stage: a.stages.length } : a),
      audit: [{ at: Date.now(), actor: 'NUQI staff', role: 'NUQI', side: 'nuqi', action: 'config.approve', target: 'NBF', detail: `${ap.title} — co-approved by NUQI and applied` }, ...s.audit],
    }));
    get().toast(`✅ NUQI approved — applied: ${ap.title}`);
  },

  // Payment ops
  resolvePayOp: (orderId) => {
    set(s => ({
      payops: s.payops.map(p => p.order === orderId && p.status === 'abandoned' ? { ...p, status: 'succeeded', ref: 'MANUAL', err: `resolved manually` } : p),
      orders: s.orders.map(o => o.id === orderId ? { ...o, payment: 'completed' } : o),
    }));
    get()._audit('payment.resolve', orderId, 'Capture confirmed and marked resolved');
    get().toast('Marked resolved.');
  },

  replayWebhook: (id) => {
    set(s => ({ webhooks: s.webhooks.map(w => w.id === id ? { ...w, status: 'delivered', attempts: w.attempts + 1 } : w) }));
    get()._audit('webhook.replay', 'NBF', `${id} replayed and delivered`);
    get().toast('Replayed and delivered.');
  },

  rotateKey: (idx) => {
    const cl = get().cfg.clients[idx];
    const newKey = 'ck_…' + Math.floor(1000 + Math.random() * 8999);
    set(s => ({ cfg: { ...s.cfg, clients: s.cfg.clients.map((c, i) => i === idx ? { ...c, key: newKey, rotated: Date.now() } : c) } }));
    get()._audit('client.key.rotate', 'NBF', `${cl.id} — new key issued, old key valid 24 h`);
    return newKey;
  },
}));
