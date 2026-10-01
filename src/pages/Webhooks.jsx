import { useStore } from '../store/useStore';
import { Panel, Pill, Btn, DataTable, PageHeader } from '../components/ui';
import { ago } from '../data';

export default function Webhooks() {
  const { webhooks, replayWebhook } = useStore();

  return (
    <>
      <PageHeader title="Webhooks" lede="Signed notifications NUQI sends to NBF, and their delivery." />
      <Panel title="Deliveries" subtitle="order.settled events, HMAC-signed" flush>
        <DataTable keyField="id" cols={['Event','Type','Order','Status','Attempts','When','']}
          rows={webhooks.map(w => ({
            id: w.id,
            cells: [
              <span className="font-mono text-xs">{w.id}</span>,
              <span className="font-mono text-xs">{w.type}</span>,
              <span className="font-mono text-xs">{w.order}</span>,
              w.status === 'delivered' ? <Pill tone="ok">delivered</Pill> : w.status === 'retrying' ? <Pill tone="warn">retrying</Pill> : <Pill tone="bad">failed</Pill>,
              w.attempts,
              <span className="text-xs whitespace-nowrap">{ago(w.at)}</span>,
              w.status === 'failed' ? <Btn size="sm" onClick={() => replayWebhook(w.id)}>Replay</Btn> : null,
            ],
          }))} />
      </Panel>
    </>
  );
}
