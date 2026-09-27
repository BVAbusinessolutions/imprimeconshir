import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { AdminHeader, Badge, ConfirmButton, EmptyState, ErrorNote, LoadingBlock, Panel } from '../../components/admin/AdminUI';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import { createItem, deleteItem, listAll, updateItem } from '../../services/adminService';
import { analyzeSupplierPrices, n8nErrorMessage } from '../../services/n8n';
import { supplierItemSchema, supplierSchema } from '../../schemas/validations';
import { formatCurrency } from '../../utils/helpers';
import { useOperationsSettings } from '../../hooks/useSettings';

const QUERY_KEY = ['admin', 'suppliers'];

const SupplierForm = ({ onSaved }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(supplierSchema), defaultValues: { name: '', contact: '', phone: '', email: '' } });

  const onSubmit = async (values) => {
    try {
      await createItem('suppliers', { ...values, items: [] });
      reset();
      onSaved();
      toast.success('Proveedor agregado.');
    } catch {
      toast.error('No se pudo guardar el proveedor.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-3 sm:grid-cols-2">
      <Field label="Proveedor" error={errors.name?.message} {...register('name')} />
      <Field label="Contacto" {...register('contact')} />
      <Field label="Teléfono" type="tel" {...register('phone')} />
      <Field label="Email" type="email" hint="Aquí llegan pedidos y alertas" error={errors.email?.message} {...register('email')} />
      <div className="sm:col-span-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          Agregar proveedor
        </Button>
      </div>
    </form>
  );
};

const ItemForm = ({ onAdd }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(supplierItemSchema),
    defaultValues: { name: '', unit: 'pieza', cost: '', salePrice: '' },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onAdd({ id: uuidv4(), ...values });
        reset();
      })}
      noValidate
      className="grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-5"
    >
      <Field label="Insumo" className="col-span-2" error={errors.name?.message} {...register('name')} />
      <Field label="Unidad" error={errors.unit?.message} {...register('unit')} />
      <Field label="Costo" type="number" min="0" step="any" error={errors.cost?.message} {...register('cost')} />
      <Field label="Venta" type="number" min="0" step="any" error={errors.salePrice?.message} {...register('salePrice')} />
      <div className="col-span-2 flex items-end sm:col-span-5">
        <Button type="submit" size="sm" variant="outline" disabled={isSubmitting}>
          Agregar a la lista
        </Button>
      </div>
    </form>
  );
};

const pct = (m) => (m == null ? '—' : `${Math.round(m * 100)}%`);

const SupplierCard = ({ supplier, analysis, onChange, onDelete }) => {
  const items = supplier.items ?? [];
  const byItem = Object.fromEntries((analysis?.items ?? []).filter((a) => a.supplierId === supplier.id).map((a) => [a.itemId, a]));

  const saveItems = (next) => onChange(supplier.id, { items: next });

  return (
    <Panel
      title={supplier.name}
      actions={
        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="hidden sm:inline">{[supplier.contact, supplier.phone, supplier.email].filter(Boolean).join(' · ')}</span>
          <ConfirmButton onConfirm={() => onDelete(supplier.id)} />
        </div>
      }
    >
      {items.length === 0 ? (
        <EmptyState>Sin insumos. Agrega su lista de precios.</EmptyState>
      ) : (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <caption className="sr-only">Lista de precios de {supplier.name}</caption>
            <thead className="text-xs text-muted">
              <tr>
                <th scope="col" className="px-2 py-2 font-medium">Insumo</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">Costo</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">Venta</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">Margen</th>
                <th scope="col" className="px-2 py-2 font-medium"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const a = byItem[it.id];
                return (
                  <tr key={it.id} className="border-t border-line">
                    <td className="px-2 py-2.5">
                      <span className="font-medium">{it.name}</span> <span className="text-muted">/ {it.unit}</span>
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{formatCurrency(it.cost)}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{formatCurrency(it.salePrice)}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">
                      {pct(a?.margin)} {a?.lowMargin && <Badge tone="warning">Bajo</Badge>}
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <button type="button" onClick={() => saveItems(items.filter((i) => i.id !== it.id))} className="text-muted hover:text-ink">
                        Quitar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4">
        <ItemForm onAdd={(item) => saveItems([...items, item])} />
      </div>
    </Panel>
  );
};

const Suppliers = () => {
  const qc = useQueryClient();
  const suppliers = useQuery({ queryKey: QUERY_KEY, queryFn: () => listAll('suppliers') });
  const { settings } = useOperationsSettings();
  const [analysis, setAnalysis] = useState(null);

  const analyze = useMutation({
    mutationFn: (list) =>
      analyzeSupplierPrices({
        suppliers: list.map(({ id, name, email, items }) => ({ id, name, email, items: items ?? [] })),
        minMargin: settings.minMargin,
        alertEmail: settings.alertEmail,
      }),
    onSuccess: setAnalysis,
    onError: (error) => toast.error(n8nErrorMessage(error)),
  });

  // Cada vez que cambia la lista, n8n recalcula márgenes y alertas
  const { mutate: runAnalysis } = analyze;
  useEffect(() => {
    if (suppliers.data?.length) runAnalysis(suppliers.data);
  }, [suppliers.data, runAnalysis]);

  const refresh = () => qc.invalidateQueries({ queryKey: QUERY_KEY });

  const update = async (id, data) => {
    try {
      await updateItem('suppliers', id, data);
      refresh();
    } catch {
      toast.error('No se pudo guardar el cambio.');
    }
  };
  const remove = async (id) => {
    await deleteItem('suppliers', id);
    refresh();
  };

  return (
    <>
      <AdminHeader
        title="Proveedores"
        description="Listas de precios de terceros. n8n calcula el margen de cada insumo y avisa cuando queda por debajo del mínimo. Las existencias se llevan en Inventario."
      />

      {analysis?.alerts?.length > 0 && (
        <Panel title="Alertas de margen" className="mb-6 border border-accent/30">
          <ul className="space-y-1.5 text-sm">
            {analysis.alerts.map((a, i) => (
              <li key={i} className="flex gap-2">
                <Badge tone="warning">Margen</Badge>
                {a.message}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            {analysis.emailSent ? 'Alertas enviadas por correo.' : 'El envío por correo se activa al configurar la credencial en n8n.'}
          </p>
        </Panel>
      )}

      <div className="space-y-6">
        {suppliers.isLoading && <LoadingBlock className="h-40" />}
        {suppliers.isError && <ErrorNote />}
        {suppliers.data?.length === 0 && <EmptyState>Agrega tu primer proveedor.</EmptyState>}
        {suppliers.data?.map((s) => (
          <SupplierCard key={s.id} supplier={s} analysis={analysis} onChange={update} onDelete={remove} />
        ))}
        <Panel title="Nuevo proveedor">
          <SupplierForm onSaved={refresh} />
        </Panel>
      </div>
    </>
  );
};

export default Suppliers;
