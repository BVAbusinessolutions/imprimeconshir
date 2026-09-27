import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

/** Encabezado de sección del panel. */
export const AdminHeader = ({ title, description, actions }) => (
  <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
    <Helmet>
      <title>{`${title} | Panel IMPRIME con SHIR`}</title>
    </Helmet>
    <div>
      <h1 className="text-3xl font-black sm:text-4xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </header>
);

/** Tarjeta contenedora. */
export const Panel = ({ title, actions, children, className = '' }) => (
  <section className={`rounded-3xl bg-surface p-5 sm:p-6 ${className}`}>
    {(title || actions) && (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {title && <h2 className="text-lg font-bold">{title}</h2>}
        {actions}
      </div>
    )}
    {children}
  </section>
);

/** Cifra destacada (KPI). */
export const StatTile = ({ label, value, hint }) => (
  <div className="rounded-3xl bg-surface p-5">
    <p className="text-sm text-muted">{label}</p>
    <p className="font-display mt-2 text-3xl font-extrabold tabular-nums">{value}</p>
    {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
  </div>
);

export const EmptyState = ({ children }) => (
  <p className="rounded-2xl border border-dashed border-line px-5 py-8 text-center text-sm text-muted">{children}</p>
);

export const LoadingBlock = ({ className = 'h-24' }) => (
  <div className={`animate-pulse rounded-2xl bg-line ${className}`} aria-busy="true" />
);

export const ErrorNote = ({ children = 'No pudimos cargar la información.' }) => (
  <p role="alert" className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent">
    {children}
  </p>
);

/** Etiqueta de estado con texto (nunca solo color). */
export const Badge = ({ children, tone = 'neutral' }) => {
  const tones = {
    neutral: 'border-line bg-paper text-ink',
    warning: 'border-accent/30 bg-accent/10 text-accent',
    dark: 'border-ink bg-ink text-white',
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
};

/** Selector compacto de estado. */
export const StatusSelect = ({ value, options, onChange, label = 'Estado', disabled }) => (
  <label className="inline-flex items-center gap-2 text-sm">
    <span className="sr-only">{label}</span>
    <select
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-line bg-paper px-3 py-1.5 text-sm hover:border-ink/30 focus:border-ink focus:outline-none"
    >
      {value && !(value in options) && <option value={value}>{value}</option>}
      {Object.entries(options).map(([key, text]) => (
        <option key={key} value={key}>
          {text}
        </option>
      ))}
    </select>
  </label>
);

/** Acción destructiva en dos pasos (sin diálogos del navegador). */
export const ConfirmButton = ({ onConfirm, disabled, label = 'Eliminar', confirmLabel = 'Sí, eliminar' }) => {
  const [armed, setArmed] = useState(false);
  return armed ? (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={onConfirm} disabled={disabled} className="text-sm font-semibold text-accent">
        {confirmLabel}
      </button>
      <button type="button" onClick={() => setArmed(false)} className="text-sm text-muted">
        No
      </button>
    </span>
  ) : (
    <button type="button" onClick={() => setArmed(true)} className="text-sm font-medium text-muted hover:text-ink">
      {label}
    </button>
  );
};
