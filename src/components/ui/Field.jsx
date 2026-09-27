import { forwardRef, useId } from 'react';

const controlClass =
  'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted/70 transition-colors hover:border-ink/30 focus:border-ink focus:outline-none aria-[invalid=true]:border-accent';

/**
 * Campo de formulario con etiqueta y mensaje de error accesibles.
 * `as` = 'input' | 'select' | 'textarea'.
 */
const Field = forwardRef(({ label, error, hint, as = 'input', className = '', children, ...props }, ref) => {
  const id = useId();
  const messageId = `${id}-msg`;
  const Control = as;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <Control
        ref={ref}
        id={id}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error || hint ? messageId : undefined}
        className={`${controlClass} ${as === 'textarea' ? 'min-h-24 resize-y' : ''}`}
        {...props}
      >
        {children}
      </Control>
      {(error || hint) && (
        <p id={messageId} className={`mt-1.5 text-xs ${error ? 'text-accent' : 'text-muted'}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

Field.displayName = 'Field';

export default Field;
