import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePublicSettings } from '../../hooks/useSettings';

const SITE_URL = (import.meta.env.VITE_SITE_URL || '').replace(/\/+$/, '');

/**
 * Etiquetas comunes a todas las páginas: URL canónica, og:url y, en el inicio,
 * datos estructurados de negocio local (Google usa el contacto de Admin → Configuración).
 */
const SeoDefaults = () => {
  const { pathname } = useLocation();
  const { settings: s } = usePublicSettings();
  const url = SITE_URL ? `${SITE_URL}${pathname === '/' ? '' : pathname}` : null;
  const sameAs = [s.facebook, s.instagram, s.tiktok].filter(Boolean);

  const business = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'IMPRIME con SHIR',
    description: 'Agencia de publicidad e impresión: gran formato, litografía, eventos y promocionales.',
    ...(SITE_URL && { url: SITE_URL, image: `${SITE_URL}/favicon.svg` }),
    ...(s.phone && { telephone: s.phone }),
    ...(s.email && { email: s.email }),
    ...(s.address && { address: { '@type': 'PostalAddress', streetAddress: s.address, addressCountry: 'MX' } }),
    ...(s.hours && { openingHours: s.hours }),
    ...(sameAs.length && { sameAs }),
  };

  return (
    <Helmet>
      {url && <link rel="canonical" href={url} />}
      {url && <meta property="og:url" content={url} />}
      {pathname === '/' && <script type="application/ld+json">{JSON.stringify(business)}</script>}
    </Helmet>
  );
};

export default SeoDefaults;
