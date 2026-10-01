import { useState } from 'react';
import { useStore } from '../store/useStore';
import { DEMO_USER, DEMO_MFA, PASSWORD } from '../data';
import { Note, Btn } from '../components/ui';

export default function Login() {
  const { user: _, pending, login, mfaConfirm, cancelMfa } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState(DEMO_MFA);
  const [error, setError] = useState('');
  const [picked, setPicked] = useState(false);

  function pickDemo() {
    setEmail(DEMO_USER.email);
    setPassword(DEMO_USER.password);
    setPicked(true);
    setError('');
  }

  function handleLogin(e) {
    e.preventDefault();
    if (email !== DEMO_USER.email || password !== DEMO_USER.password) {
      setError('Those credentials are not recognised. Click the demo user above to fill them in.');
      return;
    }
    login(DEMO_USER);
  }

  if (pending) {
    return (
      <div className="min-h-screen grid" style={{ gridTemplateColumns: '1.05fr 1fr' }}>
        <Brand />
        <div className="flex flex-col justify-center px-16 py-12 max-w-xl">
          <Logo />
          <h2 className="text-2xl font-bold mt-7 mb-1">Two-factor check</h2>
          <p className="text-sm text-[#66736e] mb-4">Enter the 6-digit code from your authenticator app for <b>{pending.email}</b>.</p>
          <div className="flex gap-2 mb-4">
            {mfaCode.split('').map((d, i) => (
              <input key={i} maxLength={1} value={d} readOnly className="w-12 h-14 text-center text-2xl font-bold border border-[#e3e7e4] rounded-lg bg-white" />
            ))}
          </div>
          <Note tone="gold">Demo: the code is pre-filled for you.</Note>
          <div className="flex gap-3 mt-2">
            <Btn variant="primary" onClick={mfaConfirm} className="px-6 py-2.5">Verify & sign in</Btn>
            <Btn onClick={cancelMfa}>Back</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid" style={{ gridTemplateColumns: '1.05fr 1fr' }}>
      <Brand />
      <div className="flex flex-col justify-center px-16 py-12 max-w-xl">
        <Logo />
        <h2 className="text-2xl font-bold mt-7 mb-0">Sign in to NBF's gold & silver portal</h2>
        <p className="text-sm text-[#66736e] mb-4 mt-1">Demo. <b>Click the demo user</b> to fill in the credentials.</p>

        <button
          onClick={pickDemo}
          className={`text-left border rounded-xl p-3 mb-5 w-full transition-colors ${picked ? 'border-[#0f7a63] bg-[#e3f3ee]' : 'border-[#e3e7e4] bg-white hover:border-[#0f7a63]'}`}
        >
          <div className="font-semibold text-sm">Bank super admin</div>
          <div className="text-xs text-[#66736e]">{DEMO_USER.name} · every permission at NBF</div>
        </button>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-[#66736e]">Email</span>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@nbf.bank.demo" autoComplete="off"
              className="border border-[#e3e7e4] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0f7a63]" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-[#66736e]">Password</span>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="border border-[#e3e7e4] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0f7a63]" />
          </label>
          {error && <Note tone="bad">{error}</Note>}
          <Btn type="submit" variant="primary" className="py-2.5 mt-1">Sign in</Btn>
        </form>
        <p className="text-xs text-[#66736e] mt-4">Demo password <code className="font-mono">{PASSWORD}</code>. A second factor is asked for, as in production.</p>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 h-8 rounded-lg grid place-items-center text-white text-xs font-bold" style={{ background: '#0f7a63' }}>NBF</span>
      <div>
        <div className="font-bold text-sm">NBF</div>
        <div className="text-[10px] uppercase tracking-widest text-[#66736e]">Bank portal</div>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex flex-col justify-between p-14 text-[#e8efec]" style={{ background: 'radial-gradient(1200px 600px at -10% -10%, #1b5a47 0%, #0c2a22 58%)' }}>
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg grid place-items-center text-white text-xs font-bold" style={{ background: '#0f7a63' }}>NBF</span>
        <div>
          <div className="font-bold text-base text-white">NBF</div>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: '#74908a' }}>Gold & Silver · by NUQI</div>
        </div>
      </div>
      <div>
        <h1 className="text-4xl font-bold leading-tight mt-4 mb-3">NBF's gold and silver service.<br />Your team, your rules.</h1>
        <p style={{ color: '#a9c1b8' }}>The bank portal for NBF: your customers and their holdings, payments, pricing, delivery charges and the audit trail — and nothing belonging to any other bank.</p>
        <div className="grid gap-3 mt-7">
          {['Every customer\'s gold and silver holdings and devices','Gold, silver and delivery pricing in one place','NUQI co-approves anything touching money or security','Full audit trail compliance can export'].map(f => (
            <div key={f} className="flex gap-3 text-sm" style={{ color: '#c7d8d1' }}>
              <span style={{ color: '#e5c068' }}>◆</span>{f}
            </div>
          ))}
        </div>
      </div>
      <div className="text-xs" style={{ color: '#5f8076' }}>Demo build · dummy data · nothing leaves this page</div>
    </div>
  );
}
