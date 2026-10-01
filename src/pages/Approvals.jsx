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

export default function Approvals() {
  const { approvals, user, approveChange, rejectChange, nuqiApprove } = useStore();

  return (
    <>
      <PageHeader title="Approvals" lede="Every change is recorded with who asked and who approved. Money and security changes are co-approved by NUQI." />
      <Note tone="info">🛡️ <b>Four eyes at NBF, and NUQI for anything touching money or security.</b> A colleague approves first; payment, integration and limit changes then go to NUQI.</Note>

      {approvals.length === 0 && (
        <div className="bg-white border border-[#e3e7e4] rounded-xl p-8 text-center text-sm text-[#66736e]">Nothing waiting.</div>
      )}

      {approvals.map(a => {
        const d = decision(a, user?.email);
        const isFinal = a.stage === a.stages.length - 1;
        const label = s => s === 'bank' ? 'NBF checker' : 'NUQI';

        return (
          <section key={a.id} className="bg-white border border-[#e3e7e4] rounded-xl mb-4 overflow-hidden">
            <div className="flex items-start justify-between gap-3 px-5 py-3 border-b border-[#e3e7e4] flex-wrap">
              <div>
                <div className="font-semibold text-sm">{a.title}</div>
                <div className="text-xs text-[#66736e] mt-0.5">
                  {a.area} · requested by <code className="font-mono">{a.by}</code> · {ago(a.at)}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Stage indicators */}
                <div className="flex items-center gap-1 text-xs">
                  {a.stages.map((s, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <span className="text-[#66736e]">→</span>}
                      <span className={`px-2 py-0.5 rounded-full border text-xs ${
                        a.status === 'approved' || i < a.stage ? 'bg-[#e2f4ec] text-[#13795b] border-[#bfe3d4]' :
                        a.status === 'pending' && i === a.stage ? 'bg-[#fbf1dc] text-[#9a6400] border-[#efd9a6] font-semibold' :
                        'bg-white text-[#66736e] border-[#e3e7e4]'
                      }`}>
                        {i + 1} · {label(s)}{(a.status === 'approved' || i < a.stage) ? ' ✓' : ''}{i === 0 && a.bypassed ? ' (bypass)' : ''}
                      </span>
                    </span>
                  ))}
                </div>
                {a.status === 'pending'
                  ? <Pill tone="warn">expires in {Math.max(1, Math.round((a.expires - Date.now()) / H))} h</Pill>
                  : a.status === 'approved' ? <Pill tone="ok">approved & applied</Pill>
                  : <Pill>rejected</Pill>}
              </div>
            </div>

            {/* Diff table */}
            <table className="w-full border-collapse">
              <thead><tr>
                <th className="text-left text-[11px] uppercase tracking-wider text-[#66736e] px-5 py-2.5 border-b border-[#e3e7e4] bg-[#fafbfa]">Setting</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-[#66736e] px-5 py-2.5 border-b border-[#e3e7e4] bg-[#fafbfa]">Before</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-[#66736e] px-5 py-2.5 border-b border-[#e3e7e4] bg-[#fafbfa]">After</th>
              </tr></thead>
              <tbody>
                {a.diff.map((x, i) => (
                  <tr key={i} className="border-b border-[#eef1ef] last:border-0">
                    <td className="px-5 py-2.5 text-sm">{x[0]}</td>
                    <td className="px-5 py-2.5 text-sm text-[#b3261e] line-through">{x[1]}</td>
                    <td className="px-5 py-2.5 text-sm text-[#13795b]">{x[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {a.status === 'pending' && (
              <div className="flex items-center gap-3 px-5 py-3 border-t border-[#e3e7e4] flex-wrap">
                <span className="text-xs text-[#66736e]">{d.why}</span>
                <span className="flex-1" />
                {d.nuqi ? (
                  <Btn variant="demo" size="sm" onClick={() => nuqiApprove(a.id)}>Demo: simulate NUQI approval</Btn>
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
