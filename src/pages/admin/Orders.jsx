import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AdminHeader, EmptyState, ErrorNote, LoadingBlock, StatusSelect } from '../../components/admin/AdminUI';
import { listAll, updateItem } from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/helpers';

const TABS = {
  quotes: {
    label: 'Cotizaciones',
    statuses: {
      preliminary: 'Pre-cotización',
      requires_visit: 'Requiere visita',
      confirmed: 'Confirmada',
      won: 'Ganada',
      lost: 'Perdida',
    },
  },
  orders: {
    label: 'Pedidos',
    statuses: {
      pending: 'Pendiente',
      in_production: 'En producción',
      ready: 'Listo',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    },
  },
};

const safeDate = (v) => {
  try {
    return v ? formatDate(v) : '';
  } catch {
    return '';
  }
};

const describe = (tab, item) => {
  if (tab === 'quotes') {
    return {
      title: item.productName || item.subcategory || 'Cotización',
      meta: [item.quoteId ?? item.id, item.contact?.name, item.contact?.phone, safeDate(item.createdAt)],
      amount: item.total,
    };
  }
  return { title: `Pedido ${item.id.slice(0, 6).toUpperCase()}`, meta: [item.fullName, item.phone, safeDate(item.createdAt)], amount: item.total };
};

const AdminOrders = () => {
  const [tab, setTab] = useState('quotes');
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ['admin', tab], queryFn: () => listAll(tab) });

  const setStatus = useMutation({
    mutationFn: ({ id, status }) => updateItem(tab, id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', tab] }),
    onError: () => toast.error('No se pudo actualizar el estado.'),
  });

  return (
    <>
      <AdminHeader
        title="Cotizaciones y pedidos"
        description="Las cotizaciones llegan desde n8n; aquí confirmas precios y das seguimiento. Las citas están en su propia sección."
      />

      <div role="tablist" aria-label="Tipo" className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {Object.entries(TABS).map(([key, t]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              tab === key ? 'border-ink bg-ink text-white' : 'border-line bg-surface hover:border-ink/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="space-y-3">
        {list.isLoading && <LoadingBlock />}
        {list.isError && <ErrorNote />}
        {list.data?.length === 0 && (
          <EmptyState>
            {tab === 'orders'
              ? 'Aún no hay pedidos.'
              : 'Aún no hay registros. Aparecerán cuando n8n guarde en Firestore (ver pendientes/README.md).'}
          </EmptyState>
        )}
        {list.data?.map((item) => {
          const { title, meta, amount } = describe(tab, item);
          return (
            <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface p-5">
              <div className="min-w-0">
                <p className="font-semibold">{title}</p>
                <p className="mt-0.5 truncate text-sm text-muted">{meta.filter(Boolean).join(' · ')}</p>
              </div>
              <div className="flex items-center gap-4">
                {amount > 0 && <span className="font-semibold tabular-nums">{formatCurrency(amount)}</span>}
                <StatusSelect
                  value={item.status}
                  options={TABS[tab].statuses}
                  disabled={setStatus.isPending}
                  onChange={(status) => setStatus.mutate({ id: item.id, status })}
                />
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
};

export default AdminOrders;
