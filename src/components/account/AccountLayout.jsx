import { NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const tabClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-ink text-white' : 'text-muted hover:bg-ink/5 hover:text-ink'
  }`;

/** Encabezado y navegación común de "Mi cuenta". */
const AccountLayout = ({ title, children }) => (
  <div className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
    <Helmet>
      <title>{`${title} | IMPRIME con SHIR`}</title>
    </Helmet>
    <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Mi cuenta</p>
    <h1 className="mt-3 text-4xl font-black sm:text-5xl">{title}</h1>
    <nav aria-label="Mi cuenta" className="mt-8 flex gap-2">
      <NavLink to="/perfil" className={tabClass}>
        Perfil
      </NavLink>
      <NavLink to="/mis-pedidos" className={tabClass}>
        Cotizaciones y pedidos
      </NavLink>
    </nav>
    <div className="mt-10">{children}</div>
  </div>
);

export default AccountLayout;
