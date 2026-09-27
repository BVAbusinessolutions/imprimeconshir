import { Link } from 'react-router-dom';
import Logo from '../brand/Logo';
import { CATEGORIES } from '../../data/categories';

const Footer = () => (
  <footer className="mt-24 border-t border-line bg-surface">
    <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
      <div>
        <Logo size="md" />
        <p className="mt-4 max-w-xs text-sm text-muted">
          Agencia de publicidad e impresión en todos los formatos.
        </p>
      </div>

      <nav aria-label="Catálogo">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">Catálogo</p>
        <ul className="mt-4 space-y-2.5">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link to={`/catalogo/${c.slug}`} className="text-sm hover:text-accent">
                {c.fullName}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="Servicio">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">Servicio</p>
        <ul className="mt-4 space-y-2.5 text-sm">
          <li>
            <Link to="/cotizar" className="hover:text-accent">
              Solicitar cotización
            </Link>
          </li>
          <li>
            <Link to="/previsualizar" className="hover:text-accent">
              Prueba tu logo
            </Link>
          </li>
          <li>
            <Link to="/mis-pedidos" className="hover:text-accent">
              Mis pedidos
            </Link>
          </li>
        </ul>
      </nav>
    </div>

    <div className="border-t border-line">
      <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted sm:px-6 lg:px-8">
        © {new Date().getFullYear()} IMPRIME con SHIR. Todos los derechos reservados.
      </p>
    </div>
  </footer>
);

export default Footer;
