import { Link } from 'react-router-dom';
import Logo from '../brand/Logo';
import { CATEGORIES } from '../../data/categories';
import { usePublicSettings } from '../../hooks/useSettings';

const SOCIALS = [
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
  ['tiktok', 'TikTok'],
];

/** Contacto editable desde Admin → Configuración; si no hay datos, no muestra nada. */
const ContactInfo = () => {
  const { settings: s } = usePublicSettings();
  const socials = SOCIALS.filter(([key]) => s[key]);
  if (!s.phone && !s.email && !s.address && !s.hours && socials.length === 0) return null;

  return (
    <address className="mt-6 space-y-1.5 text-sm not-italic">
      {s.phone && (
        <p>
          <a href={`tel:${s.phone.replace(/\s+/g, '')}`} className="hover:text-accent">
            {s.phone}
          </a>
        </p>
      )}
      {s.email && (
        <p>
          <a href={`mailto:${s.email}`} className="hover:text-accent">
            {s.email}
          </a>
        </p>
      )}
      {s.address && <p className="text-muted">{s.address}</p>}
      {s.hours && <p className="text-muted">{s.hours}</p>}
      {socials.length > 0 && (
        <p className="flex gap-4 pt-2">
          {socials.map(([key, label]) => (
            <a key={key} href={s[key]} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-accent">
              {label}
            </a>
          ))}
        </p>
      )}
    </address>
  );
};

const Footer = () => (
  <footer className="mt-24 border-t border-line bg-surface">
    <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
      <div>
        <Logo size="md" />
        <p className="mt-4 max-w-xs text-sm text-muted">
          Agencia de publicidad e impresión en todos los formatos.
        </p>
        <ContactInfo />
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
