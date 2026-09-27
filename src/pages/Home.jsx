import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../components/ui/Button';
import Reveal from '../components/motion/Reveal';
import ProjectImage from '../components/media/ProjectImage';
import BeforeAfterSlider from '../components/media/BeforeAfterSlider';
import VanGraphic from '../components/media/VanGraphic';
import LogoMockupPreview from '../components/mockup/LogoMockupPreview';
import { CATEGORIES } from '../data/categories';
import { EXAMPLE_IMAGES } from '../data/exampleImages';
import Testimonials from '../components/content/Testimonials';

// Mosaico Fotobook: las imágenes de proyectos son las protagonistas.
// Reemplaza las fotos de ejemplo por trabajos reales cuando estén disponibles.
const MOSAIC = [
  { label: 'Rotulación vehicular', span: 'col-span-2 row-span-2', image: EXAMPLE_IMAGES.rotulacionVehicular },
  { label: 'Rótulos corpóreos', span: '', image: EXAMPLE_IMAGES.letreros },
  { label: 'Señalización', span: '', image: EXAMPLE_IMAGES.senalizacionEventos },
  { label: 'Papelería', span: '', image: EXAMPLE_IMAGES.plumas },
  { label: 'Promocionales', span: '', image: EXAMPLE_IMAGES.tazas },
];

const VanScene = ({ wrapped }) => (
  <svg viewBox="0 0 800 500" className="h-full w-full" aria-hidden="true">
    <rect width={800} height={500} fill={wrapped ? '#e4e4df' : '#ebebe7'} />
    <rect x={0} y={440} width={800} height={60} fill="#d6d6d1" />
    <VanGraphic wrapped={wrapped} />
  </svg>
);

const SectionHeading = ({ eyebrow, title, children }) => (
  <div className="max-w-2xl">
    {eyebrow && (
      <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">{eyebrow}</p>
    )}
    <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{title}</h2>
    {children && <p className="mt-3 text-muted">{children}</p>}
  </div>
);

const Home = () => (
  <>
    <Helmet>
      <title>IMPRIME con SHIR | Impresión y publicidad en todos los formatos</title>
      <meta
        name="description"
        content="Gran formato, litografía, eventos y promocionales. Cotiza por chat y recibe tu pre-cotización al instante."
      />
    </Helmet>

    {/* Hero */}
    <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-20 lg:px-8">
      <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <h1 className="max-w-4xl text-[clamp(2.75rem,7vw,6rem)] leading-[0.95] font-black">
          Tu marca,
          <br />
          en todos los formatos.
        </h1>
        <div className="flex flex-col items-start gap-4 lg:items-end lg:pb-3">
          <p className="max-w-xs text-muted lg:text-right">
            Del rollo térmico a la valla. Pre-cotización al instante.
          </p>
          <div className="flex items-center gap-5">
            <Button to="/cotizar" size="lg">
              Cotiza al instante
            </Button>
            <Link to="/catalogo" className="text-sm font-semibold whitespace-nowrap underline-offset-4 hover:underline">
              Ver catálogo
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="mt-12 grid auto-rows-[140px] grid-cols-2 gap-3 sm:auto-rows-[200px] md:grid-cols-4 md:gap-4">
        {MOSAIC.map((item, i) => (
          <div key={item.label} className={`group overflow-hidden rounded-2xl ${item.span}`}>
            <ProjectImage src={item.image.src} alt={item.image.alt} label={item.label} showLabel tone={i} className="h-full w-full" />
          </div>
        ))}
      </Reveal>
      <div className="mt-5 text-right">
        <Link to="/proyectos" className="text-sm font-semibold underline-offset-4 hover:underline">
          Ver todos los proyectos →
        </Link>
      </div>
    </section>

    {/* Categorías */}
    <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeading eyebrow="Catálogo" title="Cuatro formas de hacer ruido." />
      </Reveal>
      <div className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-2">
        {CATEGORIES.map((c, i) => (
          <Reveal key={c.slug} delay={(i % 2) * 0.08}>
            <Link to={`/catalogo/${c.slug}`} className="group block">
              <div className="overflow-hidden rounded-3xl">
                <ProjectImage src={c.cover} alt={c.fullName} label={c.name} tone={i} className="aspect-[4/3] w-full" />
              </div>
              <div className="mt-5 flex items-start justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold">{c.fullName}</h3>
                  <p className="mt-1.5 text-sm text-muted">{c.tagline}</p>
                </div>
                <span className="mt-1 shrink-0 text-sm font-semibold transition-transform duration-300 group-hover:translate-x-1">
                  Ver →
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>

    {/* Antes y después */}
    <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.6fr]">
        <Reveal>
          <SectionHeading eyebrow="Rotulación" title="Antes y después.">
            Desliza para ver cómo cambia un vehículo con una rotulación integral.
          </SectionHeading>
          <Button to="/catalogo/gran-formato?sub=rotulacion-vehicular" variant="outline" className="mt-8">
            Ver rotulaciones
          </Button>
        </Reveal>
        <Reveal delay={0.1}>
          <BeforeAfterSlider
            before={<VanScene />}
            after={<VanScene wrapped />}
            label="Comparar vehículo antes y después de la rotulación"
            className="aspect-[8/5]"
          />
        </Reveal>
      </div>
    </section>

    {/* Prueba tu logo */}
    <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeading eyebrow="Render conceptual" title="Mira tu logo antes de imprimirlo.">
          Cárgalo y pruébalo en una valla, un stand, un roll-up o un vehículo.
        </SectionHeading>
      </Reveal>
      <Reveal delay={0.1} className="mt-10">
        <LogoMockupPreview />
      </Reveal>
    </section>

    <Testimonials />

    {/* Cierre */}
    <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal className="flex flex-col items-start justify-between gap-8 rounded-3xl bg-ink px-8 py-14 text-white sm:px-14 md:flex-row md:items-center">
        <h2 className="max-w-xl text-3xl font-extrabold sm:text-4xl">
          Cuéntanos tu proyecto. Te cotizamos al instante.
        </h2>
        <Button to="/cotizar" size="lg">
          Solicitar cotización
        </Button>
      </Reveal>
    </section>
  </>
);

export default Home;
