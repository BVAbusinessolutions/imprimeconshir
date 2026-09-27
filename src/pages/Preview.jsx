import { Helmet } from 'react-helmet-async';
import Reveal from '../components/motion/Reveal';
import LogoMockupPreview from '../components/mockup/LogoMockupPreview';

const Preview = () => (
  <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
    <Helmet>
      <title>Prueba tu logo | IMPRIME con SHIR</title>
      <meta name="description" content="Carga tu logotipo y míralo en una valla, un stand, un roll-up o un vehículo." />
    </Helmet>
    <Reveal className="mb-10">
      <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Render conceptual</p>
      <h1 className="mt-3 text-[clamp(2.25rem,5vw,4rem)] leading-none font-black">Prueba tu logo.</h1>
    </Reveal>
    <Reveal delay={0.08}>
      <LogoMockupPreview />
    </Reveal>
  </div>
);

export default Preview;
