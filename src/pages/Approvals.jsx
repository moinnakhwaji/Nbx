import { useStore } from '../store/useStore';
import { Note, Pill, Btn, PageHeader } from '../components/ui';
import { ago } from '../data';

const H = 3600e3;

function decision(a, userEmail) {
  if (a.status !== 'pending') return { ok: false, why: '' };
  if (a.stages[a.stage] === 'nuqi') return { ok: false, nuqi: true, why: 'Approved at NBF — now waiting for NUQI.' };
  if (a.by === userEmail) return { ok: false, why: 'You requested this change — someone else must approve it.' };
  return { ok: true, why: 'You may approve this for NBF.' };
}

/* Stage pill — .stage { padding:2px 9px; border-radius:999px; border:1px solid var(--line); }
   .stage.done { bg:ok-soft; color:ok; border:#bfe3d4 }
   .stage.now  { bg:warn-soft; color:warn; border:#efd9a6; font-weight:600 } */
function StagePill({ state, label }) {
  const styles = {
    done: 'bg-[var(--ok-soft)]   text-[var(--ok)]   border-[#bfe3d4]',
    now:  'bg-[var(--warn-soft)] text-[var(--warn)]  border-[#efd9a6] font-[600]',
    ''  : 'bg-white text-[var(--dim)] border-[var(--line)]',
  };
  return (
    <span className={`px-[9px] py-[2px] rounded-full border text-[12px] ${styles[state] ?? styles['']}`}>
      {label}
    </span>
  );
}

export default function Approvals() {
  const { approvals, user, approveChange, rejectChange, nuqiApprove } = useStore();

  return (
    <>
      <PageHeader title="Approvals" lede="Every change is recorded with who asked and who approved. Money and security changes are co-approved by NUQI." />
      <Note tone="info">
        🛡️ <b>Four eyes at NBF, and NUQI for anything touching money or security.</b>{' '}
        A colleague approves first; payment, integration and limit changes then go to NUQI.
        As super admin your own NBF approval is a recorded bypass.
      </Note>

      {approvals.length === 0 && (
        <div className="bg-white border border-[var(--line)] rounded-[var(--r)] p-8 text-center text-[var(--dim)]">
          Nothing waiting.
        </div>
      )}

      {approvals.map(a => {
        const d = decision(a, user?.email);
        const isFinal = a.stage === a.stages.length - 1;
        const stageLabel = s => s === 'bank' ? 'NBF checker' : 'NUQI';

        return (
          <section key={a.id} className="bg-white border border-[var(--line)] rounded-[var(--r)] mb-4 overflow-hidden">

            {/* Panel header — .panel-h { padding:13px 18px } */}
            <div className="flex items-center justify-between gap-3 px-[18px] py-[13px] border-b border-[var(--line)] flex-wrap">
              <div>
                {/* h3 — font-size:14.5px, bold (browser default for h3) */}
                <h3 className="m-0 text-[14.5px] font-bold">{a.title}</h3>
                {/* .sub — font-size:12.5px, color:var(--dim) */}
                <div className="text-[12.5px] text-[var(--dim)] mt-0.5">
                  {a.area} · requested by <span className="font-mono">{a.by}</span> · {ago(a.at)}
                </div>
              </div>

              {/* Stages — .stages { display:flex; align-items:center; gap:6px; font-size:12px } */}
              <div className="flex items-center gap-[6px] flex-wrap">
                {a.stages.map((s, i) => {
                  const state = a.status === 'approved' || i < a.stage ? 'done'
                    : a.status === 'pending' && i === a.stage ? 'now' : '';
                  const tick  = (a.status === 'approved' || i < a.stage) ? ' ✓' : '';
                  const bypass = i === 0 && a.bypassed ? ' (bypass)' : '';
                  return (
                    <span key={i} className="flex items-center gap-[6px]">
                      {i > 0 && <span className="text-[var(--dim)]">→</span>}
                      <StagePill state={state} label={`${i + 1} · ${stageLabel(s)}${tick}${bypass}`} />
                    </span>
                  );
                })}
                {a.status === 'pending'
                  ? <Pill tone="warn">expires in {Math.max(1, Math.round((a.expires - Date.now()) / H))} h</Pill>
                  : a.status === 'approved' ? <Pill tone="ok">approved & applied</Pill>
                  : <Pill>rejected</Pill>}
              </div>
            </div>

            {/* Diff table — .diff td:2 { color:bad; line-through } .diff td:3 { color:ok } */}
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Setting', 'Before', 'After'].map(h => (
                    <th key={h} className="text-left text-[11px] tracking-[.07em] uppercase text-[var(--dim)] font-[600] px-[18px] py-[9px] border-b border-[var(--line)] bg-[#fafbfa] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {a.diff.map((x, i) => (
                  <tr key={i} className="border-b border-[#eef1ef] last:border-0">
                    <td className="px-[18px] py-[10px] text-sm">{x[0]}</td>
                    <td className="px-[18px] py-[10px] text-sm text-[var(--bad)] line-through">{x[1]}</td>
                    <td className="px-[18px] py-[10px] text-sm text-[var(--ok)]">{x[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer — .panel-b.row { padding:16px 18px; border-top:1px solid var(--line) } */}
            {a.status === 'pending' && (
              <div className="flex items-center gap-[10px] px-[18px] py-[16px] border-t border-[var(--line)] flex-wrap">
                <span className="text-[12.5px] text-[var(--dim)]">{d.why}</span>
                <span className="flex-1" />
                {d.nuqi ? (
                  <Btn variant="demo" size="sm" onClick={() => nuqiApprove(a.id)}>
                    Demo: simulate NUQI approval
                  </Btn>
                ) : (
                  <>
                    <Btn variant="danger" size="sm" disabled={!d.ok} onClick={() => rejectChange(a.id)}>Reject</Btn>
                    <Btn variant="primary" size="sm" disabled={!d.ok} onClick={() => approveChange(a.id)}>
                      {isFinal ? 'Approve & apply' : 'Approve — send to NUQI'}
                    </Btn>
                  </>
                )}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
