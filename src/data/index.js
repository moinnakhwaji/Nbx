export const BANK = { name: 'NBF', long: 'NBF · Gold & Silver', plan: 'Enterprise', since: Date.now() - 53 * 864e5 };

export const ROLES = {
  bank_super:      { label: 'Bank super admin',   bypass: true, caps: ['view','configure','keys','act','approve','team','audit'], summary: 'Every permission at NBF. Changes apply immediately, bypass is recorded.' },
  bank_admin:      { label: 'Bank administrator', caps: ['view','configure','keys','act','approve','team','audit'], summary: 'Settings, API keys and the team. Approves colleagues\' changes, never their own.' },
  bank_ops:        { label: 'Operations',         caps: ['view','configure','act'], summary: 'Handles customers day to day and proposes changes.' },
  bank_compliance: { label: 'Compliance',         caps: ['view','approve','audit'], summary: 'Reads everything, approves or rejects, exports the audit trail.' },
  bank_viewer:     { label: 'Viewer',             caps: ['view'], summary: 'Read-only.' },
};

export const CAP_LABEL = { view: 'view', configure: 'configure', keys: 'API keys', act: 'act on customers', approve: 'approve', team: 'manage team', audit: 'export audit' };

export const DEMO_USER = { role: 'bank_super', name: 'Khalid Al Nuaimi', email: 'super.admin@nbf.bank.demo', password: 'Demo#2026', mfa: true };
export const DEMO_MFA = '246810';
export const PASSWORD = 'Demo#2026';

export const RATES = {
  gold:   { buy: 541.37, sell: 490.12, vendorAsk: 536.0118, vendorBid: 494.7265 },
  silver: { buy: 6.52,   sell: 5.84,   vendorAsk: 6.3981,   vendorBid: 5.9123 },
};

const now = Date.now(), H = 3600e3, D = 24 * H;

export const CUSTOMERS_INIT = [
  ['NBF-CUST-100231', 42.5, 1250, 509.2, 5.71, 'active', 210],
  ['NBF-CUST-100874', 10, 0, 531.1, 0, 'active', 92],
  ['NBF-CUST-101102', 125.25, 5200, 488.4, 5.2, 'active', 400],
  ['NBF-CUST-101433', 3.75, 150, 538.9, 6.1, 'active', 31],
  ['NBF-CUST-101650', 0, 820, 0, 5.96, 'active', 70],
  ['NBF-CUST-102017', 250, 0, 472.6, 0, 'active', 520],
  ['NBF-CUST-102288', 18.4, 300, 520.3, 5.88, 'active', 150],
  ['NBF-CUST-102519', 1.25, 0, 540.2, 0, 'dormant', 12],
  ['NBF-CUST-102906', 64, 2000, 501.7, 5.5, 'active', 260],
  ['NBF-CUST-103144', 7.5, 90, 533.6, 6.2, 'active', 40],
  ['NBF-CUST-103377', 0, 0, 0, 0, 'active', 3],
  ['NBF-CUST-103802', 33, 640, 515.8, 5.77, 'blocked', 120],
].map(([ref, gold, silver, avgGold, avgSilver, status, d], i) => ({
  ref, gold, silver, avgGold, avgSilver, status,
  joined: now - d * D,
  lastActive: now - (i * 5 + 1) * H,
  kyc: status === 'blocked' ? 'review' : 'passed',
}));

const SURFACES = [['iOS', 'secure_enclave'], ['Android', 'strongbox'], ['Huawei', 'huks'], ['Android', 'tee'], ['Web', null]];
export const SESSIONS_INIT = CUSTOMERS_INIT.flatMap((c, i) => {
  const n = c.status === 'dormant' ? 1 : [2,1,3,1,1,2,1,1,2,1,1,1][i];
  return Array.from({ length: n }, (_, k) => {
    const [surface, key] = SURFACES[(i + k) % SURFACES.length];
    const live = c.status === 'active' && k < 2 && (i + k) % 4 !== 3;
    return {
      id: 'sess_' + (9100 + i * 3 + k),
      customer: c.ref, surface, key, live,
      revoked: c.status === 'blocked' && k === 0,
      device: { iOS: 'iPhone 15 Pro', Android: 'Galaxy S24', Huawei: 'Mate 60 Pro', Web: 'Chrome · Windows' }[surface],
      seen: now - (i * 11 + k * 37 + 2) * 60e3,
      created: now - (i + k + 1) * 3 * H,
    };
  });
});

