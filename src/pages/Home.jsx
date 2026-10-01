import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Panel, Stat, Note, Pill, DataTable, KV, PageHeader } from '../components/ui';
import { RATES, grams, aed, ago } from '../data';

export default function Home() {
  const { customers, sessions, orders, payops, webhooks, approvals, cfg } = useStore();
  const navigate = useNavigate();

  const goldHeld = customers.reduce((s, c) => s + c.gold, 0);
  const silverHeld = customers.reduce((s, c) => s + c.silver, 0);
  const pending = approvals.filter(a => a.status === 'pending');
  const liveCount = sessions.filter(s => s.live).length;
  const todayOrders = orders.filter(o => Date.now() - o.at < 86400e3).length;
  const weekVol = orders.filter(o => o.status === 'settled').reduce((s, o) => s + o.total, 0);
  const attention = payops.filter(p => p.status === 'abandoned').length + webhooks.filter(w => w.status === 'failed').length;

  return (
    <>
      <PageHeader title="Home" lede="NBF's gold and silver service today, and what is waiting for you." />
      <Note tone="info">🏦 This is <b>NBF's</b> portal. You see only NBF — never another bank's customers, settings or data.</Note>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <Stat label="Customers" value={customers.length} detail={`${customers.filter(c => c.status === 'active').length} active`} />
        <Stat label="Gold held by customers" value={grams(goldHeld)} detail={`${aed(goldHeld * RATES.gold.sell)} at today's sell rate`} />
        <Stat label="Silver held by customers" value={grams(silverHeld)} detail={`${aed(silverHeld * RATES.silver.sell)} at today's sell rate`} />
        <Stat label="Live sessions" value={liveCount} detail="iOS · Android · Huawei · Web" />
      </div>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Stat label="Orders · 24 h" value={todayOrders} detail={`${aed(weekVol)} this week`} />
        <Stat label="Gold rate" value={aed(RATES.gold.buy)} detail={`sell ${aed(RATES.gold.sell)} per gram`} valueStyle={{ fontSize: 18 }} />
        <Stat label="Silver rate" value={aed(RATES.silver.buy)} detail={`sell ${aed(RATES.silver.sell)} per gram`} valueStyle={{ fontSize: 18 }} />
        <Stat label="Needs a person" value={attention} valueStyle={{ color: '#b3261e' }} detail={<span><a href="#" onClick={e => { e.preventDefault(); navigate('/payops'); }} className="text-[#0f7a63]">payments</a> · <a href="#" onClick={e => { e.preventDefault(); navigate('/webhooks'); }} className="text-[#0f7a63]">webhooks</a></span>} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Panel title="Your contract with NUQI" subtitle="Changed by NUQI on request">
          <KV pairs={[
            ['Plan', cfg.plan ?? 'Enterprise'],
            ['Metals', cfg.metals.join(', ')],
            ['Currencies', cfg.currencies.join(', ')],
            ['Bank payments', cfg.payments.enabled ? <Pill tone="ok">on · hold → capture</Pill> : <Pill>NUQI moves the money</Pill>],
            ['Physical delivery', cfg.features.delivery ? <Pill tone="ok">on</Pill> : <Pill>off</Pill>],
          ]} />
        </Panel>

        <Panel title="Waiting for approval" subtitle={`${pending.length} pending`}>
          <DataTable
            cols={['Change', 'Requested by', 'Stage']}
            keyField="id"
            rows={pending.map(a => ({
              id: a.id,
              cells: [a.title, a.by, a.stages[a.stage] === 'bank' ? <Pill tone="info">NBF</Pill> : <Pill tone="warn">NUQI</Pill>],
            }))}
            onRowClick={() => navigate('/approvals')}
          />
        </Panel>
      </div>
    </>
  );
}
