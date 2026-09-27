import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { AdminHeader, Badge, EmptyState, ErrorNote, LoadingBlock, Panel, StatusSelect } from '../../components/admin/AdminUI';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import { createItem, deleteItem, getDeliveriesForMonth, updateItem } from '../../services/adminService';
import { n8nErrorMessage, planDeliveryRoutes } from '../../services/n8n';
import { COURIERS, DELIVERY_STATUS, ORIGIN, ZONES } from '../../data/logistics';
import { deliverySchema } from '../../schemas/validations';
import { localISODate } from '../../utils/helpers';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const MonthCalendar = ({ month, deliveries, selected, onSelect }) => {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });
  const countByDay = deliveries.reduce((acc, d) => ({ ...acc, [d.date]: (acc[d.date] ?? 0) + 1 }), {});
  const today = localISODate();

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted" aria-hidden="true">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="py-2">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const iso = localISODate(day);
          const count = countByDay[iso] ?? 0;
          const inMonth = isSameMonth(day, month);
          const isSelected = iso === selected;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              aria-pressed={isSelected}
              aria-label={`${format(day, "d 'de' MMMM", { locale: es })}: ${count} entrega${count === 1 ? '' : 's'}`}
              className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors sm:aspect-[4/3] ${
                isSelected ? 'bg-ink text-white' : inMonth ? 'bg-paper hover:bg-line/60' : 'text-muted/50'
              } ${iso === today && !isSelected ? 'ring-1 ring-ink' : ''}`}
            >
              <span className="tabular-nums">{format(day, 'd')}</span>
              {count > 0 && (
                <span className={`mt-0.5 text-[11px] font-semibold tabular-nums ${isSelected ? 'text-white' : 'text-accent'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const DeliveryForm = ({ date, onCreated }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(deliverySchema),
    values: { date, timeWindow: '', customer: '', phone: '', address: '', zone: '', notes: '' },
  });

  const onSubmit = async (values) => {
    try {
      await createItem('deliveries', { ...values, status: 'pending' });
      reset();
      onCreated();
      toast.success('Entrega agregada.');
    } catch (error) {
      console.error(error);
      toast.error('No se pudo guardar la entrega.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Fecha" type="date" error={errors.date?.message} {...register('date')} />
        <Field label="Horario" placeholder="p. ej. 10:00-12:00" {...register('timeWindow')} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Cliente" error={errors.customer?.message} {...register('customer')} />
        <Field label="Teléfono" type="tel" {...register('phone')} />
      </div>
      <Field label="Dirección" error={errors.address?.message} {...register('address')} />
      <Field as="select" label="Zona" error={errors.zone?.message} {...register('zone')}>
        <option value="">Elige una zona</option>
        {ZONES.map((z) => (
          <option key={z} value={z}>
            {z}
          </option>
        ))}
      </Field>
      <Field label="Notas" {...register('notes')} />
      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando…' : 'Agregar entrega'}
      </Button>
    </form>
  );
};

const RoutesResult = ({ result }) => (
  <div className="space-y-3">
    <p className="text-sm text-muted">{result.message}</p>
    {result.routes.map((r) => (
      <article key={r.zone} className="rounded-2xl border border-line bg-paper p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-bold">
            Zona {r.zone} <span className="font-normal text-muted">· {r.stops.length} parada{r.stops.length === 1 ? '' : 's'}</span>
          </p>
          {r.courier && <Badge>{r.courier}</Badge>}
        </div>
        <ol className="mt-3 space-y-1.5 text-sm">
          {r.stops.map((s) => (
            <li key={s.id} className="flex gap-2">
              <span className="w-5 shrink-0 font-semibold tabular-nums text-muted">{s.order}.</span>
              <span>
                <span className="font-medium">{s.customer}</span> — {s.address}
                {s.timeWindow && <span className="text-muted"> ({s.timeWindow})</span>}
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-3 flex flex-wrap gap-2">
          {r.mapsLinks.map((url, i) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-ink/15 bg-surface px-3 py-1.5 text-xs font-semibold hover:border-ink/40"
            >
              Abrir en Google Maps{r.mapsLinks.length > 1 ? ` (tramo ${i + 1})` : ''}
            </a>
          ))}
        </div>
      </article>
    ))}
  </div>
);

const Logistics = () => {
  const qc = useQueryClient();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => localISODate());
  const [routes, setRoutes] = useState(null);
  const yearMonth = format(month, 'yyyy-MM');
  const queryKey = ['admin', 'deliveries', yearMonth];

  const deliveries = useQuery({ queryKey, queryFn: () => getDeliveriesForMonth(yearMonth) });
  const dayDeliveries = (deliveries.data ?? []).filter((d) => d.date === selected);
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin', 'deliveries'] });

  const setStatus = useMutation({
    mutationFn: ({ id, status }) => updateItem('deliveries', id, { status }),
    onSuccess: refresh,
    onError: () => toast.error('No se pudo actualizar.'),
  });
  const remove = useMutation({ mutationFn: (id) => deleteItem('deliveries', id), onSuccess: refresh });

  const plan = useMutation({
    mutationFn: () =>
      planDeliveryRoutes({
        date: selected,
        origin: ORIGIN,
        couriers: COURIERS,
        deliveries: dayDeliveries
          .filter((d) => d.status !== 'delivered')
          .map(({ id, customer, address, zone, lat, lng, timeWindow }) => ({ id, customer, address, zone, lat, lng, timeWindow })),
      }),
    onSuccess: setRoutes,
    onError: (error) => toast.error(n8nErrorMessage(error)),
  });

  const selectDay = (iso) => {
    setSelected(iso);
    setRoutes(null);
  };
  const changeMonth = (delta) => {
    const next = addMonths(month, delta);
    setMonth(next);
    selectDay(localISODate(next));
  };

  return (
    <>
      <AdminHeader title="Logística" description="Agenda las entregas y deja que n8n las agrupe en rutas por zona para cada mensajero." />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <Panel
          title={<span className="inline-block first-letter:uppercase">{format(month, 'MMMM yyyy', { locale: es })}</span>}
          actions={
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => changeMonth(-1)} aria-label="Mes anterior">
                ‹ Anterior
              </Button>
              <Button variant="ghost" size="sm" onClick={() => changeMonth(1)} aria-label="Mes siguiente">
                Siguiente ›
              </Button>
            </div>
          }
        >
          {deliveries.isError && (
            <div className="mb-4">
              <ErrorNote>No pudimos cargar las entregas del mes.</ErrorNote>
            </div>
          )}
          <MonthCalendar month={month} deliveries={deliveries.data ?? []} selected={selected} onSelect={selectDay} />
        </Panel>

        <div className="space-y-6">
          <Panel
            title={<span className="inline-block first-letter:uppercase">{format(new Date(`${selected}T12:00`), "EEEE d 'de' MMMM", { locale: es })}</span>}
            actions={
              <Button size="sm" onClick={() => plan.mutate()} disabled={plan.isPending || dayDeliveries.length === 0}>
                {plan.isPending ? 'Armando rutas…' : 'Sectorizar rutas'}
              </Button>
            }
          >
            {deliveries.isLoading && <LoadingBlock />}
            {!deliveries.isLoading && dayDeliveries.length === 0 && <EmptyState>Sin entregas este día.</EmptyState>}
            <ul className="space-y-2">
              {dayDeliveries.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-paper p-3.5">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {d.customer} <Badge>{d.zone}</Badge>
                    </p>
                    <p className="truncate text-sm text-muted">
                      {[d.timeWindow, d.address, d.phone].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusSelect value={d.status} options={DELIVERY_STATUS} onChange={(status) => setStatus.mutate({ id: d.id, status })} />
                    <button type="button" onClick={() => remove.mutate(d.id)} className="text-sm text-muted hover:text-ink">
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {routes && (
              <div className="mt-6 border-t border-line pt-5">
                <RoutesResult result={routes} />
              </div>
            )}
          </Panel>

          <Panel title="Nueva entrega">
            <DeliveryForm date={selected} onCreated={refresh} />
          </Panel>
        </div>
      </div>
    </>
  );
};

export default Logistics;
