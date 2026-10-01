import { Panel, Stat, PageHeader } from '../components/ui';

const SERIES = [92, 110, 104, 131, 125, 150, 142];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const MAX = Math.max(...SERIES);

export default function Usage() {
  return (
    <>
      <PageHeader title="Usage" lede="Sessions, orders and volume over the last 7 days." />

      <div className="grid grid-cols-3 gap-4 mb-4">
        <Stat label="Sessions created" value="854" detail="+12% vs last week" />
        <Stat label="Orders settled"   value="312" detail="2 failed · 0.6%" />
        <Stat label="Volume"           value="1.84M" detail="AED, buys and sells" />
      </div>

      <Panel title="Sessions per day" subtitle="Last 7 days">
        <div className="flex items-end gap-2 h-32 pt-2">
          {SERIES.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t" style={{ height: `${(v / MAX) * 96}px`, background: 'linear-gradient(180deg, #2a9a7f, #0f7a63)' }} />
              <span className="text-[10px] text-[#66736e]">{DAYS[i]}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Plan usage" subtitle="Enterprise plan">
        <div className="grid gap-3">
          {[['API calls', 0.42, '4.2M of 10M this month'], ['Active customers', 0.63, '6,300 of 10,000']].map(([label, pct, detail]) => (
            <div key={label} className="grid gap-1">
              <div className="text-sm text-[#66736e]">{label}</div>
              <div className="h-2 rounded-full bg-[#eef1ef] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: '#0f7a63' }} />
              </div>
              <div className="text-xs text-[#66736e]">{detail}</div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
