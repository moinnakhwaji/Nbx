import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Panel, DataTable, Pill, Btn, Modal, Field, Select, Note, PageHeader } from '../components/ui';
import { ROLES, ago } from '../data';

export default function Team() {
  const { team, user, inviteTeamMember, disableTeamMember, toast } = useStore();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState('new.colleague@nbf.bank.demo');
  const [role, setRole] = useState('bank_ops');

  function handleInvite() {
    if (!email.endsWith('@nbf.bank.demo')) { toast('❌ Only addresses at NBF\'s own domain can be invited.'); return; }
    inviteTeamMember(email, role);
    setInviteOpen(false);
  }

  return (
    <>
      <PageHeader title="Team" lede="People at NBF who can use this portal, and their roles." />

      <Panel title="People at NBF" subtitle={`${team.length} accounts · only NBF staff`}
        actions={<Btn variant="primary" size="sm" onClick={() => setInviteOpen(true)}>+ Invite a colleague</Btn>}>
        <DataTable keyField="email" cols={['Name', 'Role', 'Two-factor', 'Last seen', 'Status', '']}
          rows={team.map(m => ({
            email: m.email,
            cells: [
              <span><div className="font-medium text-sm">{m.name}</div><div className="text-xs text-[#66736e]">{m.email}</div></span>,
              <Pill tone={m.role === 'bank_super' ? 'gold' : m.role === 'bank_viewer' ? '' : 'info'}>{ROLES[m.role]?.label}</Pill>,
              m.mfaOn ? <Pill tone="ok">enrolled</Pill> : m.role === 'bank_viewer' ? <Pill>optional</Pill> : <Pill tone="warn">not enrolled</Pill>,
              m.status === 'invited' ? 'never' : ago(m.lastSeen),
              m.status === 'active' ? <Pill tone="ok">active</Pill> : m.status === 'invited' ? <Pill tone="info">invited</Pill> : <Pill>disabled</Pill>,
              m.email === user?.email
                ? <span className="text-xs text-[#66736e]">you</span>
                : <div className="flex gap-2 justify-end">
                    <Btn size="sm" onClick={() => toast('Role changed — recorded in the audit log (demo).')}>Change role</Btn>
                    {m.status === 'active' && <Btn size="sm" variant="danger" onClick={() => disableTeamMember(m.email)}>Disable</Btn>}
                  </div>,
            ],
          }))} />
      </Panel>

      <div className="grid grid-cols-2 gap-4">
        <Panel title="Roles at NBF">
          <DataTable keyField="key" cols={['Role', 'Can']}
            rows={Object.entries(ROLES).map(([key, r]) => ({ key, cells: [r.label, <span className="text-xs text-[#66736e]">{r.summary}</span>] }))} />
        </Panel>
        <Panel title="Rules">
          <ul className="text-sm text-[#14201c] grid gap-2 ml-5">
            <li>Everyone who can change something uses <b>two-factor</b>.</li>
            <li>A change is approved by a <b>different person</b> — the super admin's bypass is always recorded.</li>
            <li>Only NBF staff appear here; NUQI staff are not listed and cannot be added.</li>
            <li>Every sign-in and change is in the audit log.</li>
          </ul>
        </Panel>
      </div>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite a colleague">
        <p className="text-sm text-[#66736e] mt-0 mb-4">They receive an email to set a password and enrol two-factor.</p>
        <div className="grid gap-3 mb-5">
          <Field label="Work email">
            <input value={email} onChange={e => setEmail(e.target.value)}
              className="border border-[#e3e7e4] rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-[#0f7a63]" />
          </Field>
          <Field label="Role">
            <Select value={role} onChange={e => setRole(e.target.value)}>
              {['bank_ops','bank_compliance','bank_viewer','bank_admin'].map(r => (
                <option key={r} value={r}>{ROLES[r].label}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="flex justify-end gap-2">
          <Btn onClick={() => setInviteOpen(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={handleInvite}>Send invitation</Btn>
        </div>
      </Modal>
    </>
  );
}
