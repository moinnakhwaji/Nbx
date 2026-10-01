import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Panel, Pill, DataTable, MetalTag, PageHeader } from '../components/ui';
import { aed, fmtDate } from '../data';

const PAY_TONE = { completed: 'ok', reversed: 'info', declined: '', capture_pending: 'warn', payout_pending: 'warn', needs_attention: 'bad' };

export default function Orders() {
  const { orders, setSelectedCustomer } = useStore();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="Orders" lede="Every order, its settlement and where its money stands." />
      <Panel title="Orders" subtitle={`${orders.length} orders`} flush>
        <DataTable keyField="id" cols={['Order','Customer','Side','Metal','Grams','Price / g','Total','Order','Money','When']}
          rows={orders.map(o => ({
            id: o.id,
            cells: [
              <span className="font-mono text-xs">{o.id}</span>,
              <button className="font-mono text-xs text-[#0f7a63] hover:underline" onClick={() => { setSelectedCustomer(o.customer); navigate('/users'); }}>{o.customer}</button>,
              <Pill tone={o.side === 'buy' ? 'info' : 'gold'}>{o.side}</Pill>,
              <MetalTag metal={o.metal} />,
              o.grams,
              o.perGram.toFixed(2),
              <span className="whitespace-nowrap">{aed(o.total)}</span>,
              o.status === 'settled' ? <Pill tone="ok">settled</Pill> : <Pill>not settled</Pill>,
              <Pill tone={PAY_TONE[o.payment] ?? ''}>{o.payment?.replace(/_/g,' ')}</Pill>,
              <span className="whitespace-nowrap text-xs">{fmtDate(o.at)}</span>,
            ],
          }))} />
      </Panel>
    </>
  );
}
