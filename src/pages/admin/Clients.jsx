import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AdminHeader, Badge, EmptyState, ErrorNote, LoadingBlock } from '../../components/admin/AdminUI';
import { listAll } from '../../services/adminService';
import { formatCurrency, phoneDigits, whatsappLink } from '../../utils/helpers';

const millis = (v) => v?.toMillis?.() ?? (typeof v === 'string' ? Date.parse(v) || 0 : 0);
const dateText = (ms) => (ms ? new Date(ms).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

/**
 * Une cuentas registradas, cotizaciones, citas y pedidos por correo (o teléfono si no hay correo).
 */
const buildClients = ({ users = [], quotes = [], appointments = [], orders = [] }) => {
  const map = new Map();
  const keyOf = (email, phone) => (email ? String(email).toLowerCase() : phone ? `tel:${phoneDigits(phone)}` : null);
  const upsert = (key, patch) => {
    if (!key) return null;
    const c = map.get(key) ?? { key, name: '', email: '', phone: '', quotes: [], appointments: [], orders: [], lastActivity: 0 };
    map.set(key, { ...c, ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v)) });
    return map.get(key);
  };
  const touch = (c, when) => c && (c.lastActivity = Math.max(c.lastActivity, when));

  for (const u of users) {
    if (u.role === 'admin') continue;
    const c = upsert(keyOf(u.email, u.phone), {
      name: u.displayName,
      email: u.email,
      phone: u.phone,
      registered: true,
      marketingOptIn: u.marketingOptIn,
      hasBilling: !!u.billing,
    });
    touch(c, millis(u.createdAt));
  }
  for (const q of quotes) {
    const c = upsert(keyOf(q.contact?.email, q.contact?.phone), { name: q.contact?.name, email: q.contact?.email, phone: q.contact?.phone });
    if (c) {
      c.quotes.push(q);
      touch(c, millis(q.createdAt));
    }
  }
  for (const a of appointments) {
    const c = upsert(keyOf(a.contact?.email, a.contact?.phone), { name: a.contact?.name, email: a.contact?.email, phone: a.contact?.phone });
    if (c) {
      c.appointments.push(a);
      touch(c, millis(a.createdAt) || Date.parse(a.slot) || 0);
    }
  }
  for (const o of orders) {
    const c = upsert(keyOf(o.email, o.phone), { name: o.fullName, email: o.email, phone: o.phone });
    if (c) {
      c.orders.push(o);
      touch(c, millis(o.createdAt));
    }
  }

  return [...map.values()]
    .map((c) => ({ ...c, quoted: c.quotes.reduce((a, q) => a + (Number(q.total) || 0), 0) }))
    .sort((a, b) => b.lastActivity - a.lastActivity);
};

