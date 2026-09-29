import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AdminHeader, EmptyState, ErrorNote, LoadingBlock } from './AdminUI';
import { listAll, updateItem } from '../../services/adminService';
import ProformaPDF from './ProformaPDF';

const IVA_RATE = 0.13;
const EMPTY_ORDERS = [];
const STATUS = {
  draft: 'Borrador',
  quoted: 'Cotizado',
  approved: 'Aprobado',
};

const money = (value) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(Number(value) || 0);

const localDate = (value = new Date()) => {
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
};

const displayDate = (value) => {
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? 'Sin fecha' : new Intl.DateTimeFormat('es-CR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

const normalizedStatus = (status) => {
  if (['quoted', 'confirmed', 'won'].includes(status)) return 'quoted';
  if (['approved', 'in_production', 'ready', 'delivered'].includes(status)) return 'approved';
  return 'draft';
};

const itemDetail = (item, order) =>
  [item.material || order.material, item.printing || order.printing, item.finishing || order.finishing, item.measurements || order.measurements]
    .filter(Boolean)
    .join(' · ');

const buildItems = (order) => {
  const source = order.proforma?.items || order.items || order.lineItems || order.products;
  if (Array.isArray(source) && source.length) {
    return source.map((item, index) => ({
      id: item.id || `${order.id}-${index}`,
      quantity: Number(item.quantity ?? item.qty ?? 1) || 1,
      description: item.description || item.name || item.productName || `Ítem ${index + 1}`,
      detail: item.detail || itemDetail(item, order),
      unitPrice: Number(item.unitPrice ?? item.price ?? 0) || 0,
    }));
  }
  const description = order.productName || order.subcategory || order.description || order.title || 'Trabajo de impresión';
  const measurements = order.measurements || (order.width && order.height ? `${order.width} × ${order.height} ${order.unit || 'm'}` : '');
  return [{
    id: `${order.id}-1`,
    quantity: Number(order.quantity) || 1,
    description,
    detail: [order.material, order.printing, order.finishing, measurements].filter(Boolean).join(' · ') || order.notes || '',
    unitPrice: Number(order.unitPrice ?? order.proforma?.items?.[0]?.unitPrice ?? 0) || 0,
  }];
};

const buildProforma = (order, number) => {
  const existing = order.proforma || {};
  const contact = order.contact || {};
  const items = buildItems(order);
  const issuedAt = existing.issuedAt || localDate(order.createdAt);
  return {
    number: existing.number || order.proformaNumber || number,
    version: Number(existing.version || order.proformaVersion || 0) + 1,
    issuedAt,
    validUntil: existing.validUntil || localDate(new Date(new Date(issuedAt).getTime() + 15 * 24 * 60 * 60 * 1000)),
    validityDays: 15,
    client: {
      name: existing.client?.name || contact.name || order.fullName || order.customerName || '',
      company: existing.client?.company || contact.company || order.company || '',
      email: existing.client?.email || contact.email || order.email || '',
      phone: existing.client?.phone || contact.phone || order.phone || '',
    },
    job: {
      description: existing.job?.description || order.description || order.notes || order.productName || order.subcategory || '',
      materials: existing.job?.materials || order.material || '',
      printing: existing.job?.printing || order.printing || '',
      finishing: existing.job?.finishing || order.finishing || '',
      measurements: existing.job?.measurements || order.measurements || (order.width && order.height ? `${order.width} × ${order.height} ${order.unit || 'm'}` : ''),
      delivery: existing.job?.delivery || order.delivery || order.deadline || '',
    },
    items,
  };
};

const totalsFor = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const iva = subtotal * IVA_RATE;
  return { subtotal, iva, total: subtotal + iva };
};

const nextNumber = (orders) => {
  const year = new Date().getFullYear();
  const sequence = orders.reduce((highest, order) => {
    const value = order.proforma?.number || order.proformaNumber || '';
    const match = new RegExp(`^PRO-${year}-(\\d+)$`).exec(value);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `PRO-${year}-${String(sequence + 1).padStart(3, '0')}`;
};

const statusClass = (status) => {
  const styles = {
    draft: 'border-line bg-paper text-ink',
    quoted: 'border-accent/30 bg-accent/10 text-accent',
    approved: 'border-ink bg-ink text-white',
  };
  return styles[normalizedStatus(status)];
};

const PricingDialog = ({ proforma, onChange, onClose, onPreview, onSave, saving }) => {
  const totals = totalsFor(proforma.items);
  const updatePrice = (index, value) => {
    const items = proforma.items.map((item, itemIndex) => (itemIndex === index ? { ...item, unitPrice: Number(value) || 0 } : item));
    onChange({ ...proforma, items });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/45 p-3 sm:p-6" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="pricing-title" className="mx-auto my-4 w-full max-w-4xl rounded-3xl bg-paper shadow-2xl sm:my-10">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">{proforma.number}</p>
            <h2 id="pricing-title" className="mt-1 text-2xl font-black">Asignar precio a la proforma</h2>
            <p className="mt-1 text-sm text-muted">Solo ingresa el precio unitario de cada ítem; los totales se calculan automáticamente.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full px-3 py-2 text-sm font-semibold hover:bg-ink/5">Cerrar</button>
        </header>

        <div className="p-5 sm:p-7">
          <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-line text-xs text-muted uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Cantidad</th>
                  <th className="px-4 py-3 font-semibold">Descripción</th>
                  <th className="px-4 py-3 text-right font-semibold">Precio unitario</th>
                  <th className="px-4 py-3 text-right font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {proforma.items.map((item, index) => {
                  const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                  return (
                    <tr key={item.id || index} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 tabular-nums">{item.quantity}</td>
                      <td className="px-4 py-3"><p className="font-medium">{item.description}</p>{item.detail && <p className="mt-0.5 text-xs text-muted">{item.detail}</p>}</td>
                      <td className="px-4 py-3 text-right">
                        <label className="sr-only" htmlFor={`price-${item.id || index}`}>Precio unitario de {item.description}</label>
                        <input id={`price-${item.id || index}`} type="number" min="0" step="1" inputMode="numeric" value={item.unitPrice || ''} onChange={(event) => updatePrice(index, event.target.value)} className="w-36 rounded-xl border border-line bg-paper px-3 py-2 text-right tabular-nums focus:border-ink focus:outline-none" />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">{money(lineTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 ml-auto w-full max-w-sm space-y-2 rounded-2xl bg-surface p-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">{money(totals.subtotal)}</span></div>
            <div className="flex justify-between"><span>IVA (13%)</span><span className="tabular-nums">{money(totals.iva)}</span></div>
            <div className="flex justify-between border-t border-line pt-2 font-display text-lg font-extrabold"><span>Total</span><span className="tabular-nums">{money(totals.total)}</span></div>
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-line px-5 py-5 sm:flex-row sm:justify-end sm:px-7">
          <button type="button" onClick={onPreview} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:border-ink">Ver proforma</button>
          <button type="button" disabled={saving} onClick={() => onSave(totals)} className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50">{saving ? 'Guardando…' : 'Guardar como cotizada'}</button>
        </footer>
      </div>
    </div>
  );
};

const Orders = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);
  const ordersQuery = useQuery({ queryKey: ['admin', 'orders'], queryFn: () => listAll('orders') });
  const orders = ordersQuery.data ?? EMPTY_ORDERS;

  const saveProforma = useMutation({
    mutationFn: ({ order, proforma, totals }) => updateItem('orders', order.id, {
      status: 'quoted',
      subtotal: totals.subtotal,
      iva: totals.iva,
      total: totals.total,
      unitPrice: proforma.items.length === 1 ? proforma.items[0].unitPrice : null,
      proformaNumber: proforma.number,
      proformaVersion: proforma.version,
      proforma: { ...proforma, ...totals, issuedAt: localDate(), validUntil: proforma.validUntil },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Proforma guardada como cotizada.');
      setEditing(null);
    },
    onError: () => toast.error('No se pudo guardar la proforma. Revisa tu conexión e inténtalo de nuevo.'),
  });

  const approve = useMutation({
    mutationFn: (id) => updateItem('orders', id, { status: 'approved', approvedAt: localDate() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Pedido marcado como aprobado.');
    },
    onError: () => toast.error('No se pudo actualizar el pedido.'),
  });

  const filtered = orders.filter((order) => filter === 'all' || normalizedStatus(order.status) === filter);

  const openPricing = (order) => setEditing({ order, proforma: buildProforma(order, nextNumber(orders)) });
  const openPreview = (order) => {
    const proforma = order.proforma ? { ...order.proforma, items: buildItems(order) } : buildProforma(order, nextNumber(orders));
    setPreview({ order, proforma });
  };

  if (preview) {
    const totals = totalsFor(preview.proforma.items);
    return <ProformaPDF {...preview.proforma} {...totals} proformaNumber={preview.proforma.number} date={preview.proforma.issuedAt} validUntil={preview.proforma.validUntil} onClose={() => setPreview(null)} />;
  }

  return (
    <>
      <AdminHeader title="Cotizaciones y proformas" description="Asigna precios, genera proformas imprimibles y da seguimiento a cada pedido sin automatizaciones externas." />

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto" role="tablist" aria-label="Filtrar pedidos">
        {[['all', 'Todos'], ...Object.entries(STATUS)].map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={filter === key} onClick={() => setFilter(key)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${filter === key ? 'border-ink bg-ink text-white' : 'border-line bg-surface hover:border-ink/40'}`}>{label}</button>
        ))}
      </div>

      {ordersQuery.isLoading && <LoadingBlock className="h-48" />}
      {ordersQuery.isError && <ErrorNote>No pudimos cargar los pedidos de Firestore.</ErrorNote>}
      {ordersQuery.data && filtered.length === 0 && <EmptyState>No hay pedidos en este estado.</EmptyState>}

      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border border-line bg-surface">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-line bg-paper text-xs font-semibold tracking-wide text-muted uppercase">
              <tr><th className="px-5 py-3">Pedido</th><th className="px-5 py-3">Cliente</th><th className="px-5 py-3">Fecha</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3 text-right">Total</th><th className="px-5 py-3 text-right"><span className="sr-only">Acciones</span></th></tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const status = normalizedStatus(order.status);
                const client = order.contact?.name || order.fullName || order.customerName || 'Cliente por confirmar';
                const title = order.productName || order.subcategory || order.description || `Pedido ${order.id.slice(0, 6).toUpperCase()}`;
                return (
                  <tr key={order.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-4"><p className="font-semibold">{title}</p><p className="mt-0.5 text-xs text-muted">{order.proformaNumber || `#${order.id.slice(0, 8).toUpperCase()}`}</p></td>
                    <td className="px-5 py-4">{client}</td>
                    <td className="px-5 py-4 text-muted">{displayDate(order.createdAt)}</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(status)}`}>{STATUS[status]}</span></td>
                    <td className="px-5 py-4 text-right font-semibold tabular-nums">{order.total ? money(order.total) : '—'}</td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-2">
                      {status === 'draft' && <button type="button" onClick={() => openPricing(order)} className="rounded-full bg-accent px-3.5 py-2 text-xs font-semibold text-white hover:bg-accent-hover">Asignar precio / Proforma</button>}
                      {status !== 'draft' && <button type="button" onClick={() => openPreview(order)} className="rounded-full border border-line px-3.5 py-2 text-xs font-semibold hover:border-ink">Ver proforma</button>}
                      {status === 'quoted' && <><button type="button" onClick={() => openPricing(order)} className="rounded-full border border-line px-3.5 py-2 text-xs font-semibold hover:border-ink">Editar</button><button type="button" disabled={approve.isPending} onClick={() => approve.mutate(order.id)} className="rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-white hover:bg-ink/85">Aprobar</button></>}
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && <PricingDialog proforma={editing.proforma} onChange={(proforma) => setEditing({ ...editing, proforma })} onClose={() => setEditing(null)} onPreview={() => setPreview(editing)} onSave={(totals) => saveProforma.mutate({ order: editing.order, proforma: editing.proforma, totals })} saving={saveProforma.isPending} />}
    </>
  );
};

export default Orders;
