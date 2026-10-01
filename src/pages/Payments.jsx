import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Panel, Note, Pill, Btn, DataTable, Radio, Checkbox, PageHeader } from '../components/ui';

const OPS = ['authorize','capture','void','refund','payout'];
const OP_LABEL = { authorize: 'Authorise', capture: 'Capture', void: 'Void', refund: 'Refund', payout: 'Payout' };
const OP_HINT = {
  authorize: 'Asked before anything is hedged, for every buy. No answer refuses the order and queues a reversal.',
  capture:   'Turns a settled order\'s hold into a debit. Retried until NBF confirms.',
  void:      'Releases a hold whose order failed — only once the order provably cannot settle.',
  refund:    'Returns money a direct debit took for an order that failed.',
  payout:    'Pays a sale\'s proceeds. Without it, sells are refused before any metal is sold.',
};

function needOf(model, op) {
  if (op === 'authorize') return 'required';
  if (op === 'payout') return 'optional';
  if (model === 'hold_capture') return op === 'refund' ? 'unused' : 'required';
  return op === 'refund' ? 'required' : 'unused';
}
function missingOps(p) {
  return p.enabled ? OPS.filter(op => needOf(p.model, op) === 'required' && !p.hooks[op]) : [];
}
const needPill = n => n === 'required' ? <Pill tone="warn">required</Pill> : n === 'optional' ? <Pill tone="info">optional</Pill> : <Pill>not used</Pill>;

export default function Payments() {
  const { cfg, submitChange, toast } = useStore();
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(cfg.payments)));
  const missing = missingOps(draft);

  function save() {
    const cur = cfg.payments;
    const diff = [];
    if (cur.enabled !== draft.enabled) diff.push(['payments.mode', cur.enabled ? 'bank' : 'platform', draft.enabled ? 'bank' : 'platform']);
    if (cur.model !== draft.model) diff.push(['payments.model', cur.model, draft.model]);
    OPS.forEach(op => cur.hooks[op] !== draft.hooks[op] && diff.push(['payments.' + op, cur.hooks[op] ? 'configured' : 'null', draft.hooks[op] ? 'configured' : 'null']));
    if (!diff.length) { toast('Nothing changed yet.'); return; }
    const snap = JSON.parse(JSON.stringify(draft));
    submitChange('Payment security for NBF', 'Payment security', diff, (set) => set(s => ({ cfg: { ...s.cfg, payments: snap } })), { sensitive: true });
    setDraft(snap);
  }

  return (
    <>
      <PageHeader title="Payment security" lede="Whether NBF moves its customers' money, what an authorisation does, and where each endpoint lives." />
      <Note tone="info">🛡️ <b>NUQI co-approval.</b> This affects customers' money or security, so after your approval it waits for NUQI before it applies.</Note>

      <Panel title="Bank payments" subtitle="Whether NBF moves its customers' money for each order">
        <Radio label="Off — platform payments" hint="NBF is not asked about any order."
          checked={!draft.enabled} onChange={() => setDraft(d => ({ ...d, enabled: false }))}>
          <Pill tone="ok" className="mt-1">platform default</Pill>
        </Radio>
        <Radio label="On — NBF authorises every buy before it is hedged" hint="Then captures or reverses it, and pays out every sale."
          checked={draft.enabled} onChange={() => setDraft(d => ({ ...d, enabled: true }))} />
        {draft.enabled && missing.length > 0 && (
          <Note tone="bad">{missing.map(op => `❌ Cannot enable bank payments. Missing: ${op.toUpperCase()}.`).join(' ')}</Note>
        )}
        {draft.enabled && missing.length === 0 && (
          <Note tone="ok">✓ Every payment NBF authorises can be completed and reversed.</Note>
        )}
      </Panel>

      <div className="grid grid-cols-2 gap-4">
        <Panel title="Payment model" subtitle="Decides how a failed trade is undone">
          <Radio label="Hold → Capture" hint="Hold at authorise, capture at settlement, void on failure."
            checked={draft.model === 'hold_capture'} onChange={() => setDraft(d => ({ ...d, model: 'hold_capture' }))}>
            <Pill tone="ok" className="mt-1">default · safer</Pill>
          </Radio>
          <Radio label="Direct debit" hint="Debit at authorise, refund on failure."
            checked={draft.model === 'direct_debit'} onChange={() => setDraft(d => ({ ...d, model: 'direct_debit' }))} />
        </Panel>

        <Panel title="Bank authentication" subtitle="How NUQI proves itself to NBF" flush>
          <DataTable keyField="0" cols={['Method','Status']}
            rows={[
              ['HMAC-SHA256 signature', <Pill tone="ok">available · in use</Pill>],
              ['OAuth 2.0 client credentials', <Pill tone="warn">buildable</Pill>],
              ['Mutual TLS (mTLS)', <Pill tone="warn">buildable</Pill>],
              ['JWT from NBF\'s app', <Pill>separate integration</Pill>],
            ].map((r, i) => ({ 0: i, cells: r }))} />
        </Panel>
      </div>

      <Panel title="Payment operations" subtitle="One signed endpoint per operation at NBF">
        {OPS.map(op => {
          const n = needOf(draft.model, op);
          const miss = draft.enabled && n === 'required' && !draft.hooks[op];
          return (
            <div key={op} className={`border rounded-lg p-3 mb-3 ${miss ? 'border-[#e9b8b4] bg-[#fffafa]' : 'border-[#e3e7e4]'}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <b className="text-sm">{OP_LABEL[op]}</b>
                {needPill(n)}
                <span className="flex-1" />
                <Checkbox label="configured" checked={!!draft.hooks[op]}
                  onChange={e => setDraft(d => ({ ...d, hooks: { ...d.hooks, [op]: e.target.checked } }))} />
              </div>
              <div className="text-xs text-[#66736e] mt-1">{OP_HINT[op]}</div>
              {draft.hooks[op] && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <input readOnly value={`https://pay.nbf.bank.example/${op}`} className="font-mono text-xs border border-[#e3e7e4] rounded-lg px-3 py-1.5 bg-white" />
                  <input readOnly value="3000 ms" className="text-xs border border-[#e3e7e4] rounded-lg px-3 py-1.5 bg-white" />
                  <input readOnly value={`kms-nbf-${op.slice(0,3)}•••••`} className="font-mono text-xs border border-[#e3e7e4] rounded-lg px-3 py-1.5 bg-[#f3f5f4]" />
                </div>
              )}
            </div>
          );
        })}
      </Panel>

      <div className="flex items-center gap-3">
        {missing.length > 0
          ? <><Btn variant="primary" disabled>Send to NUQI</Btn><span className="text-sm text-[#66736e]">Blocked: {missing.map(m => m.toUpperCase()).join(', ')} missing.</span></>
          : <Btn variant="primary" onClick={save}>Send to NUQI</Btn>}
      </div>
    </>
  );
}
