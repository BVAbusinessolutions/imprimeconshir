import { useFieldArray, useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { AdminHeader, ErrorNote, LoadingBlock, Panel } from '../../components/admin/AdminUI';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import { useOperationsSettings, usePublicSettings } from '../../hooks/useSettings';
import { saveOperationsSettings, savePublicSettings } from '../../services/settingsService';

const toLines = (list) => (list ?? []).join('\n');
const fromLines = (text) =>
  String(text ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
const toNumberOrNull = (v) => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v));

const PublicForm = ({ settings }) => {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    reset,
  } = useForm({ values: settings });

  const onSubmit = async (values) => {
    try {
      const { updatedAt: _ignored, ...data } = values;
      await savePublicSettings(data);
      reset(values);
      qc.invalidateQueries({ queryKey: ['settings', 'public'] });
      toast.success('Contacto guardado.');
    } catch {
      toast.error('No se pudo guardar.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
      <Field label="Teléfono" type="tel" {...register('phone')} />
      <Field label="WhatsApp (con lada, sin +)" hint="p. ej. 5215512345678" {...register('whatsapp')} />
      <Field label="Correo de contacto" type="email" {...register('email')} />
      <Field label="Horario" placeholder="Lun a Vie 9:00–18:00" {...register('hours')} />
      <Field label="Dirección" className="sm:col-span-2" {...register('address')} />
      <Field label="Facebook (enlace)" type="url" {...register('facebook')} />
      <Field label="Instagram (enlace)" type="url" {...register('instagram')} />
      <Field label="TikTok (enlace)" type="url" {...register('tiktok')} />
      <div className="sm:col-span-2">
        <Button type="submit" size="sm" disabled={isSubmitting || !isDirty}>
          Guardar contacto
        </Button>
      </div>
    </form>
  );
};

const OperationsForm = ({ settings }) => {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, isDirty },
    reset,
  } = useForm({
    values: {
      originAddress: settings.origin?.address ?? '',
      originLat: settings.origin?.lat ?? '',
      originLng: settings.origin?.lng ?? '',
      zones: toLines(settings.zones),
      couriers: toLines(settings.couriers),
      technicians: settings.technicians ?? [],
      alertEmail: settings.alertEmail ?? '',
      minMarginPct: Math.round((settings.minMargin ?? 0.25) * 100),
    },
  });
  const technicians = useFieldArray({ control, name: 'technicians', keyName: 'fieldKey' });

  const onSubmit = async (v) => {
    try {
      await saveOperationsSettings({
        origin: { address: v.originAddress.trim(), lat: toNumberOrNull(v.originLat), lng: toNumberOrNull(v.originLng) },
        zones: fromLines(v.zones),
        couriers: fromLines(v.couriers),
        technicians: v.technicians.filter((t) => t.name?.trim()).map((t) => ({ ...t, id: t.id || uuidv4() })),
        alertEmail: v.alertEmail.trim(),
        minMargin: Math.min(Math.max(Number(v.minMarginPct) || 0, 0), 100) / 100,
      });
      reset(v);
      qc.invalidateQueries({ queryKey: ['settings', 'operations'] });
      toast.success('Configuración guardada.');
    } catch {
      toast.error('No se pudo guardar.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <fieldset className="grid gap-4 sm:grid-cols-4">
        <legend className="mb-3 font-semibold">Punto de salida de las rutas</legend>
        <Field label="Dirección del taller" className="sm:col-span-2" {...register('originAddress')} />
        <Field label="Latitud" type="number" step="any" hint="Opcional" {...register('originLat')} />
        <Field label="Longitud" type="number" step="any" hint="Opcional" {...register('originLng')} />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field as="textarea" label="Zonas de reparto" hint="Una por línea" {...register('zones')} />
        <Field as="textarea" label="Mensajeros" hint="Uno por línea" {...register('couriers')} />
      </div>

      <fieldset>
        <legend className="mb-3 font-semibold">Técnicos ("ninjas") para citas</legend>
        <div className="space-y-3">
          {technicians.fields.map((f, i) => (
            <div key={f.fieldKey} className="grid items-end gap-3 rounded-2xl bg-paper p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <Field label="Nombre" {...register(`technicians.${i}.name`)} />
              <Field label="Teléfono" type="tel" {...register(`technicians.${i}.phone`)} />
              <Field label="Correo" type="email" {...register(`technicians.${i}.email`)} />
              <Button variant="ghost" size="sm" onClick={() => technicians.remove(i)}>
                Quitar
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => technicians.append({ id: uuidv4(), name: '', phone: '', email: '' })}>
            Agregar técnico
          </Button>
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Correo para alertas" type="email" hint="Inventario bajo y margen bajo" {...register('alertEmail')} />
        <Field label="Margen mínimo (%)" type="number" min="0" max="100" {...register('minMarginPct')} />
      </div>

      <Button type="submit" size="sm" disabled={isSubmitting || !isDirty}>
        Guardar configuración
      </Button>
    </form>
  );
};

const Settings = () => {
  const pub = usePublicSettings();
  const ops = useOperationsSettings();

  return (
    <>
      <AdminHeader title="Configuración" description="Datos del negocio y parámetros de operación. Se usan en toda la web y en n8n." />
      <div className="space-y-6">
        <Panel title="Contacto público" actions={<span className="text-xs text-muted">Se muestra en el pie de página</span>}>
          {pub.isLoading ? <LoadingBlock /> : <PublicForm settings={pub.settings} />}
        </Panel>
        <Panel title="Operación">
          {ops.isError && (
            <div className="mb-4">
              <ErrorNote>No se pudo leer la configuración guardada; se muestran valores por defecto.</ErrorNote>
            </div>
          )}
          {ops.isLoading ? <LoadingBlock className="h-64" /> : <OperationsForm settings={ops.settings} />}
        </Panel>
      </div>
    </>
  );
};

export default Settings;
