import { Helmet } from 'react-helmet-async';
import Reveal from '../components/motion/Reveal';
import Button from '../components/ui/Button';
import ProjectImage from '../components/media/ProjectImage';
import { usePublicSettings } from '../hooks/useSettings';
import { EXAMPLE_IMAGES } from '../data/exampleImages';

const VALUES = [
  ['Todo en un lugar', 'Del rollo térmico a la valla: gran formato, litografía, eventos y promocionales.'],
  ['Rápido de verdad', 'Pre-cotización al instante y confirmación en minutos.'],
  ['Instalamos', 'Técnicos propios para medir, rotular e instalar.'],
];

const About = () => {
  const { settings: s } = usePublicSettings();
  const hasContact = s.phone || s.email || s.address || s.hours;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
      <Helmet>
        <title>Nosotros y contacto | IMPRIME con SHIR</title>
        <meta name="description" content="Agencia de publicidad e impresión en todos los formatos. Conoce cómo trabajamos y contáctanos." />
      </Helmet>

      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Nosotros</p>
          <h1 className="mt-3 text-[clamp(2.25rem,5vw,4rem)] leading-none font-black">Hacemos que tu marca se vea.</h1>
          <p className="mt-6 max-w-lg text-lg text-muted">
            Somos una agencia de publicidad e impresión. Acompañamos a negocios y marcas desde la idea hasta la instalación, en cualquier
            formato.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/cotizar">Cotiza al instante</Button>
            <Button to="/proyectos" variant="outline">
              Ver proyectos
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="overflow-hidden rounded-3xl">
          <ProjectImage src={EXAMPLE_IMAGES.rotulosCorporeos.src} alt={EXAMPLE_IMAGES.rotulosCorporeos.alt} className="aspect-[4/3] w-full" />
        </Reveal>
      </div>

      <div className="mt-20 grid gap-4 md:grid-cols-3">
        {VALUES.map(([title, text], i) => (
          <Reveal key={title} delay={i * 0.06} className="rounded-3xl bg-surface p-6">
            <p className="text-lg font-bold">{title}</p>
            <p className="mt-2 text-muted">{text}</p>
          </Reveal>
        ))}
      </div>

      <section id="contacto" className="mt-20 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <h2 className="text-3xl font-extrabold">Contacto</h2>
          {hasContact ? (
            <dl className="mt-6 space-y-4">
              {s.phone && (
                <div>
                  <dt className="text-sm text-muted">Teléfono</dt>
                  <dd className="font-semibold">
                    <a href={`tel:${s.phone.replace(/\s+/g, '')}`}>{s.phone}</a>
                  </dd>
                </div>
              )}
              {s.email && (
                <div>
                  <dt className="text-sm text-muted">Correo</dt>
                  <dd className="font-semibold">
                    <a href={`mailto:${s.email}`}>{s.email}</a>
                  </dd>
                </div>
              )}
              {s.address && (
                <div>
                  <dt className="text-sm text-muted">Dirección</dt>
                  <dd className="font-semibold">{s.address}</dd>
                </div>
              )}
              {s.hours && (
                <div>
                  <dt className="text-sm text-muted">Horario</dt>
                  <dd className="font-semibold">{s.hours}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="mt-4 text-muted">Escríbenos por el chat o solicita una cotización y te contactamos.</p>
          )}
        </Reveal>
        {s.address && (
          <Reveal delay={0.08} className="overflow-hidden rounded-3xl bg-line">
            {/* Mapa embebido sin clave de API: se carga solo al verlo */}
            <iframe
              title={`Mapa: ${s.address}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-80 w-full border-0"
            />
          </Reveal>
        )}
      </section>
    </div>
  );
};

export default About;
