import { useQuery } from '@tanstack/react-query';
import Reveal from '../motion/Reveal';
import { getPublishedTestimonials } from '../../services/contentService';

/**
 * Testimonios reales publicados desde Admin → Portafolio.
 * Si no hay ninguno publicado, la sección no se muestra (nunca se inventan reseñas).
 */
const Testimonials = () => {
  const { data = [] } = useQuery({ queryKey: ['testimonials'], queryFn: getPublishedTestimonials, staleTime: 10 * 60 * 1000 });
  if (!data.length) return null;

  return (
    <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="testimonios">
      <Reveal>
        <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Clientes</p>
        <h2 id="testimonios" className="mt-3 text-3xl font-extrabold sm:text-4xl">
          Lo que dicen de nosotros.
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {data.slice(0, 6).map((t, i) => (
          <Reveal key={t.id} delay={(i % 3) * 0.06}>
            <figure className="flex h-full flex-col rounded-3xl bg-surface p-6">
              <blockquote className="flex-1 text-lg leading-relaxed">“{t.text}”</blockquote>
              <figcaption className="mt-6 text-sm">
                <span className="font-semibold">{t.name}</span>
                {t.company && <span className="text-muted"> · {t.company}</span>}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
