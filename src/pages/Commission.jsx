import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Panel, Note, Btn, KV, PageHeader, MetalTag } from '../components/ui';
import { RATES, aed, bpPct, fils } from '../data';

function feeOf(q, total) { return q.feeType === 'flat' ? q.feeFlat / 100 : (total * q.feePct) / 10000; }

const aedToFils = v => Math.round(parseFloat(String(v).replace(/,/g, '')) * 100);
const pctToBp   = v => Math.round(parseFloat(String(v).replace(/,/g, '')) * 100);

export default function Commission() {
  const { cfg, submitChange, toast } = useStore();
  const c = cfg.commission;
  const d = cfg.delivery;

  const initRates = () => ({
    gold:   { bankBuy: bpPct(c.gold.bankBuy), bankSell: bpPct(c.gold.bankSell), feeType: c.gold.feeType, fee: c.gold.feeType === 'flat' ? fils(c.gold.feeFlat) : bpPct(c.gold.feePct) },
    silver: { bankBuy: bpPct(c.silver.bankBuy), bankSell: bpPct(c.silver.bankSell), feeType: c.silver.feeType, fee: c.silver.feeType === 'flat' ? fils(c.silver.feeFlat) : bpPct(c.silver.feePct) },
  });
  const initDel = () => ({ vatPct: d.vatPct, minting: fils(d.mintingPerGram), txFee: fils(d.transactionFee), delivery: fils(d.deliveryCharge) });

  const [rates, setRates] = useState(initRates);
  const [del, setDel] = useState(initDel);

  function saveRates() {
    const next = {
      gold:   { ...c.gold,   bankBuy: pctToBp(rates.gold.bankBuy),   bankSell: pctToBp(rates.gold.bankSell),   feeType: rates.gold.feeType,   feeFlat: rates.gold.feeType === 'flat' ? aedToFils(rates.gold.fee) : 0,   feePct: rates.gold.feeType === 'pct' ? pctToBp(rates.gold.fee) : 0 },
      silver: { ...c.silver, bankBuy: pctToBp(rates.silver.bankBuy), bankSell: pctToBp(rates.silver.bankSell), feeType: rates.silver.feeType, feeFlat: rates.silver.feeType === 'flat' ? aedToFils(rates.silver.fee) : 0, feePct: rates.silver.feeType === 'pct' ? pctToBp(rates.silver.fee) : 0 },
    };
    const diff = [];
    for (const m of ['gold','silver'])
      for (const k of ['bankBuy','bankSell','feeFlat','feePct','feeType'])
        if (next[m][k] !== c[m][k]) diff.push([`${m}.${k}`, String(c[m][k]), String(next[m][k])]);
    if (!diff.length) { toast('Nothing changed yet.'); return; }
    submitChange('Gold & silver rates for NBF', 'Commission', diff, (set) => set(s => ({ cfg: { ...s.cfg, commission: next } })));
  }

  function saveDelivery() {
    const next = { vatPct: parseFloat(del.vatPct), mintingPerGram: aedToFils(del.minting), transactionFee: aedToFils(del.txFee), deliveryCharge: aedToFils(del.delivery) };
    const diff = Object.keys(next).filter(k => next[k] !== d[k]).map(k => ['delivery.' + k, String(d[k]), String(next[k])]);
    if (!diff.length) { toast('Nothing changed yet.'); return; }
    submitChange('Physical delivery charges for NBF', 'Commission', diff, (set) => set(s => ({ cfg: { ...s.cfg, delivery: next } })));
  }

  // Worked example
  const ex = 10, vend = RATES.gold.vendorAsk, q = c.gold;
  const bankLeg = vend * (q.bankBuy / 10000), nuqiLeg = vend * (q.nuqiBuy / 10000);
  const perGram = vend + bankLeg + nuqiLeg, metalTotal = perGram * ex, txFee = feeOf(q, metalTotal);
  // Delivery example
  const mint = (d.mintingPerGram / 100) * ex, dTx = d.transactionFee / 100, dDel = d.deliveryCharge / 100;
  const charges = mint + dTx + dDel, vat = (charges * d.vatPct) / 100;

  const RateInput = ({ val, onChange }) => (
    <input value={val} onChange={e => onChange(e.target.value)} className="w-20 border border-[#e3e7e4] rounded-lg px-2 py-1.5 text-sm" />
  );
  const RO = ({ val }) => (
    <span className="inline-flex items-center gap-1 text-xs text-[#66736e] bg-[#f3f5f4] border border-[#e3e7e4] rounded-lg px-2 py-1.5" title="Agreed in the contract with NUQI">🔒 {val}%</span>
  );

  return (
    <>
      <PageHeader title="Commission & fees" lede="How a customer price is built for gold and silver, and what physical delivery costs." />
      <Note tone="gold">⚡ <b>Bank super admin:</b> changes apply <b>immediately</b>, without a second NBF approver, and the bypass is recorded.</Note>

      <Panel title="Gold & silver rates" subtitle="Customer price = market price + NBF commission + NUQI commission"
        actions={<Btn variant="primary" size="sm" onClick={saveRates}>Apply now</Btn>} flush>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr>
              {['Metal','NBF · buy','NBF · sell','NUQI · buy','NUQI · sell','Transaction fee'].map(h => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wider text-[#66736e] px-4 py-2.5 border-b border-[#e3e7e4] bg-[#fafbfa] whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {(['gold','silver']).map(m => (
                <tr key={m} className="border-b border-[#eef1ef] last:border-0">
                  <td className="px-4 py-3"><MetalTag metal={m} /></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1"><RateInput val={rates[m].bankBuy} onChange={v => setRates(r => ({ ...r, [m]: { ...r[m], bankBuy: v } }))} /><span className="text-xs text-[#66736e]">%</span></div></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1"><RateInput val={rates[m].bankSell} onChange={v => setRates(r => ({ ...r, [m]: { ...r[m], bankSell: v } }))} /><span className="text-xs text-[#66736e]">%</span></div></td>
                  <td className="px-4 py-3"><RO val={bpPct(c[m].nuqiBuy)} /></td>
                  <td className="px-4 py-3"><RO val={bpPct(c[m].nuqiSell)} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <select value={rates[m].feeType} onChange={e => setRates(r => ({ ...r, [m]: { ...r[m], feeType: e.target.value } }))} className="border border-[#e3e7e4] rounded-lg px-2 py-1.5 text-sm">
                        <option value="flat">AED</option>
                        <option value="pct">%</option>
                      </select>
                      <RateInput val={rates[m].fee} onChange={v => setRates(r => ({ ...r, [m]: { ...r[m], fee: v } }))} />
                      <span className="text-xs text-[#66736e]">per order</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[#e3e7e4]">
          <p className="text-xs text-[#66736e]">🔒 NUQI's commission is shown for transparency and is agreed in NBF's contract with NUQI — change it through your NUQI account manager.</p>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-4">
        <Panel title="Worked example — buying 10 g of gold" subtitle="At today's market price">
          <KV pairs={[
            ['Market ask', `${aed(vend)} /g`],
            [`+ NBF commission (${bpPct(q.bankBuy)}%)`, `${aed(bankLeg)} /g`],
            [`+ NUQI commission (${bpPct(q.nuqiBuy)}%)`, `${aed(nuqiLeg)} /g`],
            ['Customer rate', <b>{aed(perGram)} /g</b>],
            ['× 10 g', aed(metalTotal)],
            ['+ Transaction fee', aed(txFee)],
            ['Customer pays', <b>{aed(metalTotal + txFee)}</b>],
          ]} />
        </Panel>

        <Panel title="Physical delivery" subtitle="Charges when a customer takes delivery of metal"
          actions={<Btn variant="primary" size="sm" onClick={saveDelivery}>Apply now</Btn>}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[['vatPct','VAT','%','Applied to charges below.'],['minting','Minting charges','AED per gram','Making the bar or coin.'],['txFee','Transaction fee','AED per delivery','Processing the delivery request.'],['delivery','Delivery charges','AED per shipment','Insured courier.']].map(([key,label,unit,hint]) => (
              <label key={key} className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-[#66736e]">{label}</span>
                <div className="flex items-center gap-1">
                  <input value={del[key]} onChange={e => setDel(d => ({ ...d, [key]: e.target.value }))} className="border border-[#e3e7e4] rounded-lg px-2 py-1.5 text-sm w-20" />
                  <span className="text-xs text-[#66736e]">{unit}</span>
                </div>
                <span className="text-xs text-[#66736e]">{hint}</span>
              </label>
            ))}
          </div>
          <div className="border-t border-[#e3e7e4] pt-3">
            <div className="text-sm font-semibold mb-2">Example — 10 g gold bar delivered</div>
            <KV pairs={[
              [`Minting (10 g × ${aed(d.mintingPerGram/100)})`, aed(mint)],
              ['Transaction fee', aed(dTx)],
              ['Delivery charges', aed(dDel)],
              [`VAT ${d.vatPct}% on charges`, aed(vat)],
              ['Customer pays for delivery', <b>{aed(charges + vat)}</b>],
            ]} />
          </div>
        </Panel>
      </div>
    </>
  );
}
