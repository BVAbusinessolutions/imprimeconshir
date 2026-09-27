import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AdminHeader, ErrorNote, StatTile } from '../../components/admin/AdminUI';
import { getDeliveriesForMonth, listAll } from '../../services/adminService';
import { IS_N8N_MOCK } from '../../services/n8n';
import { localISODate } from '../../utils/helpers';

const today = () => localISODate();

const SHORTCUTS = [
  { to: '/admin/pedidos', title: 'Cotizaciones y pedidos', text: 'Confirma precios y da seguimiento.' },
  { to: '/admin/logistica', title: 'Logística', text: 'Agenda entregas y arma rutas por zona.' },
  { to: '/admin/proveedores', title: 'Proveedores', text: 'Listas de precios, márgenes e inventario.' },
  { to: '/admin/finanzas', title: 'Finanzas', text: 'Ventas por mes y por categoría.' },
  { to: '/admin/productos', title: 'Productos', text: 'Lo que ve el cliente en el catálogo.' },
];

const Dashboard = () => {
  const quotes = useQuery({ queryKey: ['admin', 'quotes'], queryFn: () => listAll('quotes') });
  const appointments = useQuery({ queryKey: ['admin', 'appointments'], queryFn: () => listAll('appointments') });
  const deliveries = useQuery({
    queryKey: ['admin', 'deliveries', today().slice(0, 7)],
    queryFn: () => getDeliveriesForMonth(today().slice(0, 7)),
  });
  const suppliers = useQuery({ queryKey: ['admin', 'suppliers'], queryFn: () => listAll('suppliers') });

  const pendingQuotes = quotes.data?.filter((q) => ['preliminary', 'requires_visit', 'pending'].includes(q.status)).length;
  const upcoming = appointments.data?.filter((a) => a.status !== 'cancelled' && (a.slot ?? '') >= today()).length;
  const todayDeliveries = deliveries.data?.filter((d) => d.date === today()).length;
  const lowStock = suppliers.data
    ?.flatMap((s) => s.items ?? [])
    .filter((i) => i.minStock != null && Number(i.stock) <= Number(i.minStock)).length;

  const show = (q, value) => (q.isLoading ? '…' : q.isError ? '—' : value ?? 0);
  const anyError = [quotes, appointments, deliveries, suppliers].some((q) => q.isError);

  return (
    <>
      <AdminHeader title="Resumen" description="Lo que necesita atención hoy." />

      {IS_N8N_MOCK && (
        <p className="mb-6 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted">
          n8n en <strong className="text-ink">modo de prueba</strong>: rutas, márgenes y finanzas usan respuestas simuladas.
        </p>
      )}
      {anyError && <div className="mb-6"><ErrorNote>Algunas cifras no cargaron. Verifica que tu usuario sea admin y que las reglas estén publicadas.</ErrorNote></div>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Cotizaciones por confirmar" value={show(quotes, pendingQuotes)} />
        <StatTile label="Citas próximas" value={show(appointments, upcoming)} />
        <StatTile label="Entregas de hoy" value={show(deliveries, todayDeliveries)} />
        <StatTile label="Insumos con inventario bajo" value={show(suppliers, lowStock)} />
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SHORTCUTS.map((s) => (
          <Link key={s.to} to={s.to} className="group rounded-3xl bg-surface p-6 transition-shadow hover:shadow-[0_16px_40px_-24px_rgb(0_0_0/0.35)]">
            <p className="font-bold">
              {s.title} <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </p>
            <p className="mt-1 text-sm text-muted">{s.text}</p>
          </Link>
        ))}
      </div>
    </>
  );
};

export default Dashboard;
