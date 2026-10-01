import { Fragment } from 'react';

// Color maps
const TONE = {
  ok:     { background: '#e2f4ec', color: '#13795b' },
  warn:   { background: '#fbf1dc', color: '#9a6400' },
  bad:    { background: '#fbe6e4', color: '#b3261e' },
  info:   { background: '#e5eefa', color: '#1d5fa8' },
  gold:   { background: '#f8f0dd', color: '#8a6415' },
  silver: { background: '#eef1f3', color: '#6b7780' },
  '':     { background: '#eef1ef', color: '#45524d' },
};

export function Pill({ tone = '', children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${className}`} style={TONE[tone] ?? TONE['']}>
      {children}
    </span>
  );
}

export function Note({ tone = 'info', children }) {
  return (
    <div className="p-3 rounded-lg text-sm mb-4 leading-6" style={TONE[tone] ?? TONE.info}>
      {children}
    </div>
  );
}

export function Stat({ label, value, detail, valueStyle }) {
  return (
    <div className="bg-white border border-[#e3e7e4] rounded-xl p-4">
      <div className="text-xs uppercase tracking-wider text-[#66736e]">{label}</div>
      <div className="text-2xl font-bold mt-1" style={valueStyle}>{value}</div>
      {detail && <div className="text-xs text-[#66736e] mt-0.5">{detail}</div>}
    </div>
  );
}

export function Panel({ title, subtitle, actions, children, flush = false }) {
  return (
    <section className="bg-white border border-[#e3e7e4] rounded-xl mb-4 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#e3e7e4]">
        <div>
          <h3 className="text-sm font-semibold m-0">{title}</h3>
          {subtitle && <div className="text-xs text-[#66736e]">{subtitle}</div>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
      {flush ? children : <div className="p-5">{children}</div>}
    </section>
  );
}

export function DataTable({ cols, rows, onRowClick, selectedKey, keyField = 'ref', empty = 'Nothing here yet.' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c} className="text-left text-[11px] uppercase tracking-wider text-[#66736e] font-semibold px-4 py-2.5 border-b border-[#e3e7e4] bg-[#fafbfa] whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={cols.length} className="text-center text-[#66736e] py-8 text-sm">{empty}</td></tr>
          ) : rows.map((row, i) => (
            <tr
              key={row[keyField] ?? i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={[
                'border-b border-[#eef1ef] last:border-0',
                onRowClick ? 'cursor-pointer hover:bg-[#f7faf9]' : '',
                selectedKey && row[keyField] === selectedKey ? 'bg-[#f1faf6]' : '',
              ].join(' ')}
            >
              {row.cells.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 align-top text-sm">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/45 grid place-items-center z-50 p-4" onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div className="bg-white rounded-xl w-full max-w-[560px] p-6 shadow-2xl">
        {title && <h3 className="text-base font-semibold mt-0 mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

export function Btn({ children, onClick, variant = 'default', size = 'md', disabled, title, className = '', type = 'button' }) {
  const v = {
    default: 'bg-white border-[#e3e7e4] text-[#14201c] hover:bg-gray-50',
    primary: 'bg-[#0f7a63] border-[#0f7a63] text-white hover:opacity-90',
    danger:  'bg-white border-[#e9b8b4] text-[#b3261e] hover:bg-[#fbe6e4]',
    demo:    'bg-[#fff8e8] border-dashed border-[#d9b86a] text-[#7a5a14]',
  }[variant];
  const s = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm';
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title}
      className={`rounded-lg border font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${v} ${s} ${className}`}>
      {children}
    </button>
  );
}

export function KV({ pairs }) {
  return (
    <div className="grid gap-x-4 gap-y-2 text-sm" style={{ gridTemplateColumns: '180px 1fr' }}>
      {pairs.map(([k, v], i) => (
        <Fragment key={i}>
          <div className="text-[#66736e]">{k}</div>
          <div>{v}</div>
        </Fragment>
      ))}
    </div>
  );
}

export function MetalTag({ metal }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold text-sm">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: metal === 'gold' ? '#d4a64a' : '#a9b3ba' }} />
      {metal}
    </span>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wider text-[#66736e]">{label}</span>
      {children}
      {hint && <span className="text-xs text-[#66736e]">{hint}</span>}
    </label>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input className={`border border-[#e3e7e4] rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:border-[#0f7a63] disabled:bg-[#f3f5f4] disabled:text-[#66736e] ${className}`} {...props} />
  );
}

export function Select({ children, className = '', ...props }) {
  return (
    <select className={`border border-[#e3e7e4] rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:border-[#0f7a63] ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Radio({ label, hint, checked, onChange, children }) {
  return (
    <label className={`flex gap-3 p-3 border rounded-lg mb-2 cursor-pointer ${checked ? 'border-[#0f7a63] bg-[#f4fbf8]' : 'border-[#e3e7e4]'}`}>
      <input type="radio" checked={checked} onChange={onChange} className="mt-0.5" />
      <div>
        <div className="font-semibold text-sm">{label}</div>
        {hint && <div className="text-xs text-[#66736e] mt-0.5">{hint}</div>}
        {children}
      </div>
    </label>
  );
}

export function Checkbox({ label, checked, onChange, disabled }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
      {label}
    </label>
  );
}

export function PageHeader({ title, lede }) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-bold m-0">{title}</h1>
      {lede && <p className="text-sm text-[#66736e] mt-1 mb-0 max-w-3xl">{lede}</p>}
    </div>
  );
}

export function Toasts({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed right-5 bottom-5 flex flex-col gap-2 z-50">
      {toasts.map(t => (
        <div key={t.id} className="bg-[#0c2a22] text-[#c9d8d1] px-4 py-3 rounded-xl shadow-2xl text-sm max-w-[440px] animate-in fade-in slide-in-from-bottom-2 duration-200"
          dangerouslySetInnerHTML={{ __html: t.msg }} />
      ))}
    </div>
  );
}
