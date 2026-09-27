import { Helmet } from 'react-helmet-async';
import Button from './Button';

/**
 * Pantalla temporal para secciones que se construyen en fases siguientes.
 */
const ComingSoon = ({ title, phase }) => (
  <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
    <Helmet>
      <title>{`${title} | IMPRIME con SHIR`}</title>
    </Helmet>
    {phase && (
      <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-muted uppercase">{phase}</p>
    )}
    <h1 className="text-4xl font-extrabold sm:text-5xl">{title}</h1>
    <p className="mt-4 text-muted">Estamos preparando esta sección.</p>
    <Button to="/catalogo" variant="outline" className="mt-8">
      Ver catálogo
    </Button>
  </section>
);

export default ComingSoon;