function buildOrdersAndPayops() {
  const orders = [], payops = [];
  const states = ['completed','completed','completed','completed','completed','capture_pending','completed','reversed','completed','declined','completed','payout_pending','completed','needs_attention','completed','completed'];
  for (let k = 0; k < 16; k++) {
    const side = k % 4 === 3 ? 'sell' : 'buy';
    const metal = k % 5 === 4 ? 'silver' : 'gold';
    const g = metal === 'silver' ? [100,250,50][k%3] : [1,2.5,5,10,0.5,20,3,1.25][k%8];
    const perGram = RATES[metal][side];
    const state = states[k];
    const settled = !['reversed','declined'].includes(state);
    const id = 'o_' + (7300+k).toString(36).toUpperCase() + 'Q' + k;
    orders.push({ id, customer: CUSTOMERS_INIT[k % CUSTOMERS_INIT.length].ref, side, metal, grams: g, perGram, total: g * perGram, status: settled ? 'settled' : 'not settled', payment: side === 'sell' && state === 'completed' ? 'completed' : state, at: now - k * 5.3 * H });
    if (side === 'buy') {
      payops.push({ order: id, kind: 'authorize', status: state === 'declined' ? 'declined' : state === 'reversed' ? 'reversed' : 'succeeded', attempts: 1, ref: state === 'declined' ? '—' : 'H'+id.slice(2,7) });
      if (state === 'completed')        payops.push({ order: id, kind: 'capture', status: 'succeeded',  attempts: 1, ref: 'C'+id.slice(2,7) });
      if (state === 'capture_pending')  payops.push({ order: id, kind: 'capture', status: 'pending',    attempts: 2, ref: '—', next: 'in 1 min', err: 'bank answered 503' });
      if (state === 'needs_attention')  payops.push({ order: id, kind: 'capture', status: 'abandoned',  attempts: 1, ref: '—', err: 'bank rejected: hold expired' });
      if (state === 'reversed')         payops.push({ order: id, kind: 'void',    status: 'succeeded',  attempts: 1, ref: 'V'+id.slice(2,7) });
    } else {
      payops.push({ order: id, kind: 'payout', status: state === 'completed' ? 'succeeded' : 'pending', attempts: state === 'completed' ? 1 : 3, ref: state === 'completed' ? 'P'+id.slice(2,7) : '—', next: state === 'completed' ? null : 'in 4 min', err: state === 'completed' ? null : 'timeout after 5000ms' });
    }
  }
  return { orders, payops };
}

export const { orders: ORDERS_INIT, payops: PAYOPS_INIT } = buildOrdersAndPayops();
export const WEBHOOKS_INIT = ORDERS_INIT.slice(0, 9).map((o, i) => ({
  id: 'evt_' + (5500 + i), type: 'order.settled', order: o.id,
  status: i === 3 ? 'failed' : i === 6 ? 'retrying' : 'delivered',
  attempts: i === 3 ? 12 : i === 6 ? 3 : 1, at: o.at + 5e3,
}));

export const TEAM_INIT = [
  { role: 'bank_super', name: 'Khalid Al Nuaimi', email: 'super.admin@nbf.bank.demo', mfaOn: true, lastSeen: now, status: 'active' },
  { role: 'bank_admin', name: 'Hamad Al Shamsi', email: 'admin@nbf.bank.demo', mfaOn: true, lastSeen: now - 3*H, status: 'active' },
  { role: 'bank_ops', name: 'Fatima Zahra', email: 'ops@nbf.bank.demo', mfaOn: true, lastSeen: now - 40*60e3, status: 'active' },
  { role: 'bank_compliance', name: 'Rashid Kareem', email: 'compliance@nbf.bank.demo', mfaOn: true, lastSeen: now - 26*H, status: 'active' },
  { role: 'bank_viewer', name: 'Noor Hassan', email: 'viewer@nbf.bank.demo', mfaOn: false, lastSeen: now - 4*D, status: 'active' },
  { role: 'bank_ops', name: 'Samir Aziz', email: 'samir.aziz@nbf.bank.demo', mfaOn: false, lastSeen: 0, status: 'invited' },
];

export const CFG_INIT = {
  metals: ['gold','silver'], currencies: ['AED'],
  features: { trade: true, sell: true, alerts: true, mart: true, gifting: true, sessionList: true, delivery: true, history: true },
  limits: { min: 10000, max: 50000000, dailyBuy: 100000000, dailySell: 100000000 },
  commission: {
    gold:   { bankBuy: 75,  bankSell: 75,  nuqiBuy: 25, nuqiSell: 25, feeType: 'flat', feeFlat: 500, feePct: 0 },
    silver: { bankBuy: 120, bankSell: 120, nuqiBuy: 40, nuqiSell: 40, feeType: 'flat', feeFlat: 200, feePct: 0 },
  },
  delivery: { vatPct: 5, mintingPerGram: 1500, transactionFee: 2500, deliveryCharge: 5000 },
  sessions: { maxPerUser: 3, atLimit: 'reject', idleMin: 15, absoluteH: 12, selfSignOut: true, revokeOthers: true },
  payments: { enabled: true, model: 'hold_capture', hooks: { authorize: true, capture: true, void: true, refund: false, payout: true } },
  integrations: { auth: 'tenant', kyc: 'tenant', rates: 'platform', trade: 'platform' },
  clients: [
    { id: 'cl_nbf_backend', kind: 'Server (NBF backend)', scopes: ['sessions:create','gold:price','gold:trade','users:read'], key: 'ck_…4312', rotated: now - 30*D },
    { id: 'cl_nbf_mobile',  kind: 'Mobile SDK (iOS · Android · Huawei)', scopes: ['gold:price','gold:trade','portfolio:read','sessions:list'], key: 'ck_…8801', rotated: now - 12*D },
    { id: 'cl_nbf_widget',  kind: 'Web widget', scopes: ['gold:price','portfolio:read'], key: 'ck_…1170', rotated: now - 60*D },
  ],
};

