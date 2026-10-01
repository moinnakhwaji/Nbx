import { useStore } from '../store/useStore';
import { Panel, Note, Checkbox, Btn, PageHeader } from '../components/ui';

export default function Features() {
  const { cfg, toast } = useStore();
  return (
    <>
      <PageHeader title="Features & entitlements" lede="Metals, currencies and feature flags in NBF's contract with NUQI." />
      <Note tone="info">📄 <b>Set by NBF's contract with NUQI.</b> Metals, currencies and feature flags are visible here and changed by NUQI on request.</Note>

      <div className="grid grid-cols-2 gap-4">
        <Panel title="Metals & currencies" subtitle="What NBF's customers can trade">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="font-semibold text-sm mb-2">Metals</div>
              {['gold','silver','platinum'].map(m => <Checkbox key={m} label={m} checked={cfg.metals.includes(m)} onChange={() => {}} disabled />)}
            </div>
            <div>
              <div className="font-semibold text-sm mb-2">Currencies</div>
              {['AED','USD','SAR'].map(c => <Checkbox key={c} label={c} checked={cfg.currencies.includes(c)} onChange={() => {}} disabled />)}
            </div>
          </div>
        </Panel>
        <Panel title="Feature flags" subtitle="Switched on in the contract">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(cfg.features).map(([k, v]) => <Checkbox key={k} label={k} checked={v} onChange={() => {}} disabled />)}
          </div>
        </Panel>
      </div>
      <Btn onClick={() => toast('Request sent to your NUQI account manager (demo).')}>Ask NUQI for a change</Btn>
    </>
  );
}
