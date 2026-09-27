import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AdminHeader, ErrorNote, StatTile } from '../../components/admin/AdminUI';
import { getDeliveriesForMonth, listAll } from '../../services/adminService';
import { IS_N8N_MOCK } from '../../services/n8n';
import { localISODate } from '../../utils/helpers';

const today = () => localISODate();

const SHORTCUTS = [
  { to: '/admin/pedidos', title: 'Cotizaciones y pedidos', text: 'Confirma precios y da seguimiento.' },
  { to: '/admin/citas', title: 'Citas técnicas', text: 'Visitas de medición y avisos a los ninjas.' },
  { to: '/admin/logistica', title: 'Logística', text: 'Agenda entregas y arma rutas por zona.' },
  { to: '/admin/inventario', title: 'Inventario', text: 'Existencias, entradas, salidas y pedidos.' },
  { to: '/admin/proveedores', title: 'Proveedores', text: 'Listas de precios, márgenes e inventario.' },
  { to: '/admin/finanzas', title: 'Finanzas', text: 'Ventas por mes y por categoría.' },
  { to: '/admin/planeacion', title: 'Planeación', text: 'Simula gastos e ingresos a futuro.' },
  { to: '/admin/correos', title: 'Correos', text: 'Escribe a clientes, proveedores y técnicos.' },
  { to: '/admin/productos', title: 'Productos', text: 'Lo que ve el cliente en el catálogo.' },
];

const Dashboard = () => {
  const quotes = useQuery({ queryKey: ['admin', 'quotes'], queryFn: () => listAll('quotes') });
  const appointments = useQuery({ queryKey: ['admin', 'appointments'], queryFn: () => listAll('appointments') });
  const deliveries = useQuery({
    queryKey: ['admin', 'deliveries', today().slice(0, 7)],
    queryFn: () => getDeliveriesForMonth(today().slice(0, 7)),
  });
  const inventory = useQuery({ queryKey: ['admin', 'inventory'], queryFn: () => listAll('inventory') });

  const pendingQuotes = quotes.data?.filter((q) => ['preliminary', 'requires_visit', 'pending'].includes(q.status)).length;
  const upcoming = appointments.data?.filter((a) => a.status !== 'cancelled' && (a.slot ?? '') >= today()).length;
  const todayDeliveries = deliveries.data?.filter((d) => d.date === today()).length;
  const lowStock = inventory.data?.filter((i) => i.minStock != null && Number(i.stock) <= Number(i.minStock)).length;
  const unassigned = appointments.data?.filter((a) => !a.technicianId && a.status !== 'cancelled' && (a.slot ?? '') >= today()).length;

  const show = (q, value) => (q.isLoading ? '…' : q.isError ? '—' : value ?? 0);
  const anyError = [quotes, appointments, deliveries, inventory].some((q) => q.isError);

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
        <StatTile label="Citas próximas" value={show(appointments, upcoming)} hint={unassigned ? unassigned + " sin técnico" : undefined} />
        <StatTile label="Entregas de hoy" value={show(deliveries, todayDeliveries)} />
        <StatTile label="Insumos bajo mínimo" value={show(inventory, lowStock)} />
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
