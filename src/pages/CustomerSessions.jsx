import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Panel, Pill, Btn, DataTable, Modal, Field, Input, PageHeader } from '../components/ui';
import { ago } from '../data';

const KEY_LABEL = { secure_enclave: 'Secure Enclave', strongbox: 'StrongBox', huks: 'HUKS', tee: 'TEE' };

export default function CustomerSessions() {
  const { sessions, setSelectedCustomer, revokeSession, revokeAllSessions } = useStore();
  const navigate = useNavigate();
  const [revokeModal, setRevokeModal] = useState(false);
  const [targetRef, setTargetRef] = useState('NBF-CUST-100231');
  const live = sessions.filter(s => s.live).length;

  function handleRevokeAll() {
    revokeAllSessions(targetRef);
    setRevokeModal(false);
  }

  return (
    <>
      <PageHeader title="Customer sessions" lede="Every device signed in to NBF's gold service. Liveness comes from the session store, not the database." />

      <Panel title="Customer sessions" subtitle={`${live} live of ${sessions.length}`}
        actions={<Btn variant="danger" size="sm" onClick={() => setRevokeModal(true)}>Sign out a customer everywhere</Btn>}
        flush>
        <DataTable keyField="id" cols={['Session','Customer','Device','State','Last seen','Started','']}
          rows={sessions.map(s => ({
            id: s.id,
            cells: [
              <span className="font-mono text-xs">{s.id}</span>,
              <button className="font-mono text-xs text-[#0f7a63] hover:underline" onClick={() => { setSelectedCustomer(s.customer); navigate('/users'); }}>{s.customer}</button>,
              <span><div className="text-sm">{s.device}</div><div className="text-xs text-[#66736e]">{s.surface}</div></span>,
              s.revoked ? <Pill tone="bad">revoked</Pill> : s.live ? <Pill tone="ok">live</Pill> : <Pill>expired</Pill>,
              <span className="text-xs whitespace-nowrap">{ago(s.seen)}</span>,
              <span className="text-xs whitespace-nowrap">{ago(s.created)}</span>,
              s.live && !s.revoked ? <Btn size="sm" variant="danger" onClick={() => revokeSession(s.id)}>Revoke</Btn> : null,
            ],
          }))} />
      </Panel>

      <Modal open={revokeModal} onClose={() => setRevokeModal(false)} title="Sign a customer out everywhere">
        <p className="text-sm text-[#66736e] mb-4">Ends every session for one customer — for a lost phone or suspected fraud.</p>
        <Field label="NBF customer reference">
          <Input value={targetRef} onChange={e => setTargetRef(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 mt-4">
          <Btn onClick={() => setRevokeModal(false)}>Cancel</Btn>
          <Btn variant="danger" onClick={handleRevokeAll}>End all sessions</Btn>
        </div>
      </Modal>
    </>
  );
}
