import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from '../ui/Button';
import Field from '../ui/Field';
import { appointmentSchema } from '../../schemas/validations';
import { n8nErrorMessage, scheduleAppointment } from '../../services/n8n';
import { useAuth } from '../../context/AuthContext';

// Horarios por defecto si n8n no sugiere ninguno: próximos 3 días, 10:00 y 16:00
const defaultSlots = () =>
  [1, 2, 3].flatMap((d) => {
    const day = format(addDays(new Date(), d), 'yyyy-MM-dd');
    return [`${day}T10:00`, `${day}T16:00`];
  });

const slotLabel = (slot) => {
  try {
    return format(parseISO(slot), "EEEE d 'de' MMMM, HH:mm", { locale: es });
  } catch {
    return slot;
  }
};

/**
 * Tarjeta para agendar una cita técnica (derivación de trabajos complejos).
 * Al enviar, n8n registra la cita y notifica a los técnicos ("ninjas").
 */
const AppointmentCard = ({ appointment, sessionId, quoteId, onScheduled, compact = false }) => {
  const { currentUser, userProfile } = useAuth();
  const [serverError, setServerError] = useState('');
  const slots = appointment?.suggestedSlots?.length ? appointment.suggestedSlots : defaultSlots();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      slot: '',
      address: userProfile?.address ?? '',
      contact: {
        name: userProfile?.displayName ?? currentUser?.displayName ?? '',
        email: currentUser?.email ?? '',
        phone: userProfile?.phone ?? '',
      },
    },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const result = await scheduleAppointment({
        ...values,
        sessionId,
        quoteId: quoteId ?? null,
        reason: appointment?.reason ?? 'Visita técnica',
        uid: currentUser?.uid ?? null,
      });
      onScheduled?.({ ...result, slot: values.slot });
    } catch (error) {
      setServerError(n8nErrorMessage(error));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={`rounded-2xl border border-line bg-surface ${compact ? 'space-y-3 p-4' : 'space-y-5 p-6 sm:p-8'}`}
    >
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">Agendar cita</p>
        <p className={`mt-1 font-semibold ${compact ? 'text-sm' : 'text-lg'}`}>{appointment?.reason ?? 'Visita técnica'}</p>
      </div>

      <Field as="select" label="Horario" error={errors.slot?.message} {...register('slot')}>
        <option value="">Elige un horario</option>
        {slots.map((s) => (
          <option key={s} value={s}>
            {slotLabel(s)}
          </option>
        ))}
      </Field>
      <Field label="Dirección de la visita" autoComplete="street-address" error={errors.address?.message} {...register('address')} />
      <div className={`grid gap-3 ${compact ? '' : 'sm:grid-cols-3'}`}>
        <Field label="Nombre" autoComplete="name" error={errors.contact?.name?.message} {...register('contact.name')} />
        <Field label="Email" type="email" autoComplete="email" error={errors.contact?.email?.message} {...register('contact.email')} />
        <Field label="Teléfono" type="tel" autoComplete="tel" error={errors.contact?.phone?.message} {...register('contact.phone')} />
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-accent">
          {serverError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full" size={compact ? 'sm' : 'md'}>
        {isSubmitting ? 'Agendando…' : 'Agendar visita'}
      </Button>
    </form>
  );
};

/** Confirmación que reemplaza a la tarjeta una vez agendada */
export const AppointmentConfirmed = ({ result }) => (
  <div className="rounded-2xl border border-line bg-surface p-4">
    <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">Cita agendada</p>
    {result.slot && <p className="mt-1 font-semibold capitalize">{slotLabel(result.slot)}</p>}
    <p className="mt-2 text-sm text-muted">{result.message}</p>
    {result.appointmentId && <p className="mt-2 text-xs text-muted tabular-nums">{result.appointmentId}</p>}
  </div>
);

export default AppointmentCard;
