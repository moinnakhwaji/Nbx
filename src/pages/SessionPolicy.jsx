import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Panel, Note, Btn, Field, Select, Input, Checkbox, PageHeader } from '../components/ui';

export default function SessionPolicy() {
  const { cfg, submitChange, toast } = useStore();
  const p = cfg.sessions;
  const [max, setMax] = useState(String(p.maxPerUser));
  const [atLimit, setAtLimit] = useState(p.atLimit);
  const [idleMin, setIdleMin] = useState(p.idleMin);
  const [absoluteH, setAbsoluteH] = useState(p.absoluteH);
  const [selfSignOut, setSelfSignOut] = useState(p.selfSignOut);
  const [revokeOthers, setRevokeOthers] = useState(p.revokeOthers);

  function save() {
    const idle = +idleMin, abs = +absoluteH;
    if (!(idle >= 5 && idle <= 15) || !(abs >= 1 && abs <= 12)) {
      toast("❌ Outside NUQI's bounds: idle 5-15 min, absolute 1-12 h.");
      return;
    }
    const next = { maxPerUser: max === 'unlimited' ? 'unlimited' : +max, atLimit, idleMin: idle, absoluteH: abs, selfSignOut, revokeOthers };
    const diff = Object.keys(next).filter(k => String(next[k]) !== String(p[k])).map(k => ['sessions.' + k, String(p[k]), String(next[k])]);
    if (!diff.length) { toast('Nothing changed yet.'); return; }
    submitChange('Session policy for NBF', 'Session policy', diff, (set) => set(s => ({ cfg: { ...s.cfg, sessions: { ...s.cfg.sessions, ...next } } })));
  }

  return (
    <>
      <PageHeader title="Session policy" lede="How many devices a customer may use and how long a session lasts — within bounds NUQI enforces for every bank." />
      <Note tone="gold">⚡ <b>Bank super admin:</b> changes apply <b>immediately</b>, without a second NBF approver, and the bypass is recorded.</Note>
      <Note tone="info"><b>NUQI owns the mechanism</b> — device-bound keys, renewal, revocation, crash recovery. <b>NBF owns the policy</b> below, within NUQI's bounds.</Note>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Panel title="Devices per customer">
          <div className="grid gap-4">
            <Field label="Maximum sessions" hint="Bounds: 1 – 50, or unlimited.">
              <Select value={max} onChange={e => setMax(e.target.value)}>
                {['unlimited',1,2,3,5,10].map(v => <option key={v} value={String(v)}>{v}</option>)}
              </Select>
            </Field>
            <Field label="At the limit">
              <Select value={atLimit} onChange={e => setAtLimit(e.target.value)}>
                <option value="reject">Refuse the new sign-in</option>
                <option value="reject_with_list">Refuse and show the customer their devices</option>
                <option value="evict_lru">Sign out the least recently used device</option>
              </Select>
            </Field>
          </div>
        </Panel>

        <Panel title="Lifetimes" subtitle="Can only be tightened below NUQI's own">
          <div className="grid gap-4">
            <Field label="Idle timeout (minutes)" hint="5 – 15 · NUQI's maximum is 15">
              <Input type="number" value={idleMin} onChange={e => setIdleMin(e.target.value)} min={5} max={15} />
            </Field>
            <Field label="Absolute lifetime (hours)" hint="1 – 12">
              <Input type="number" value={absoluteH} onChange={e => setAbsoluteH(e.target.value)} min={1} max={12} />
            </Field>
          </div>
        </Panel>

        <Panel title="What customers can do from their own phone">
          <div className="grid gap-3">
            <Checkbox label="Sign out this device" checked={selfSignOut} onChange={e => setSelfSignOut(e.target.checked)} />
            <div className="flex items-center gap-2">
              <Checkbox label="Sign out their other devices" checked={revokeOthers} onChange={e => setRevokeOthers(e.target.checked)} />
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#fbf1dc', color: '#9a6400' }}>needs a recent login</span>
            </div>
          </div>
        </Panel>

        <Panel title="Never a bank setting">
          <p className="text-sm text-[#66736e]">Revocation by NBF or by NUQI always works. Session keys never leave the device. A session is refused the moment it is revoked.</p>
        </Panel>
      </div>

      <Btn variant="primary" onClick={save}>Apply now</Btn>
    </>
  );
}
