import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { AdminHeader, Badge, EmptyState, ErrorNote, LoadingBlock, Panel, StatusSelect } from '../../components/admin/AdminUI';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import { createItem, listAll, updateItem } from '../../services/adminService';
import { n8nErrorMessage, notifyTechnician } from '../../services/n8n';
import { buildTechnicianMessage } from '../../services/n8n/logic';
import { useOperationsSettings } from '../../hooks/useSettings';
import { APPOINTMENT_STATUS } from '../../data/logistics';
import { adminAppointmentSchema } from '../../schemas/validations';
import { localISODate, mailtoLink, phoneDigits, whatsappLink } from '../../utils/helpers';

const QUERY_KEY = ['admin', 'appointments'];

const dayLabel = (iso) => {
  try {
    return format(parseISO(iso), "EEEE d 'de' MMMM", { locale: es });
  } catch {
    return iso || 'Sin fecha';
  }
};

const AppointmentForm = ({ technicians, onCreated }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminAppointmentSchema),
    defaultValues: { reason: '', slot: '', address: '', technicianId: '', notes: '', contact: { name: '', phone: '', email: '' } },
  });

  const onSubmit = async (values) => {
    try {
      await createItem('appointments', { ...values, status: 'confirmed', source: 'admin', userId: null });
      reset();
      onCreated();
      toast.success('Cita agendada.');
    } catch {
      toast.error('No se pudo guardar la cita.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
      <Field label="Motivo" placeholder="Medición para rotulación" error={errors.reason?.message} {...register('reason')} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Fecha y hora" type="datetime-local" error={errors.slot?.message} {...register('slot')} />
        <Field as="select" label="Técnico" {...register('technicianId')}>
          <option value="">Sin asignar</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Field>
      </div>
      <Field label="Dirección" error={errors.address?.message} {...register('address')} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Cliente" error={errors.contact?.name?.message} {...register('contact.name')} />
        <Field label="Teléfono" type="tel" error={errors.contact?.phone?.message} {...register('contact.phone')} />
        <Field label="Correo" type="email" error={errors.contact?.email?.message} {...register('contact.email')} />
      </div>
      <Field label="Notas para el técnico" {...register('notes')} />
      <Button type="submit" size="sm" disabled={isSubmitting}>
        Agendar cita
      </Button>
    </form>
  );
};

const AppointmentCard = ({ appt, technicians, onUpdate }) => {
  const tech = technicians.find((t) => t.id === appt.technicianId);
  const message = buildTechnicianMessage(appt, tech);
  const notify = useMutation({
    mutationFn: () => notifyTechnician({ appointment: appt, technician: tech }),
    onSuccess: (res) => {
      if (res.sent) {
        toast.success('Aviso enviado al técnico.');
        onUpdate(appt.id, { notifiedAt: new Date().toISOString() });
      } else {
        toast.info(`${res.message} El envío automático se activa al configurar la credencial en n8n; mientras tanto usa WhatsApp o correo.`);
      }
    },
    onError: (e) => toast.error(n8nErrorMessage(e)),
  });

  return (
    <article className="rounded-2xl bg-paper p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">
            <span className="tabular-nums">{appt.slot?.slice(11, 16) || '--:--'}</span> · {appt.reason || 'Visita técnica'}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {appt.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appt.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 hover:underline"
              >
                {appt.address}
              </a>
            )}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {[appt.contact?.name, appt.contact?.phone].filter(Boolean).join(' · ')}
            {appt.notifiedAt && <Badge>Técnico avisado</Badge>}
          </p>
        </div>
        <StatusSelect value={appt.status} options={APPOINTMENT_STATUS} onChange={(status) => onUpdate(appt.id, { status })} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <label className="inline-flex items-center gap-2 text-sm">
          <span className="text-muted">Técnico</span>
          <select
            value={appt.technicianId ?? ''}
            onChange={(e) => onUpdate(appt.id, { technicianId: e.target.value || null })}
            className="rounded-xl border border-line bg-surface px-3 py-1.5 text-sm focus:border-ink focus:outline-none"
          >
            <option value="">Sin asignar</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        {tech && (
          <>
            <Button size="sm" variant="outline" onClick={() => notify.mutate()} disabled={notify.isPending}>
              {notify.isPending ? 'Enviando…' : 'Avisar por n8n'}
            </Button>
            {tech.phone && (
              <a
                href={whatsappLink(phoneDigits(tech.phone), message.text)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onUpdate(appt.id, { notifiedAt: new Date().toISOString() })}
                className="rounded-full border border-ink/15 bg-surface px-3 py-1.5 text-xs font-semibold hover:border-ink/40"
              >
                WhatsApp al técnico
              </a>
            )}
            {tech.email && (
              <a
                href={mailtoLink(tech.email, message.subject, message.text)}
                onClick={() => onUpdate(appt.id, { notifiedAt: new Date().toISOString() })}
                className="rounded-full border border-ink/15 bg-surface px-3 py-1.5 text-xs font-semibold hover:border-ink/40"
              >
                Correo al técnico
              </a>
            )}
          </>
        )}
      </div>
    </article>
  );
};

