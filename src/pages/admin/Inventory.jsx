import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AdminHeader, Badge, ConfirmButton, EmptyState, ErrorNote, LoadingBlock, Panel } from '../../components/admin/AdminUI';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import { createItem, deleteItem, listAll, recordInventoryMovement, updateItem } from '../../services/adminService';
import { analyzeSupplierPrices, n8nErrorMessage } from '../../services/n8n';
import { useOperationsSettings } from '../../hooks/useSettings';
import { useAuth } from '../../context/AuthContext';
import { inventoryItemSchema } from '../../schemas/validations';
import { formatDate } from '../../utils/helpers';

const EMPTY = { name: '', category: '', unit: 'pieza', stock: '', minStock: '', location: '', supplierId: '' };
const isLow = (it) => it.minStock != null && Number(it.stock) <= Number(it.minStock);

const ItemForm = ({ item, suppliers, onDone }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(inventoryItemSchema), defaultValues: item ? { ...EMPTY, ...item } : EMPTY });

  const onSubmit = async (values) => {
    try {
      if (item) {
        // La existencia de un insumo existente solo cambia con movimientos (queda registro)
        const { stock: _stock, ...rest } = values;
        await updateItem('inventory', item.id, rest);
      } else {
        await createItem('inventory', values);
      }
      toast.success(item ? 'Insumo actualizado.' : 'Insumo agregado.');
      onDone();
    } catch {
      toast.error('No se pudo guardar el insumo.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
      <Field label="Insumo" placeholder="Vinil blanco brillante 1.52 m" error={errors.name?.message} {...register('name')} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Categoría" placeholder="Viniles, tintas, papel…" {...register('category')} />
        <Field label="Unidad" error={errors.unit?.message} {...register('unit')} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label={item ? 'Existencia (usa entradas/salidas)' : 'Existencia inicial'}
          type="number"
          min="0"
          step="any"
          disabled={!!item}
          error={errors.stock?.message}
          {...register('stock')}
        />
        <Field label="Mínimo" type="number" min="0" step="any" error={errors.minStock?.message} {...register('minStock')} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Ubicación" placeholder="Bodega, anaquel 3" {...register('location')} />
        <Field as="select" label="Proveedor" {...register('supplierId')}>
          <option value="">Sin proveedor</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Field>
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {item ? 'Guardar' : 'Agregar insumo'}
        </Button>
        {item && (
          <Button variant="ghost" size="sm" onClick={onDone}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
};

/** Entrada o salida rápida con motivo. */
const MovementForm = ({ item, onDone }) => {
  const { currentUser } = useAuth();
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (sign) => {
    const n = Number(qty);
    if (!n || n <= 0) return toast.info('Escribe una cantidad mayor a 0.');
    setBusy(true);
    try {
      await recordInventoryMovement(item, sign * n, reason.trim(), currentUser);
      setQty('');
      setReason('');
      onDone();
    } catch (e) {
      toast.error(e.message || 'No se pudo registrar el movimiento.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="text-sm">
        <span className="sr-only">Cantidad de {item.name}</span>
        <input
          type="number"
          min="0"
          step="any"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="Cant."
          className="w-24 rounded-xl border border-line bg-surface px-3 py-1.5 tabular-nums focus:border-ink focus:outline-none"
        />
      </label>
      <label className="min-w-40 flex-1 text-sm">
        <span className="sr-only">Motivo</span>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo (pedido, compra, merma…)"
          className="w-full rounded-xl border border-line bg-surface px-3 py-1.5 focus:border-ink focus:outline-none"
        />
      </label>
      <Button size="sm" variant="outline" onClick={() => submit(1)} disabled={busy}>
        + Entrada
      </Button>
      <Button size="sm" variant="outline" onClick={() => submit(-1)} disabled={busy}>
        − Salida
      </Button>
    </div>
  );
};

const Inventory = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { settings } = useOperationsSettings();
  const inventory = useQuery({ queryKey: ['admin', 'inventory'], queryFn: () => listAll('inventory') });
  const suppliers = useQuery({ queryKey: ['admin', 'suppliers'], queryFn: () => listAll('suppliers') });
  const movements = useQuery({ queryKey: ['admin', 'inventoryMovements'], queryFn: () => listAll('inventoryMovements') });
  const [editing, setEditing] = useState(null);
  const [openMovement, setOpenMovement] = useState(null);
  const [onlyLow, setOnlyLow] = useState(false);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'inventory'] });
    qc.invalidateQueries({ queryKey: ['admin', 'inventoryMovements'] });
  };

  const supplierList = suppliers.data ?? [];
  const supplierById = Object.fromEntries(supplierList.map((s) => [s.id, s]));
  const items = (inventory.data ?? [])
    .filter((it) => !onlyLow || isLow(it))
    .sort((a, b) => Number(isLow(b)) - Number(isLow(a)) || a.name.localeCompare(b.name));
  const lowCount = (inventory.data ?? []).filter(isLow).length;

  const sendAlerts = useMutation({
    mutationFn: () =>
      analyzeSupplierPrices({
        suppliers: supplierList.map(({ id, name, email, items: list }) => ({ id, name, email, items: list ?? [] })),
        inventory: (inventory.data ?? []).map(({ id, name, unit, stock, minStock, supplierId }) => ({ id, name, unit, stock, minStock, supplierId })),
        minMargin: settings.minMargin,
        alertEmail: settings.alertEmail,
      }),
    onSuccess: (res) =>
      res.emailSent
        ? toast.success(`Alertas enviadas a ${res.alertEmail}.`)
        : toast.info(`${res.message} El correo automático se activa al configurar la credencial en n8n.`),
    onError: (e) => toast.error(n8nErrorMessage(e)),
  });

  // Prepara un pedido al proveedor en la sección de Correos
  const orderFromSupplier = (it) => {
    const s = supplierById[it.supplierId];
    const params = new URLSearchParams({
      to: s?.email ?? '',
      subject: `Pedido: ${it.name}`,
      body: `Hola ${s?.contact || s?.name || ''},\n\nQueremos pedir ${it.name}. Actualmente tenemos ${it.stock} ${it.unit} (mínimo ${it.minStock}).\nPor favor confírmanos precio y tiempo de entrega.\n\nGracias,\nIMPRIME con SHIR`,
    });
    navigate(`/admin/correos?${params}`);
  };

  return (
    <>
      <AdminHeader
        title="Inventario"
        description="Existencias de materiales. Cada entrada o salida queda registrada; n8n avisa cuando algo baja de su mínimo."
        actions={
          <Button size="sm" variant="outline" onClick={() => sendAlerts.mutate()} disabled={sendAlerts.isPending || !inventory.data?.length}>
            {sendAlerts.isPending ? 'Revisando…' : 'Enviar alertas'}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {inventory.data?.length ?? 0} insumos · <span className="font-semibold text-ink">{lowCount} bajo mínimo</span>
            </p>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} className="h-4 w-4 accent-accent" />
              Solo bajo mínimo
            </label>
          </div>

          {inventory.isLoading && <LoadingBlock className="h-40" />}
          {inventory.isError && <ErrorNote />}
          {!inventory.isLoading && items.length === 0 && <EmptyState>{onlyLow ? 'Nada bajo mínimo.' : 'Agrega tu primer insumo.'}</EmptyState>}

          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.id} className="rounded-2xl bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {it.name} {isLow(it) && <Badge tone="warning">Bajo mínimo</Badge>}
                    </p>
                    <p className="text-sm text-muted">
                      {[it.category, it.location, supplierById[it.supplierId]?.name].filter(Boolean).join(' · ') || 'Sin detalles'}
                    </p>
                  </div>
                  <p className="text-right">
                    <span className="font-display text-2xl font-extrabold tabular-nums">{it.stock}</span>{' '}
                    <span className="text-sm text-muted">
                      {it.unit} · mín. {it.minStock}
                    </span>
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3 text-sm">
                  <button type="button" onClick={() => setOpenMovement(openMovement === it.id ? null : it.id)} className="font-semibold">
                    {openMovement === it.id ? 'Cerrar' : 'Entrada / salida'}
                  </button>
                  <button type="button" onClick={() => setEditing(it)} className="font-medium text-muted hover:text-ink">
                    Editar
                  </button>
                  {isLow(it) && (
                    <button type="button" onClick={() => orderFromSupplier(it)} className="font-medium text-accent">
                      Pedir al proveedor
                    </button>
                  )}
                  <span className="ml-auto">
                    <ConfirmButton onConfirm={() => deleteItem('inventory', it.id).then(refresh)} />
                  </span>
                </div>
                {openMovement === it.id && (
                  <div className="mt-3">
                    <MovementForm item={it} onDone={refresh} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6 xl:sticky xl:top-36 xl:self-start">
          <Panel title={editing ? 'Editar insumo' : 'Nuevo insumo'}>
            <ItemForm
              key={editing?.id ?? 'new'}
              item={editing}
              suppliers={supplierList}
              onDone={() => {
                setEditing(null);
                refresh();
              }}
            />
          </Panel>
          <Panel title="Últimos movimientos">
            {movements.isLoading && <LoadingBlock />}
            {movements.data?.length === 0 && <EmptyState>Sin movimientos todavía.</EmptyState>}
            <ul className="space-y-2 text-sm">
              {movements.data?.slice(0, 15).map((m) => (
                <li key={m.id} className="flex justify-between gap-3">
                  <span className="min-w-0">
                    <span className="font-medium">{m.itemName}</span>
                    <span className="block truncate text-xs text-muted">
                      {[m.reason, (() => { try { return m.createdAt ? formatDate(m.createdAt) : ''; } catch { return ''; } })()].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <span className={`shrink-0 font-semibold tabular-nums ${m.delta < 0 ? 'text-muted' : ''}`}>
                    {m.delta > 0 ? '+' : '−'}
                    {Math.abs(m.delta)} {m.unit}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
};

export default Inventory;
