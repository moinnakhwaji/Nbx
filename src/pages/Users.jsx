import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Panel, Pill, DataTable, Btn, Note, PageHeader } from '../components/ui';
import { RATES, ago, fmtDay, grams, aed } from '../data';

const KEY_LABEL = { secure_enclave: 'Secure Enclave', strongbox: 'StrongBox', huks: 'HUKS', tee: 'TEE' };
const PAY_TONE = { completed: 'ok', reversed: 'info', declined: '', capture_pending: 'warn', payout_pending: 'warn', needs_attention: 'bad' };
const MetalDot = ({ metal }) => <span className="w-2 h-2 rounded-full inline-block mr-1" style={{ background: metal === 'gold' ? '#d4a64a' : '#a9b3ba' }} />;

export default function Users() {
  const { customers, sessions, orders, selectedCustomer, setSelectedCustomer, revokeSession, revokeAllSessions, blockCustomer, unblockCustomer } = useStore();
  const [filter, setFilter] = useState('');

  const filtered = customers.filter(c => !filter || c.ref.toLowerCase().includes(filter.toLowerCase()));
  const sel = customers.find(c => c.ref === selectedCustomer);

  const statusPill = (c) => c.status === 'active' ? <Pill tone="ok">active</Pill> : c.status === 'blocked' ? <Pill tone="bad">blocked</Pill> : <Pill>dormant</Pill>;
  const liveCount = (ref) => sessions.filter(s => s.customer === ref && s.live).length;

  return (
    <>
      <PageHeader title="Users" lede="Every NBF customer using the gold and silver service — their holdings, their devices and their activity." />
      <Note tone="info">🔒 NUQI knows each customer only by <b>NBF's own reference</b>. Names, accounts and contact details stay in NBF's systems.</Note>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)' }}>
        <Panel title="Customers" subtitle={`${customers.length} customers · click one to see their details`}>
          <div className="px-5 pt-1 pb-0">
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search by NBF customer reference…"
              className="border border-[#e3e7e4] rounded-lg px-3 py-2 text-sm w-full mb-3 focus:outline-none focus:border-[#0f7a63]" />
          </div>
          <DataTable
            keyField="ref"
            selectedKey={selectedCustomer}
            cols={['Customer', 'Status', 'Gold', 'Silver', 'Live', 'Last active']}
            rows={filtered.map(c => ({
              ref: c.ref,
              cells: [
                <span><div className="font-mono text-xs font-semibold">{c.ref}</div><div className="text-xs text-[#66736e]">since {fmtDay(c.joined)}</div></span>,
                statusPill(c),
                <span className="whitespace-nowrap">{grams(c.gold)}</span>,
                <span className="whitespace-nowrap">{grams(c.silver)}</span>,
                liveCount(c.ref) ? <Pill tone="ok">{liveCount(c.ref)} live</Pill> : 'none',
                <span className="whitespace-nowrap text-xs">{ago(c.lastActive)}</span>,
              ],
            }))}
            onRowClick={r => setSelectedCustomer(r.ref)}
          />
        </Panel>

        <div>
          {sel ? <CustomerDetail c={sel} sessions={sessions} orders={orders} onRevoke={revokeSession} onRevokeAll={revokeAllSessions} onBlock={blockCustomer} onUnblock={unblockCustomer} />
            : <Panel title="Customer" subtitle=""><div className="py-8 text-center text-sm text-[#66736e]">Select a customer on the left to see their holdings and sessions.</div></Panel>}
        </div>
      </div>
    </>
  );
}

