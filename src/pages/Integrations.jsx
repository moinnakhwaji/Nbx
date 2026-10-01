import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Panel, Note, Btn, Field, Select, PageHeader } from '../components/ui';

const INT_CONFIG = [
  { key: 'auth',  label: 'Auth re-check',    subtitle: 'Before a session is created',  hint: 'NBF confirms the customer may still hold a session.', extra: <Note tone="ok">Fail-closed: an unreachable NBF verifier refuses the session.</Note> },
  { key: 'kyc',   label: 'Know-your-customer',subtitle: 'NBF\'s own journey',           hint: 'Scopes are withheld until NBF says KYC passed.' },
  { key: 'rates', label: 'Rate feed',         subtitle: 'Where prices come from',       hint: 'NBF may price from its own feed; it never silently falls back to NUQI\'s.' },
  { key: 'trade', label: 'Trading venue',     subtitle: 'Who takes the other side',     hint: 'NBF may clear with its own bullion desk.' },
];

export default function Integrations() {
  const { cfg, submitChange, toast } = useStore();
  const [vals, setVals] = useState({ ...cfg.integrations });

  function save() {
    const diff = Object.keys(vals).filter(k => vals[k] !== cfg.integrations[k]).map(k => ['integrations.' + k + '.mode', cfg.integrations[k], vals[k]]);
    if (!diff.length) { toast('Nothing changed yet.'); return; }
    const snap = { ...vals };
    submitChange('Integrations for NBF', 'Integrations', diff, (set) => set(s => ({ cfg: { ...s.cfg, integrations: snap } })), { sensitive: true });
  }

  return (
    <>
      <PageHeader title="Integrations" lede="NBF's own auth check, KYC journey, rate feed and trading venue." />
      <Note tone="info">🛡️ <b>NUQI co-approval.</b> This affects customers' money or security, so after your approval it waits for NUQI before it applies.</Note>

      <div className="grid grid-cols-2 gap-4">
        {INT_CONFIG.map(({ key, label, subtitle, hint, extra }) => (
          <Panel key={key} title={label} subtitle={subtitle}>
            <Field label="Mode" hint={hint}>
              <Select value={vals[key]} onChange={e => setVals(v => ({ ...v, [key]: e.target.value }))}>
                <option value="platform">platform — NUQI's</option>
                <option value="tenant">NBF's own</option>
              </Select>
            </Field>
            {extra && <div className="mt-3">{extra}</div>}
          </Panel>
        ))}
      </div>

      <Note tone="info">Payments are on the <a href="/payments" className="text-[#0f7a63] underline">Payment security</a> page.</Note>
      <Btn variant="primary" onClick={save}>Send to NUQI</Btn>
    </>
  );
}
