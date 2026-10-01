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
      <Note tone="info">🔒 NUQI knows each customer only by <b>NBF's own reference</b>. Names, accounts and contact details stay in NBF's systems — none of it is stored here.</Note>

      <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)' }}>
        <Panel title="Customers" subtitle={`${customers.length} customers · click one to see their devices and holdings`} flush>
          <div className="px-[18px] py-[14px] border-b border-[var(--line)]">
            <input value={filter} onChange={e => setFilter(e.target.value)}
              placeholder="Search by NBF customer reference…"
              className="w-full border border-[var(--line)] rounded-lg px-[10px] py-2 focus:border-[var(--accent)]" />
          </div>
          <DataTable
            keyField="ref"
            selectedKey={selectedCustomer}
            cols={['Customer', 'Status', 'Gold', 'Silver', 'Live devices', 'Last active']}
            rows={filtered.map(c => ({
              ref: c.ref,
              cells: [
                <span>
                  <div>{c.ref}</div>
                  <div className="text-[12px] text-[var(--dim)]">since {fmtDay(c.joined)}</div>
                </span>,
                statusPill(c),
                <span className="whitespace-nowrap">{grams(c.gold)}</span>,
                <span className="whitespace-nowrap">{grams(c.silver)}</span>,
                liveCount(c.ref) ? <Pill tone="ok">{liveCount(c.ref)} live</Pill> : 'none',
                <span className="whitespace-nowrap">{ago(c.lastActive)}</span>,
              ],
            }))}
            onRowClick={r => setSelectedCustomer(r.ref)}
          />
        </Panel>

        <div>
          {sel
            ? <CustomerDetail c={sel} sessions={sessions} orders={orders} onRevoke={revokeSession} onRevokeAll={revokeAllSessions} onBlock={blockCustomer} onUnblock={unblockCustomer} />
            : <Panel title="Customer"><div className="text-center text-[var(--dim)] py-8">Select a customer on the left to see their current holdings and signed-in devices.</div></Panel>}
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
  const pl           = (held, avg, rate) => held && avg ? held * (rate - avg) : 0;
  const plColor      = v => ({ color: v >= 0 ? 'var(--ok)' : 'var(--bad)' });

  return (
    <Panel
      title={<span className="font-mono">{c.ref}</span>}
      subtitle={`${c.status === 'blocked' ? 'Trading blocked — KYC review' : 'KYC passed'} · customer since ${fmtDay(c.joined)}`}
      actions={
        <div className="flex gap-2">
          {custSessions.some(s => s.live) && (
            <Btn size="sm" variant="danger" onClick={() => onRevokeAll(c.ref)}>Sign out everywhere</Btn>
          )}
          {c.status === 'blocked'
            ? <Btn size="sm" onClick={() => onUnblock(c.ref)}>Unblock trading</Btn>
            : <Btn size="sm" onClick={() => onBlock(c.ref)}>Block trading</Btn>}
        </div>
      }
    >
      {/* Holdings — .holding { padding:14px 16px; border-radius:10px } */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          ['gold',   c.gold,   c.avgGold,   goldVal,   RATES.gold.sell],
          ['silver', c.silver, c.avgSilver, silverVal, RATES.silver.sell],
        ].map(([metal, held, avg, val, rate]) => (
          <div key={metal} className="border border-[var(--line)] rounded-[10px] px-4 py-[14px]">
            <div className="flex items-center justify-between">
              <Pill tone={metal}>{metal}</Pill>
              <span className="text-[12px] text-[var(--dim)]">avg cost {avg ? `${aed(avg)}/g` : '—'}</span>
            </div>
            {/* .holding .g { font-size:26px; font-weight:650; margin-top:8px } */}
            <div className="text-[26px] font-[650] mt-2">{grams(held)}</div>
            <div className="text-[var(--dim)]">Worth {aed(val)} at {aed(rate)}/g</div>
            <div className="text-[12.5px] mt-1" style={plColor(pl(held, avg, rate))}>
              Unrealised {pl(held, avg, rate) >= 0 ? '+' : ''}{aed(pl(held, avg, rate))}
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio total note */}
      <div className="note ok" style={{ marginBottom: 14 }}>
        Total portfolio value <b>{aed(goldVal + silverVal)}</b> — valued at today's sell rates, the price NBF would pay to buy it back.
      </div>

      {/* Sessions — h4 { margin:4px 0 8px } */}
      <h4 style={{ margin: '4px 0 8px', fontWeight: 600 }}>
        Current sessions{' '}
        <span className="font-normal text-[var(--dim)]">· {custSessions.filter(s => s.live).length} live of {custSessions.length}</span>
      </h4>
      <div className="panel mb-4">
        <DataTable keyField="id" cols={['Device', 'Key storage', 'State', 'Last seen', '']}
          rows={custSessions.map(s => ({
            id: s.id,
            cells: [
              <span>
                <div>{s.device}</div>
                <div className="text-[12px] text-[var(--dim)]">{s.surface} · {s.id}</div>
              </span>,
              s.key ? <Pill tone="ok">{KEY_LABEL[s.key]}</Pill> : <Pill>browser</Pill>,
              s.revoked ? <Pill tone="bad">revoked</Pill> : s.live ? <Pill tone="ok">live</Pill> : <Pill>expired</Pill>,
              <span className="whitespace-nowrap">{ago(s.seen)}</span>,
              s.live && !s.revoked ? <Btn size="sm" variant="danger" onClick={() => onRevoke(s.id)}>Revoke</Btn> : null,
            ],
          }))} />
      </div>

      <h4 style={{ margin: '4px 0 8px', fontWeight: 600 }}>Recent orders</h4>
      <div className="panel">
        <DataTable keyField="id" cols={['Order', 'Side', 'Metal', 'Grams', 'Total', 'Money']}
          rows={custOrders.map(o => ({
            id: o.id,
            cells: [
              <span className="font-mono text-[12px]">{o.id}</span>,
              <Pill tone={o.side === 'buy' ? 'info' : 'gold'}>{o.side}</Pill>,
              <span className="inline-flex items-center gap-1.5"><MetalDot metal={o.metal} />{o.metal}</span>,
              o.grams,
              <span className="whitespace-nowrap">{aed(o.total)}</span>,
              <Pill tone={PAY_TONE[o.payment] ?? ''}>{o.payment?.replace(/_/g,' ')}</Pill>,
            ],
          }))} />
      </div>
    </Panel>
  );
}