const FILTERS = { upcoming: 'Próximas', all: 'Todas', unassigned: 'Sin técnico' };

const Appointments = () => {
  const qc = useQueryClient();
  const { settings } = useOperationsSettings();
  const technicians = settings.technicians ?? [];
  const [filter, setFilter] = useState('upcoming');
  const list = useQuery({ queryKey: QUERY_KEY, queryFn: () => listAll('appointments') });
  const refresh = () => qc.invalidateQueries({ queryKey: QUERY_KEY });

  const update = async (id, data) => {
    try {
      await updateItem('appointments', id, data);
      refresh();
    } catch {
      toast.error('No se pudo actualizar la cita.');
    }
  };

  // Agrupar por día, en orden cronológico
  const groups = useMemo(() => {
    const today = localISODate();
    const items = (list.data ?? [])
      .filter((a) => (filter === 'upcoming' ? (a.slot ?? '') >= today && a.status !== 'cancelled' : true))
      .filter((a) => (filter === 'unassigned' ? !a.technicianId && a.status !== 'cancelled' : true))
      .sort((a, b) => String(a.slot).localeCompare(String(b.slot)));
    return items.reduce((acc, a) => {
      const day = (a.slot ?? '').slice(0, 10);
      (acc[day] = acc[day] ?? []).push(a);
      return acc;
    }, {});
  }, [list.data, filter]);

  return (
    <>
      <AdminHeader
        title="Citas técnicas"
        description="Visitas de medición e instalación. Asigna un técnico y avísale con un clic."
      />

      {technicians.length === 0 && (
        <p className="mb-6 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted">
          Aún no hay técnicos registrados. Agrégalos en <strong className="text-ink">Configuración</strong>.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto" role="group" aria-label="Filtrar citas">
            {Object.entries(FILTERS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${
                  filter === key ? 'border-ink bg-ink text-white' : 'border-line bg-surface hover:border-ink/40'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {list.isLoading && <LoadingBlock className="h-40" />}
          {list.isError && <ErrorNote />}
          {!list.isLoading && Object.keys(groups).length === 0 && <EmptyState>No hay citas en esta vista.</EmptyState>}

          <div className="space-y-6">
            {Object.entries(groups).map(([day, items]) => (
              <section key={day}>
                <h2 className="mb-2 text-sm font-semibold text-muted first-letter:uppercase">{dayLabel(day)}</h2>
                <div className="space-y-2">
                  {items.map((a) => (
                    <AppointmentCard key={a.id} appt={a} technicians={technicians} onUpdate={update} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <Panel title="Nueva cita" className="xl:sticky xl:top-36 xl:self-start">
          <AppointmentForm technicians={technicians} onCreated={refresh} />
        </Panel>
      </div>
    </>
  );
};

export default Appointments;