const roleOf = (email) => TEAM_INIT.find(m => m.email === email)?.role;
export const AUDIT_INIT = [
  { action: 'config.propose',          target: 'NBF',              detail: 'Session policy: max 3 devices per customer',                       actor: 'ops@nbf.bank.demo',        t: 30*H, side: 'bank' },
  { action: 'config.approve',          target: 'NBF',              detail: 'Applied version 7 (session policy)',                               actor: 'compliance@nbf.bank.demo', t: 29*H, side: 'bank' },
  { action: 'client.key.rotate',       target: 'NBF',              detail: 'cl_nbf_mobile — new key issued, old key valid 24 h',               actor: 'admin@nbf.bank.demo',      t: 50*H, side: 'bank' },
  { action: 'session.revoke_all',      target: 'NBF-CUST-102288',  detail: 'Customer reported a lost phone — 3 sessions ended',               actor: 'ops@nbf.bank.demo',        t: 3*H,  side: 'bank' },
  { action: 'customer.block',          target: 'NBF-CUST-103802',  detail: 'Trading blocked pending KYC review',                               actor: 'compliance@nbf.bank.demo', t: 20*H, side: 'bank' },
  { action: 'payment.capture.rejected',target: ORDERS_INIT[13]?.id,detail: 'Bank rejected capture: hold expired — needs a person',            actor: 'payments-worker',           t: 70*H, side: 'system' },
  { action: 'config.approve',          target: 'NBF',              detail: 'Physical delivery charges updated',                                actor: 'NUQI staff',               t: 5*D,  side: 'nuqi' },
  { action: 'team.invite',             target: 'NBF',              detail: 'Invited samir.aziz@nbf.bank.demo as Operations',                   actor: 'admin@nbf.bank.demo',      t: 3*D,  side: 'bank' },
].map(({ action, target, detail, actor, t, side }) => ({
  at: now - t, actor,
  role: side === 'nuqi' ? 'NUQI' : side === 'system' ? 'system' : ROLES[roleOf(actor)]?.label ?? 'Operations',
  side, action, target, detail,
})).sort((a, b) => b.at - a.at);

export const APPROVALS_INIT = [
  {
    id: 'apr_100', title: 'Raise daily buy limit to 2,000,000 AED', area: 'Order limits',
    by: 'ops@nbf.bank.demo', at: now - 26*H, expires: now + 22*H, status: 'pending',
    stages: ['bank','nuqi'], stage: 1, approvedBy: ['compliance@nbf.bank.demo'],
    diff: [['limits.dailyBuy', '1,000,000.00 AED', '2,000,000.00 AED']],
    applyFn: (set) => set(s => ({ cfg: { ...s.cfg, limits: { ...s.cfg.limits, dailyBuy: 200000000 } } })),
  },
  {
    id: 'apr_101', title: 'Idle timeout 10 minutes', area: 'Session policy',
    by: 'ops@nbf.bank.demo', at: now - 3*H, expires: now + 45*H, status: 'pending',
    stages: ['bank'], stage: 0, approvedBy: [],
    diff: [['sessions.idleMin', '15', '10']],
    applyFn: (set) => set(s => ({ cfg: { ...s.cfg, sessions: { ...s.cfg.sessions, idleMin: 10 } } })),
  },
];

// Formatters
export const ago = (t) => {
  if (!t) return '—';
  const s = (Date.now() - t) / 1000;
  if (s < 90) return 'just now';
  if (s < 5400) return Math.round(s / 60) + ' min ago';
  if (s < 129600) return Math.round(s / 3600) + ' h ago';
  return Math.round(s / 86400) + ' d ago';
};
export const fmtDate = (t) => new Date(t).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
export const fmtDay  = (t) => new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
export const aed     = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' AED';
export const grams   = (g) => Number(g).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' g';
export const bpPct   = (bp) => (bp / 100).toFixed(2);
export const fils    = (n) => (n / 100).toFixed(2);
