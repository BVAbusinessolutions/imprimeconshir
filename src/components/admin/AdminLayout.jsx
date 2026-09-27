import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const SECTIONS = [
  { to: '/admin', label: 'Resumen', end: true },
  { to: '/admin/pedidos', label: 'Cotizaciones y pedidos' },
  { to: '/admin/clientes', label: 'Clientes' },
  { to: '/admin/citas', label: 'Citas técnicas' },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/portafolio', label: 'Portafolio' },
  { to: '/admin/inventario', label: 'Inventario' },
  { to: '/admin/proveedores', label: 'Proveedores' },
  { to: '/admin/logistica', label: 'Logística' },
  { to: '/admin/finanzas', label: 'Finanzas' },
  { to: '/admin/planeacion', label: 'Planeación' },
  { to: '/admin/correos', label: 'Correos' },
  { to: '/admin/usuarios', label: 'Usuarios' },
  { to: '/admin/configuracion', label: 'Configuración' },
];

const linkClass = ({ isActive }) =>
  `shrink-0 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-ink text-white' : 'text-muted hover:bg-ink/5 hover:text-ink'
  }`;

/** Estructura del panel: navegación lateral (fila deslizable en móvil) + contenido. */
const AdminLayout = () => (
  <div className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
    <Helmet>
      <title>Panel | IMPRIME con SHIR</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <nav aria-label="Panel administrativo" className="lg:sticky lg:top-36 lg:self-start">
        <p className="mb-3 hidden text-xs font-semibold tracking-[0.2em] text-muted uppercase lg:block">Panel</p>
        <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {SECTIONS.map((s) => (
            <NavLink key={s.to} to={s.to} end={s.end} className={linkClass}>
              {s.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="min-w-0">
        {/* Suspense propio: al cambiar de sección solo se recarga el contenido, no el menú */}
        <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-line" aria-busy="true" />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  </div>
);

export default AdminLayout;
