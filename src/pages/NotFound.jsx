import { Helmet } from 'react-helmet-async';
import Button from '../components/ui/Button';

const NotFound = () => (
  <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
    <Helmet>
      <title>Página no encontrada | IMPRIME con SHIR</title>
    </Helmet>
    <p className="font-display text-8xl font-black text-line">404</p>
    <h1 className="mt-4 text-3xl font-extrabold">Esta página no existe.</h1>
    <Button to="/" variant="outline" className="mt-8">
      Volver al inicio
    </Button>
  </section>
);

export default NotFound;
