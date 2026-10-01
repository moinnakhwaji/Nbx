import { useStore } from '../store/useStore';
import { Panel, Note, Pill, Btn, DataTable, PageHeader } from '../components/ui';
import { fmtDate } from '../data';

export default function AuditLog() {
  const { audit, _audit, toast } = useStore();

  function exportCsv() {
    _audit('audit.export', 'NBF', 'Exported the audit log (CSV)');
    toast('Audit log exported as CSV (demo) — and the export itself is now in the log.');
  }

  return (
    <>
      <PageHeader title="Audit log" lede="Who did what, when — people at NBF, NUQI staff and NUQI's systems." />
      <Note tone="info">Only NBF's entries. Actions NUQI staff took on NBF are listed, attributed to "NUQI staff".</Note>

      <Panel title="Audit log" subtitle={`${audit.length} entries · newest first`}
        actions={<Btn size="sm" onClick={exportCsv}>Export CSV</Btn>} flush>
        <DataTable keyField="idx" cols={['When','Who','Role','Action','Target','Detail']}
          rows={audit.map((a, i) => ({
            idx: i,
            cells: [
              <span className="text-xs whitespace-nowrap">{fmtDate(a.at)}</span>,
              <span className="text-xs">{a.side === 'nuqi' ? 'NUQI staff' : a.actor}</span>,
              <Pill tone={a.role === 'Bank super admin' ? 'gold' : a.side === 'system' ? '' : a.side === 'nuqi' ? 'info' : 'ok'}>{a.role}</Pill>,
              <span className="font-mono text-xs">{a.action}</span>,
              <span className="font-mono text-xs">{a.target}</span>,
              <span className="text-xs text-[#66736e]">{a.detail}</span>,
            ],
          }))} />
      </Panel>
    </>
  );
}
