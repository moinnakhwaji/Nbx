import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Panel, Note, Btn, Field, Input, PageHeader } from '../components/ui';
import { aed } from '../data';

const numToDisplay = n => (n / 100).toLocaleString('en-US');
const displayToNum  = v => Math.round(parseFloat(String(v).replace(/,/g, '')) * 100);

export default function Limits() {
  const { cfg, submitChange, toast } = useStore();
  const l = cfg.limits;
  const [vals, setVals] = useState({ min: numToDisplay(l.min), max: numToDisplay(l.max), dailyBuy: numToDisplay(l.dailyBuy), dailySell: numToDisplay(l.dailySell) });
  const set = (k, v) => setVals(prev => ({ ...prev, [k]: v }));

  function save() {
    const next = { min: displayToNum(vals.min), max: displayToNum(vals.max), dailyBuy: displayToNum(vals.dailyBuy), dailySell: displayToNum(vals.dailySell) };
    if (Object.values(next).some(x => !(x > 0))) { toast('❌ Every limit must be a positive amount.'); return; }
    if (next.min >= next.max) { toast('❌ The smallest order must be below the largest.'); return; }
    const diff = Object.keys(next).filter(k => next[k] !== l[k]).map(k => ['limits.' + k, aed(l[k] / 100), aed(next[k] / 100)]);
    if (!diff.length) { toast('Nothing changed yet.'); return; }
    submitChange('Order limits for NBF', 'Order limits', diff, (set) => set(s => ({ cfg: { ...s.cfg, limits: next } })), { sensitive: true });
  }

  return (
    <>
      <PageHeader title="Order limits" lede="Per-order and daily limits, enforced inside the settlement transaction." />
      <Note tone="info">🛡️ <b>NUQI co-approval.</b> This affects customers' money or security, so after your approval it waits for NUQI before it applies.</Note>

      <Panel title="Limits" subtitle="AED · enforced inside the settlement transaction, whatever the app does"
        actions={<Btn variant="primary" size="sm" onClick={save}>Send to NUQI</Btn>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Smallest order" hint="Below this an order is refused.">
            <Input value={vals.min} onChange={e => set('min', e.target.value)} />
          </Field>
          <Field label="Largest order" hint="Per single order.">
            <Input value={vals.max} onChange={e => set('max', e.target.value)} />
          </Field>
          <Field label="Daily buys per customer" hint="Rolling 24 hours.">
            <Input value={vals.dailyBuy} onChange={e => set('dailyBuy', e.target.value)} />
          </Field>
          <Field label="Daily sells per customer" hint="Rolling 24 hours.">
            <Input value={vals.dailySell} onChange={e => set('dailySell', e.target.value)} />
          </Field>
        </div>
      </Panel>
    </>
  );
}
