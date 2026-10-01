import { useStore } from '../store/useStore';
import { Panel, Pill, Btn, DataTable, KV, PageHeader } from '../components/ui';
import { ROLES, CAP_LABEL } from '../data';

export default function Account() {
  const { user, toast } = useStore();
  const role = ROLES[user?.role];

  return (
    <>
      <PageHeader title="My account" lede="Your role, your two-factor and where you are signed in." />

      <div className="grid grid-cols-2 gap-4">
        <Panel title="Your role">
          <div className="flex items-center gap-2 mb-3">
            <Pill tone="gold">{role?.label}</Pill>
            <Pill>NBF</Pill>
          </div>
          <p className="text-sm text-[#66736e] mb-4">{role?.summary}</p>
          <KV pairs={[
            ['Signed in as', <code className="font-mono text-xs">{user?.email}</code>],
            ['Permissions', <div className="flex flex-wrap gap-1">{Object.values(CAP_LABEL).map(c => <Pill key={c} tone="ok">{c}</Pill>)}</div>],
            ['Second NBF approver', <Pill tone="gold">bypassed — recorded</Pill>],
          ]} />
        </Panel>

        <Panel title="Two-factor">
          <Pill tone="ok">enrolled</Pill>
          <p className="text-sm text-[#66736e] mt-3 mb-3">Authenticator app · 10 recovery codes remaining.</p>
          <Btn size="sm" onClick={() => toast('Recovery codes are shown once, at enrolment (demo).')}>Show recovery codes</Btn>
        </Panel>
      </div>

      <Panel title="Where you are signed in" flush>
        <DataTable keyField="idx" cols={['Browser','Location','Signed in','']}
          rows={[
            { idx: 0, cells: ['Chrome on Windows · this browser', 'Fujairah, AE', 'just now', ''] },
            { idx: 1, cells: ['Safari on macOS', 'Dubai, AE', '2 d ago', <Btn size="sm" onClick={() => toast('That session was signed out.')}>Sign out</Btn>] },
          ]} />
      </Panel>
    </>
  );
}
