import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Panel, Stat, Note, Pill, DataTable, KV, PageHeader } from '../components/ui';
import { RATES, BANK, grams, aed, ago } from '../data';

export default function Home() {
  const { customers, sessions, orders, payops, webhooks, approvals, cfg } = useStore();
  const navigate = useNavigate();

  const goldHeld   = customers.reduce((s, c) => s + c.gold, 0);
  const silverHeld = customers.reduce((s, c) => s + c.silver, 0);
  const pending    = approvals.filter(a => a.status === 'pending');
  const liveCount  = sessions.filter(s => s.live).length;
  const todayOrders = orders.filter(o => Date.now() - o.at < 86400e3).length;
  const weekVol    = orders.filter(o => o.status === 'settled').reduce((s, o) => s + o.total, 0);
  const attention  = payops.filter(p => p.status === 'abandoned').length + webhooks.filter(w => w.status === 'failed').length;
  const activeCount = customers.filter(c => c.status === 'active').length;

  const link = (label, to) => (
    <a href="#" onClick={e => { e.preventDefault(); navigate(to); }} style={{ color: 'var(--accent)' }}>{label}</a>
  );

  return (
    <>
      <PageHeader title="Home" lede="NBF's gold and silver service today, and what is waiting for you." />
      <Note tone="info">🏦 This is <b>NBF's</b> portal. You see only NBF — never another bank's customers, settings or data.</Note>

      {/* Row 1 — gap:14px matches HTML .grid { gap:14px } */}
      <div className="grid grid-cols-4 gap-[14px] mb-4">
        <Stat label="Customers"            value={customers.length}    detail={<span>{activeCount} active · {link('open users', '/users')}</span>} />
        <Stat label="Gold held by customers"   value={grams(goldHeld)}     detail={`${aed(goldHeld * RATES.gold.sell)} at today's sell rate`} />
        <Stat label="Silver held by customers" value={grams(silverHeld)}   detail={`${aed(silverHeld * RATES.silver.sell)} at today's sell rate`} />
        <Stat label="Live sessions"        value={liveCount}           detail="iOS · Android · Huawei · Web" />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-4 gap-[14px] mb-4">
        <Stat label="Orders · 24 h"  value={todayOrders} detail={`${aed(weekVol)} this week`} />
        <Stat label="Gold rate"   value={aed(RATES.gold.buy)}   valueStyle={{ fontSize: 18 }} detail={`buy · sell ${aed(RATES.gold.sell)} per gram`} />
        <Stat label="Silver rate" value={aed(RATES.silver.buy)} valueStyle={{ fontSize: 18 }} detail={`buy · sell ${aed(RATES.silver.sell)} per gram`} />
        <Stat label="Needs a person" value={attention} valueStyle={{ color: 'var(--bad)' }}
          detail={<span>{link('payments', '/payops')} · {link('webhooks', '/webhooks')}</span>} />
      </div>

      <div className="grid grid-cols-2 gap-[14px]">
        <Panel title="Your contract with NUQI" subtitle="Changed by NUQI on request">
          <KV pairs={[
            ['Plan',              BANK.plan],
            ['Metals',            cfg.metals.join(', ')],
            ['Currencies',        cfg.currencies.join(', ')],
            ['Bank payments',     cfg.payments.enabled ? <Pill tone="ok">on · hold → capture</Pill> : <Pill>NUQI moves the money</Pill>],
            ['Physical delivery', cfg.features.delivery ? <Pill tone="ok">on</Pill> : <Pill>off</Pill>],
            ['Live since',        ago(BANK.since)],
          ]} />
        </Panel>

        <Panel title="Waiting for approval" subtitle={`${pending.length} pending`} flush>
          <DataTable
            cols={['Change', 'Requested by', 'Stage']}
            keyField="id"
            rows={pending.map(a => ({
              id: a.id,
              cells: [
                a.title,
                a.by,
                a.stages[a.stage] === 'bank' ? <Pill tone="info">NBF</Pill> : <Pill tone="warn">NUQI</Pill>,
              ],
            }))}
            onRowClick={() => navigate('/approvals')}
          />
        </Panel>
      </div>
    </>
  );
}
