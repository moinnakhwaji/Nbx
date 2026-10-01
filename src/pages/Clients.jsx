import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Panel, Pill, Note, Btn, Modal, DataTable, PageHeader } from '../components/ui';
import { ago } from '../data';

export default function Clients() {
  const { cfg, rotateKey } = useStore();
  const [newKey, setNewKey] = useState(null);
  const [modalCl, setModalCl] = useState(null);

  function handleRotate(idx) {
    const k = rotateKey(idx);
    const cl = cfg.clients[idx];
    setModalCl(cl);
    setNewKey(`nuqi_live_demo_${Math.random().toString(36).slice(2,14)}${Math.random().toString(36).slice(2,14)}`);
  }

  return (
    <>
      <PageHeader title="API clients & keys" lede="What each of NBF's apps may call, and the keys they use." />

      <Panel title="API clients" subtitle="Each app has its own client, scopes and key" flush>
        <DataTable keyField="id" cols={['Client', 'Kind', 'Scopes', 'Key', '']}
          rows={cfg.clients.map((cl, i) => ({
            id: cl.id,
            cells: [
              <span className="font-mono text-xs font-semibold">{cl.id}</span>,
              <span className="text-sm">{cl.kind}</span>,
              <div className="flex flex-wrap gap-1">{cl.scopes.map(s => <Pill key={s}>{s}</Pill>)}</div>,
              <span><span className="font-mono text-xs">{cl.key}</span><div className="text-xs text-[#66736e]">rotated {ago(cl.rotated)}</div></span>,
              <Btn size="sm" onClick={() => handleRotate(i)}>Rotate key</Btn>,
            ],
          }))} />
      </Panel>

      <Note tone="info">🔑 A rotated key is shown <b>once</b>. The old key keeps working for 24 hours so NBF can deploy without downtime. New clients and scopes are set up by NUQI.</Note>

      <Modal open={!!newKey} onClose={() => { setNewKey(null); setModalCl(null); }} title={`New key for ${modalCl?.id}`}>
        <p className="text-sm text-[#66736e] mb-3">Shown once. Copy it into NBF's secret store now.</p>
        <pre className="bg-[#f3f5f4] p-3 rounded-lg text-xs font-mono break-all whitespace-pre-wrap mb-3">{newKey}</pre>
        <Note tone="info">The old key keeps working for 24 hours.</Note>
        <div className="flex justify-end mt-3">
          <Btn variant="primary" onClick={() => { setNewKey(null); setModalCl(null); }}>I have stored it</Btn>
        </div>
      </Modal>
    </>
  );
}
