import { useState } from 'react';
import { useStore } from '../store/useStore';
import { DEMO_USER, DEMO_MFA, PASSWORD } from '../data';
import { LogoMark } from '../components/Shell';

export default function Login() {
  const { pending, login, mfaConfirm, cancelMfa } = useStore();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [picked, setPicked]     = useState(false);

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
        <Card>
          <Logo />
          <h2 className="text-2xl font-bold mt-7 mb-1">Two-factor check</h2>
          <p className="text-[var(--dim)] mt-3.5 mb-0">
            Enter the 6-digit code from your authenticator app for <b>{pending.email}</b>.
          </p>
          <div className="flex gap-2" style={{ margin: '20px 0' }}>
            {DEMO_MFA.split('').map((d, i) => (
              <input key={i} maxLength={1} value={d} readOnly
                className="w-[46px] text-center text-[20px] font-[600] border border-[var(--line)] rounded-lg bg-white px-[10px] py-2" />
            ))}
          </div>
          <div className="note gold">Demo: the code is filled in for you.</div>
          <div className="flex items-center gap-[10px] ">
            <MfaBtn onClick={mfaConfirm}>Verify &amp; sign in</MfaBtn>
            <DefaultBtn onClick={cancelMfa}>Back</DefaultBtn>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid" style={{ gridTemplateColumns: '1.05fr 1fr' }}>
      <Brand />
      <Card>
        <Logo />
        <h2 className="text-[24px] font-bold mt-[28px] mb-[4px]">
          Sign in to NBF&apos;s gold &amp; silver portal
        </h2>
        <p className="text-[var(--dim)] m-0 text-sm">
          Demo. <b>Click the demo user</b> to fill in the credentials.
        </p>

        {/* Role card */}
        <button
          onClick={pickDemo}
          className={`text-left w-full rounded-[10px] px-[14px] py-3 border transition-colors mt-4 mb-[18px]
            ${picked ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--line)] bg-white hover:border-[var(--accent)]'}`}
        >
          <b className="block text-[14px]">Bank super admin</b>
          <span className="text-[12.5px] text-[var(--dim)]">{DEMO_USER.name} · every permission at NBF</span>
        </button>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <FieldInput label="Email" type="text" value={email} onChange={e => setEmail(e.target.value)}
            autoComplete="off" placeholder="you@nbf.bank.demo" />
          <FieldInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" />

          {error && <div className="note bad">{error}</div>}

          <PrimaryBtn type="submit" style={{ marginTop: 4 }}>Sign in</PrimaryBtn>
        </form>

        <p className="text-[12px] text-[var(--dim)] mt-[14px] mb-0">
          Demo password{' '}
          <code className="font-mono text-[12.5px]">{PASSWORD}</code>.
          {' '}A second factor is asked for, as in production. NBF staff only ever see NBF.
        </p>
      </Card>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────────────────── */

function Card({ children }) {
  return (
    <div className="flex flex-col justify-center px-16 py-[44px] max-w-[640px]">
      {children}
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-[10px] font-bold text-[20px] tracking-[.02em] text-[var(--ink)]">
      <LogoMark size={30} />
      NBF{' '}
      <small className="font-medium text-[11px] tracking-[.18em] uppercase text-[var(--side-dim)]">
        Bank portal
      </small>
    </div>
  );
}

function FieldInput({ label, ...inputProps }) {
  return (
    <label className="flex flex-col gap-[4px]">
      <span className="text-[11px] uppercase tracking-[.06em] text-[var(--dim)]">{label}</span>
      <input
        className="border border-[var(--line)] rounded-lg bg-white text-[var(--ink)] focus:border-[var(--accent)] px-[10px] py-2 w-full"
        {...inputProps}
      />
    </label>
  );
}

function PrimaryBtn({ children, type = 'button', onClick, style }) {
  return (
    <button type={type} onClick={onClick}
      className="w-full bg-[var(--accent)] text-white border border-[var(--accent)] rounded-lg py-[10px] font-medium hover:opacity-90 transition-opacity"
      style={style}>
      {children}
    </button>
  );
}

function MfaBtn({ children, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="bg-[var(--accent)] text-white border border-[var(--accent)] rounded-lg hover:opacity-90 transition-opacity"
      style={{ padding: '10px 22px' }}>
      {children}
    </button>
  );
}

function DefaultBtn({ children, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="border border-[var(--line)] bg-white text-[var(--ink)] rounded-lg px-[14px] py-[7px] hover:bg-gray-50 transition-colors">
      {children}
    </button>
  );
}

function Brand() {
  return (
    <div className="flex flex-col justify-between p-[56px] text-[#e8efec]"
      style={{ background: 'radial-gradient(1200px 600px at -10% -10%, #1b5a47 0%, var(--side) 58%)' }}>

      <div className="flex items-center gap-[10px] font-bold text-[20px] tracking-[.02em]">
        <LogoMark size={30} />
        NBF{' '}
        <small className="font-medium text-[11px] tracking-[.18em] uppercase" style={{ color: '#74908a' }}>
          Gold &amp; Silver · by NUQI
        </small>
      </div>

      <div>
        <h1 className="font-bold" style={{ fontSize: 34, lineHeight: 1.15, margin: '18px 0 12px', letterSpacing: '-0.01em' }}>
          NBF&apos;s gold and silver service.<br />Your team, your rules.
        </h1>
        <p style={{ color: '#a9c1b8', maxWidth: 460 }}>
          The bank portal for NBF: your customers and their holdings, payments, pricing,
          delivery charges and the audit trail — and nothing belonging to any other bank.
        </p>
        <div className="grid gap-[10px] mt-7">
          {[
            "Every customer's gold and silver holdings and devices",
            'Gold, silver and delivery pricing in one place',
            'NUQI co-approves anything touching money or security',
            'Full audit trail compliance can export',
          ].map(f => (
            <div key={f} className="flex gap-[10px] text-[13.5px]" style={{ color: '#c7d8d1' }}>
              <span style={{ color: '#e5c068' }}>◆</span>{f}
            </div>
          ))}
        </div>
      </div>

      <div className="text-[12px]" style={{ color: '#5f8076' }}>
        Demo build · dummy data · nothing leaves this page
      </div>
    </div>
  );
}
