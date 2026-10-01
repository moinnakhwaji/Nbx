import { useStore } from '../store/useStore';
import { Panel, Stat, Note, Pill, Btn, DataTable, PageHeader } from '../components/ui';

const TONE = { succeeded: 'ok', pending: 'warn', abandoned: 'bad', reversed: 'info', declined: '' };

export default function PayOps() {
  const { payops, resolvePayOp } = useStore();
  const abandoned = payops.filter(p => p.status === 'abandoned');

  return (
    <>
      <PageHeader title="Payment operations" lede="Every call NUQI made to NBF's payment system, and anything that needs a person." />

      {abandoned.length > 0 && (
        <Note tone="bad">⚠️ <b>{abandoned.length} payment operation needs a person.</b> NBF rejected a capture; nothing will retry it automatically.</Note>
      )}

      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          ['Succeeded', payops.filter(p => p.status === 'succeeded').length, 'ok'],
          ['Retrying',  payops.filter(p => p.status === 'pending').length,   'warn'],
          ['Needs attention', abandoned.length,                               'bad'],
          ['Declined',  payops.filter(p => p.status === 'declined').length,  ''],
        ].map(([label, value, tone]) => (
          <Stat key={label} label={label} value={value} valueStyle={tone ? { color: `var(--${tone})` } : {}} />
        ))}
      </div>

      <Panel title="Calls to NBF" subtitle="Each is recorded before NBF is asked, and retried under the same idempotency key" flush>
        <DataTable keyField="id" cols={['Order','Operation','Status','Attempts','NBF ref','Detail','']}
          rows={payops.map((p, i) => ({
            id: p.order + p.kind + i,
            cells: [
              <span className="font-mono text-xs">{p.order}</span>,
              p.kind,
              <Pill tone={TONE[p.status] ?? ''}>{p.status === 'pending' ? `retrying ${p.next ?? ''}` : p.status === 'abandoned' ? 'needs attention' : p.status}</Pill>,
              p.attempts,
              <span className="font-mono text-xs">{p.ref}</span>,
              <span className="text-xs text-[#66736e]">{p.err ?? ''}</span>,
              p.status === 'abandoned' ? <Btn size="sm" onClick={() => resolvePayOp(p.order)}>Mark resolved</Btn> : null,
            ],
          }))} />
      </Panel>
    </>
  );
}
