import { Helmet } from 'react-helmet-async';
import Reveal from '../motion/Reveal';

/**
 * Página de contenido (legal, guías, FAQ): encabezado + cuerpo con tipografía de lectura.
 * Los estilos de texto largo se aplican con selectores de Tailwind sobre los hijos.
 */
const ContentPage = ({ eyebrow, title, description, updated, children, aside }) => (
  <div className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16 lg:px-8">
    <Helmet>
      <title>{`${title} | IMPRIME con SHIR`}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
    <Reveal className="mb-12 max-w-3xl">
      {eyebrow && <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">{eyebrow}</p>}
      <h1 className="mt-3 text-[clamp(2.25rem,5vw,4rem)] leading-none font-black">{title}</h1>
      {description && <p className="mt-4 text-lg text-muted">{description}</p>}
      {updated && <p className="mt-3 text-sm text-muted">Última actualización: {updated}</p>}
    </Reveal>
    <div className={aside ? 'grid gap-12 lg:grid-cols-[1fr_300px]' : ''}>
      <div className="prose-shir max-w-3xl">{children}</div>
      {aside && <aside className="lg:sticky lg:top-36 lg:self-start">{aside}</aside>}
    </div>
  </div>
);

export default ContentPage;
