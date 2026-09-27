import Field from '../ui/Field';
import { CFDI_USES, TAX_REGIMES } from '../../data/sat';

/**
 * Campos de datos fiscales. `prefix` es la ruta en el formulario (p. ej. 'billing').
 */
const BillingFields = ({ register, errors = {}, prefix = 'billing' }) => {
  const e = errors[prefix] ?? {};
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="RFC" autoComplete="off" className="uppercase" error={e.rfc?.message} {...register(`${prefix}.rfc`)} />
      <Field label="Código postal fiscal" inputMode="numeric" maxLength={5} error={e.zipCode?.message} {...register(`${prefix}.zipCode`)} />
      <Field
        label="Razón social"
        hint="Tal como aparece en tu Constancia de Situación Fiscal, sin régimen de capital (S.A. de C.V.)"
        className="sm:col-span-2"
        error={e.legalName?.message}
        {...register(`${prefix}.legalName`)}
      />
      <Field as="select" label="Régimen fiscal" error={e.taxRegime?.message} {...register(`${prefix}.taxRegime`)}>
        <option value="">Elige</option>
        {TAX_REGIMES.map(([code, name]) => (
          <option key={code} value={code}>
            {code} · {name}
          </option>
        ))}
      </Field>
      <Field as="select" label="Uso de CFDI" error={e.cfdiUse?.message} {...register(`${prefix}.cfdiUse`)}>
        <option value="">Elige</option>
        {CFDI_USES.map(([code, name]) => (
          <option key={code} value={code}>
            {code} · {name}
          </option>
        ))}
      </Field>
    </div>
  );
};

/** Casilla del aviso de privacidad + opción de promociones. */
export const ConsentFields = ({ register, errors = {} }) => (
  <div className="space-y-2 text-sm">
    <label className="flex items-start gap-2.5">
      <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-accent" aria-invalid={errors.acceptPrivacy ? 'true' : 'false'} {...register('acceptPrivacy')} />
      <span>
        He leído y acepto el{' '}
        <a href="/aviso-de-privacidad" target="_blank" rel="noopener" className="font-semibold underline underline-offset-4">
          aviso de privacidad
        </a>{' '}
        y los{' '}
        <a href="/terminos" target="_blank" rel="noopener" className="font-semibold underline underline-offset-4">
          términos
        </a>
        .
      </span>
    </label>
    {errors.acceptPrivacy && <p className="pl-6 text-xs text-accent">{errors.acceptPrivacy.message}</p>}
    <label className="flex items-start gap-2.5 text-muted">
      <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-accent" {...register('marketingOptIn')} />
      Quiero recibir promociones y novedades (opcional).
    </label>
  </div>
);

export default BillingFields;
