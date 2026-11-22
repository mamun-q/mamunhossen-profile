import type { ReactNode } from 'react';
import { Check, Save } from 'lucide-react';
import type { LText } from '../data';

/**
 * Shared form primitives for the admin dashboard. English labels —
 * this is a private tool for the owner only.
 */

export const inputCls =
  'w-full rounded-xl border border-slate-900/10 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-brand2 focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500';

export const labelCls =
  'mb-1 block text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <Field label={label}>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </Field>
  );
}

export function AreaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <Field label={label}>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} resize-y`}
      />
    </Field>
  );
}

/** Bilingual (EN / BN) text editor — single-line or textarea. */
export function LTextField({
  label,
  value,
  onChange,
  area = false,
  rows = 3,
}: {
  label: string;
  value: LText;
  onChange: (v: LText) => void;
  area?: boolean;
  rows?: number;
}) {
  const renderInput = (lang: 'en' | 'bn', tag: string) =>
    area ? (
      <span className="relative block">
        <textarea
          value={value[lang]}
          rows={rows}
          onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
          className={`${inputCls} resize-y pl-12`}
          lang={lang}
        />
        <span className="absolute top-2.5 left-3 text-[10px] font-bold tracking-wider text-slate-400">
          {tag}
        </span>
      </span>
    ) : (
      <span className="relative block">
        <input
          type="text"
          value={value[lang]}
          onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
          className={`${inputCls} pl-12`}
          lang={lang}
        />
        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-[10px] font-bold tracking-wider text-slate-400">
          {tag}
        </span>
      </span>
    );

  return (
    <div>
      <span className={labelCls}>{label}</span>
      <div className="space-y-2">
        {renderInput('en', 'EN')}
        {renderInput('bn', 'বাংলা')}
      </div>
    </div>
  );
}

/** Per-module save button with truthful status feedback. */
export function SaveBar({
  status,
  error,
  onSave,
  label = 'Save changes',
}: {
  status: SaveStatus;
  error?: string;
  onSave: () => void;
  label?: string;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onSave}
        disabled={status === 'saving'}
        className="btn-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand2 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {status === 'saved' ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : label}
      </button>
      {status === 'error' && (
        <p className="text-sm text-red-500" role="alert">
          Save failed{error ? `: ${error}` : ''}. Your edits are still here — try again.
        </p>
      )}
      {status === 'saved' && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">Changes are live on the site.</p>
      )}
    </div>
  );
}

/** Card wrapper for one editable record in a list editor. */
export function RecordCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="font-display truncate text-sm font-bold tracking-wide text-slate-800 dark:text-white">
          {title}
        </h4>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-full border border-red-300/60 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-500/10"
          >
            Remove
          </button>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass w-full rounded-3xl px-5 py-4 text-sm font-semibold text-slate-700 transition hover:scale-[1.01] hover:text-brand dark:text-slate-200"
    >
      + {label}
    </button>
  );
}