function CustomerDetail({ c, sessions, orders, onRevoke, onRevokeAll, onBlock, onUnblock }) {
  const custSessions = sessions.filter(s => s.customer === c.ref);
  const custOrders   = orders.filter(o => o.customer === c.ref);
  const goldVal      = c.gold * RATES.gold.sell;
  const silverVal    = c.silver * RATES.silver.sell;
  const pl = (held, avg, rate) => held && avg ? held * (rate - avg) : 0;
  const plStyle = v => ({ color: v >= 0 ? '#13795b' : '#b3261e' });

  return (
    <Panel
      title={<code className="font-mono">{c.ref}</code>}
      subtitle={`${c.status === 'blocked' ? 'Trading blocked — KYC review' : 'KYC passed'} · since ${fmtDay(c.joined)}`}
      actions={
        <div className="flex gap-2">
          {custSessions.some(s => s.live) && <Btn size="sm" variant="danger" onClick={() => onRevokeAll(c.ref)}>Sign out everywhere</Btn>}
          {c.status === 'blocked'
            ? <Btn size="sm" onClick={() => onUnblock(c.ref)}>Unblock</Btn>
            : <Btn size="sm" variant="danger" onClick={() => onBlock(c.ref)}>Block</Btn>}
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[['gold', c.gold, c.avgGold, goldVal, RATES.gold.sell], ['silver', c.silver, c.avgSilver, silverVal, RATES.silver.sell]].map(([metal, held, avg, val, rate]) => (
          <div key={metal} className="border border-[#e3e7e4] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <Pill tone={metal}>{metal}</Pill>
              <span className="text-xs text-[#66736e]">{avg ? `avg ${aed(avg)}/g` : '—'}</span>
            </div>
            <div className="text-2xl font-bold mt-2">{grams(held)}</div>
            <div className="text-xs text-[#66736e]">Worth {aed(val)} at {aed(rate)}/g</div>
            <div className="text-xs mt-1" style={plStyle(pl(held, avg, rate))}>
              Unrealised {pl(held, avg, rate) >= 0 ? '+' : ''}{aed(pl(held, avg, rate))}
            </div>
          </div>
        ))}
      </div>
      <div className="text-sm p-3 rounded-lg mb-4" style={{ background: '#e2f4ec', color: '#13795b' }}>
        Total portfolio value <b>{aed(goldVal + silverVal)}</b>
      </div>

      <h4 className="text-sm font-semibold mb-2">Sessions <span className="font-normal text-[#66736e]">· {custSessions.filter(s => s.live).length} live of {custSessions.length}</span></h4>
      <div className="border border-[#e3e7e4] rounded-xl overflow-hidden mb-4">
        <DataTable keyField="id" cols={['Device', 'Key storage', 'State', 'Last seen', '']}
          rows={custSessions.map(s => ({
            id: s.id,
            cells: [
              <span><div className="text-sm">{s.device}</div><div className="text-xs text-[#66736e]">{s.surface} · {s.id}</div></span>,
              s.key ? <Pill tone="ok">{KEY_LABEL[s.key]}</Pill> : <Pill>browser</Pill>,
              s.revoked ? <Pill tone="bad">revoked</Pill> : s.live ? <Pill tone="ok">live</Pill> : <Pill>expired</Pill>,
              <span className="text-xs whitespace-nowrap">{ago(s.seen)}</span>,
              s.live && !s.revoked ? <Btn size="sm" variant="danger" onClick={() => onRevoke(s.id)}>Revoke</Btn> : null,
            ],
          }))} />
      </div>

      <h4 className="text-sm font-semibold mb-2">Recent orders</h4>
      <div className="border border-[#e3e7e4] rounded-xl overflow-hidden">
        <DataTable keyField="id" cols={['Order', 'Side', 'Metal', 'Grams', 'Total', 'Money']}
          rows={custOrders.map(o => ({
            id: o.id,
            cells: [
              <span className="font-mono text-xs">{o.id}</span>,
              <Pill tone={o.side === 'buy' ? 'info' : 'gold'}>{o.side}</Pill>,
              <span className="inline-flex items-center text-sm"><MetalDot metal={o.metal} />{o.metal}</span>,
              o.grams,
              <span className="whitespace-nowrap">{aed(o.total)}</span>,
              <Pill tone={PAY_TONE[o.payment] ?? ''}>{o.payment?.replace(/_/g,' ')}</Pill>,
            ],
          }))} />
      </div>
    </Panel>
  );
}