const Clients = () => {
  const users = useQuery({ queryKey: ['admin', 'users'], queryFn: () => listAll('users') });
  const quotes = useQuery({ queryKey: ['admin', 'quotes'], queryFn: () => listAll('quotes') });
  const appointments = useQuery({ queryKey: ['admin', 'appointments'], queryFn: () => listAll('appointments') });
  const orders = useQuery({ queryKey: ['admin', 'orders'], queryFn: () => listAll('orders') });
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(null);

  const loading = [users, quotes, appointments, orders].some((q) => q.isLoading);
  const failed = [users, quotes, appointments, orders].some((q) => q.isError);

  const clients = useMemo(
    () => buildClients({ users: users.data, quotes: quotes.data, appointments: appointments.data, orders: orders.data }),
    [users.data, quotes.data, appointments.data, orders.data]
  );
  const term = search.trim().toLowerCase();
  const visible = term ? clients.filter((c) => [c.name, c.email, c.phone].some((v) => String(v ?? '').toLowerCase().includes(term))) : clients;

  return (
    <>
      <AdminHeader
        title="Clientes"
        description="Todos tus clientes en un lugar: cuentas registradas, cotizaciones, citas y pedidos."
        actions={
          <label className="text-sm">
            <span className="sr-only">Buscar cliente</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, correo o teléfono"
              className="w-72 max-w-full rounded-xl border border-line bg-surface px-3 py-2 focus:border-ink focus:outline-none"
            />
          </label>
        }
      />

      {failed && <div className="mb-4"><ErrorNote>Parte de la información no cargó.</ErrorNote></div>}
      {loading && <LoadingBlock className="h-40" />}
      {!loading && visible.length === 0 && <EmptyState>{term ? 'Sin coincidencias.' : 'Aún no hay clientes.'}</EmptyState>}

      <ul className="space-y-2">
        {visible.map((c) => (
          <li key={c.key} className="rounded-2xl bg-surface">
            <button
              type="button"
              aria-expanded={open === c.key}
              onClick={() => setOpen(open === c.key ? null : c.key)}
              className="flex w-full flex-wrap items-center justify-between gap-4 p-4 text-left"
            >
              <div className="min-w-0">
                <p className="font-semibold">
                  {c.name || c.email || c.phone} {c.registered && <Badge>Cuenta</Badge>} {c.hasBilling && <Badge>Factura</Badge>}{' '}
                  {c.marketingOptIn && <Badge>Acepta promociones</Badge>}
                </p>
                <p className="truncate text-sm text-muted">{[c.email, c.phone].filter(Boolean).join(' · ')}</p>
              </div>
              <div className="flex gap-6 text-sm tabular-nums">
                <span>
                  <span className="font-semibold">{c.quotes.length}</span> <span className="text-muted">cotiz.</span>
                </span>
                <span>
                  <span className="font-semibold">{c.appointments.length}</span> <span className="text-muted">citas</span>
                </span>
                <span>
                  <span className="font-semibold">{c.orders.length}</span> <span className="text-muted">pedidos</span>
                </span>
                <span className="hidden text-muted sm:inline">{dateText(c.lastActivity)}</span>
              </div>
            </button>

            {open === c.key && (
              <div className="border-t border-line px-4 pt-3 pb-4 text-sm">
                <div className="mb-3 flex flex-wrap gap-2">
                  {c.email && (
                    <Link
                      to={`/admin/correos?${new URLSearchParams({ to: c.email, subject: 'IMPRIME con SHIR', body: `Hola ${c.name || ''},\n\n` })}`}
                      className="rounded-full border border-ink/15 bg-paper px-3 py-1.5 text-xs font-semibold hover:border-ink/40"
                    >
                      Escribir correo
                    </Link>
                  )}
                  {c.phone && (
                    <a
                      href={whatsappLink(phoneDigits(c.phone), `Hola ${c.name || ''}, te escribimos de IMPRIME con SHIR.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-ink/15 bg-paper px-3 py-1.5 text-xs font-semibold hover:border-ink/40"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
                {c.quoted > 0 && <p className="mb-2 text-muted">Total cotizado: {formatCurrency(c.quoted)}</p>}
                <ul className="space-y-1">
                  {c.quotes.map((q) => (
                    <li key={q.id}>
                      Cotización {q.quoteId ?? q.id.slice(0, 6)} · {q.subcategory ?? '—'} {q.total > 0 && `· ${formatCurrency(q.total)}`} · {q.status}
                    </li>
                  ))}
                  {c.appointments.map((a) => (
                    <li key={a.id}>
                      Cita · {a.reason} · {a.slot?.replace('T', ' ')} · {a.status}
                    </li>
                  ))}
                  {c.orders.map((o) => (
                    <li key={o.id}>
                      Pedido {o.id.slice(0, 6).toUpperCase()} {o.total > 0 && `· ${formatCurrency(o.total)}`} · {o.status}
                    </li>
                  ))}
                  {!c.quotes.length && !c.appointments.length && !c.orders.length && <li className="text-muted">Sin actividad todavía.</li>}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
};

export default Clients;
