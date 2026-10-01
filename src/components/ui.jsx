import { Fragment } from 'react';

/* Pill & Note use .pill/.note CSS classes (in index.css @layer components)
   because their tone variants are cleaner as CSS. Everything else is Tailwind. */

export function Pill({ tone = '', children, className = '' }) {
  return (
    <span className={['pill', tone, className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}

export function Note({ tone = 'info', children }) {
  return <div className={`note ${tone}`}>{children}</div>;
}

export function Stat({ label, value, detail, valueStyle }) {
  return (
    <div className="bg-[var(--panel)] border border-[var(--line)] rounded-[var(--r)] px-4 py-[14px]">
      <div className="text-[11px] uppercase tracking-[.08em] text-[var(--dim)]">{label}</div>
      <div className="text-2xl font-[650] mt-1" style={valueStyle}>{value}</div>
      {detail && <div className="text-[12px] text-[var(--dim)]">{detail}</div>}
    </div>
  );
}

export function Panel({ title, subtitle, actions, children, flush = false }) {
  return (
    <section className="bg-[var(--panel)] border border-[var(--line)] rounded-[var(--r)] mb-4 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-[18px] py-[13px] border-b border-[var(--line)]">
        <div>
          <h3 className="m-0 text-[14.5px] font-bold">{title}</h3>
          {subtitle && <div className="text-[12.5px] text-[var(--dim)]">{subtitle}</div>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
      {flush ? children : <div className="p-[16px_18px]">{children}</div>}
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
              <th key={c} className="text-left text-[11px] tracking-[.07em] uppercase text-[var(--dim)] font-semibold px-[14px] py-[9px] border-b border-[var(--line)] bg-[#fafbfa] whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={cols.length} className="text-center text-[var(--dim)] py-[26px] px-[14px] text-sm">{empty}</td></tr>
            : rows.map((row, i) => {
                const isSelected = selectedKey && row[keyField] === selectedKey;
                return (
                  <tr
                    key={row[keyField] ?? i}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={[
                      'border-b border-[#eef1ef] last:border-0',
                      onRowClick ? 'cursor-pointer [&:hover_td]:bg-[#f7faf9]' : '',
                      isSelected ? '[&_td]:bg-[#f1faf6]' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    {row.cells.map((cell, j) => (
                      <td key={j} className="px-[14px] py-[10px] align-top text-sm">{cell}</td>
                    ))}
                  </tr>
                );
              })
          }
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-[rgba(10,20,17,.45)] grid place-items-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose?.()}
    >
      <div className="bg-white rounded-xl w-[min(560px,92vw)] p-[22px] shadow-[0_20px_60px_rgba(0,0,0,.3)]">
        {title && <h3 className="mt-0 mb-[6px] text-[15px]">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

export function Btn({ children, onClick, variant = 'default', size = 'md', disabled, title, className = '', type = 'button', style }) {
  const base = 'border rounded-lg disabled:opacity-[.45] disabled:cursor-not-allowed transition-colors';
  const variants = {
    default: 'bg-white border-[var(--line)] text-[var(--ink)] hover:bg-gray-50',
    primary: 'bg-[var(--accent)] border-[var(--accent)] text-white hover:opacity-90',
    danger:  'bg-white border-[#e9b8b4] text-[var(--bad)] hover:bg-[var(--bad-soft)]',
    demo:    'bg-[#fff8e8] border-dashed border-[#d9b86a] text-[#7a5a14]',
  };
  const sizes = {
    sm: 'px-[10px] py-[4px] text-[12.5px]',
    md: 'px-[14px] py-[7px] text-sm',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title} style={style}
      className={[base, variants[variant], sizes[size], className].filter(Boolean).join(' ')}>
      {children}
    </button>
  );
}

export function KV({ pairs }) {
  return (
    <div className="grid gap-x-4 gap-y-2 text-[13.5px]" style={{ gridTemplateColumns: '200px 1fr' }}>
      {pairs.map(([k, v], i) => (
        <Fragment key={i}>
          <div className="text-[var(--dim)]">{k}</div>
          <div>{v}</div>
        </Fragment>
      ))}
    </div>
  );
}

export function MetalTag({ metal }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold text-sm">
      <span className="w-2.5 h-2.5 rounded-full inline-block"
        style={{ background: metal === 'gold' ? '#d4a64a' : '#a9b3ba' }} />
      {metal}
    </span>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-[.06em] text-[var(--dim)]">{label}</span>
      {children}
      {hint && <span className="text-[12px] text-[var(--dim)]">{hint}</span>}
    </label>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full border border-[var(--line)] rounded-lg bg-white text-[var(--ink)] focus:border-[var(--accent)] disabled:bg-[#f3f5f4] disabled:text-[var(--dim)] px-[10px] py-2 ${className}`}
      {...props}
    />
  );
}

export function Select({ children, className = '', ...props }) {
  return (
    <select
      className={`w-full border border-[var(--line)] rounded-lg bg-white text-[var(--ink)] focus:border-[var(--accent)] px-[10px] py-2 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Radio({ label, hint, checked, onChange, children }) {
  return (
    <label className={`flex gap-3 items-start p-3 border rounded-lg mb-2 cursor-pointer transition-colors ${checked ? 'border-[var(--accent)] bg-[#f4fbf8]' : 'border-[var(--line)]'}`}>
      <input type="radio" checked={checked} onChange={onChange} className="mt-0.5 w-auto" />
      <div>
        <div className="font-semibold text-sm">{label}</div>
        {hint && <div className="text-[12px] text-[var(--dim)] mt-0.5">{hint}</div>}
        {children}
      </div>
    </label>
  );
}

export function Checkbox({ label, checked, onChange, disabled }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="w-auto" />
      {label}
    </label>
  );
}

export function PageHeader({ title, lede }) {
  return (
    <div className="mb-5">
      <h1 className="m-0 text-[22px] font-bold">{title}</h1>
      {lede && <p className="mt-1 mb-0 text-[var(--dim)] max-w-3xl text-sm">{lede}</p>}
    </div>
  );
}

export function Toasts({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed right-[22px] bottom-[22px] flex flex-col gap-2 z-50">
      {toasts.map(t => (
        <div key={t.id}
          className="bg-[var(--side)] text-[var(--side-ink)] px-4 py-3 rounded-[10px] shadow-[0_10px_30px_rgba(0,0,0,.25)] text-[13.5px] max-w-[440px]"
          dangerouslySetInnerHTML={{ __html: t.msg }}
        />
      ))}
    </div>
  );
}
