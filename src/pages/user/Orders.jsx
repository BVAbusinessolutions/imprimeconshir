import { useQuery } from '@tanstack/react-query';
import AccountLayout from '../../components/account/AccountLayout';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getAppointmentsByUser, getOrdersByUser, getQuotesByUser } from '../../services/firestoreService';
import { formatCurrency, formatDate } from '../../utils/helpers';

const STATUS_LABELS = {
  preliminary: 'Pre-cotización',
  requires_visit: 'Requiere visita',
  confirmed: 'Confirmado',
  pending: 'Pendiente',
  in_production: 'En producción',
  ready: 'Listo para entrega',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const StatusBadge = ({ status }) => (
  <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium">
    {STATUS_LABELS[status] ?? status ?? '—'}
  </span>
);

const safeDate = (value) => {
  try {
    return value ? formatDate(value) : '';
  } catch {
    return '';
  }
};

const Section = ({ title, query, empty, renderItem }) => (
  <section>
    <h2 className="text-xl font-bold">{title}</h2>
    <div className="mt-4 space-y-3">
      {query.isLoading && <div className="h-20 animate-pulse rounded-2xl bg-line" aria-busy="true" />}
      {query.isError && <p className="text-sm text-accent">No pudimos cargar esta sección.</p>}
      {query.data?.length === 0 && <p className="rounded-2xl bg-surface p-5 text-sm text-muted">{empty}</p>}
      {query.data?.map(renderItem)}
    </div>
  </section>
);

const Row = ({ title, subtitle, status, amount }) => (
  <article className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface p-5">
    <div>
      <p className="font-semibold">{title}</p>
      {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-4">
      {amount > 0 && <span className="font-semibold tabular-nums">{formatCurrency(amount)}</span>}
      <StatusBadge status={status} />
    </div>
  </article>
);

const Orders = () => {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;
  const options = { enabled: !!uid, staleTime: 60 * 1000 };

  const quotes = useQuery({ queryKey: ['quotes', uid], queryFn: () => getQuotesByUser(uid), ...options });
  const appointments = useQuery({ queryKey: ['appointments', uid], queryFn: () => getAppointmentsByUser(uid), ...options });
  const orders = useQuery({ queryKey: ['orders', uid], queryFn: () => getOrdersByUser(uid), ...options });

  return (
    <AccountLayout title="Cotizaciones y pedidos">
      <div className="space-y-12">
        <Section
          title="Cotizaciones"
          query={quotes}
          empty="Aún no tienes cotizaciones."
          renderItem={(q) => (
            <Row
              key={q.id}
              title={q.productName || q.subcategory || 'Cotización'}
              subtitle={[q.quoteId ?? q.id, safeDate(q.createdAt)].filter(Boolean).join(' · ')}
              status={q.status}
              amount={q.total}
            />
          )}
        />
        <Section
          title="Citas técnicas"
          query={appointments}
          empty="No tienes citas agendadas."
          renderItem={(a) => (
            <Row key={a.id} title={a.reason || 'Visita técnica'} subtitle={[a.slot?.replace('T', ' '), a.address].filter(Boolean).join(' · ')} status={a.status} />
          )}
        />
        <Section
          title="Pedidos"
          query={orders}
          empty="Todavía no tienes pedidos."
          renderItem={(o) => (
            <Row key={o.id} title={`Pedido ${o.id.slice(0, 6).toUpperCase()}`} subtitle={safeDate(o.createdAt)} status={o.status} amount={o.total} />
          )}
        />
        <Button to="/cotizar">Nueva cotización</Button>
      </div>
    </AccountLayout>
  );
};

export default Orders;
