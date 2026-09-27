import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import Reveal from '../components/motion/Reveal';
import Button from '../components/ui/Button';
import ProjectImage from '../components/media/ProjectImage';
import BeforeAfterSlider from '../components/media/BeforeAfterSlider';
import { getProjects } from '../services/contentService';
import { CATEGORIES, getCategory } from '../data/categories';

// Mientras no haya proyectos reales, se muestran las fotos de ejemplo de cada subcategoría
const EXAMPLES = CATEGORIES.flatMap((c) =>
  c.subcategories.map((s) => ({ id: `ej-${s.slug}`, title: s.name, category: c.slug, subcategory: s.slug, images: [s.image], example: true }))
);

const ProjectDialog = ({ project, onClose }) => {
  const ref = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const dialog = ref.current;
    if (project && dialog && !dialog.open) dialog.showModal();
  }, [project]);

  if (!project) return null;
  const images = project.images?.filter(Boolean) ?? [];
  const category = getCategory(project.category);
  const hasBeforeAfter = project.beforeImage && project.afterImage;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current.close()}
      aria-labelledby="project-title"
      className="m-auto w-[min(1000px,calc(100%-2rem))] max-h-[90dvh] overflow-y-auto rounded-3xl bg-paper p-0 text-ink backdrop:bg-ink/70 backdrop:backdrop-blur-sm"
    >
      <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {hasBeforeAfter ? (
            <BeforeAfterSlider
              className="aspect-[4/3]"
              label={`Antes y después: ${project.title}`}
              before={<img src={project.beforeImage} alt="" className="h-full w-full object-cover" />}
              after={<img src={project.afterImage} alt="" className="h-full w-full object-cover" />}
            />
          ) : (
            <div className="overflow-hidden rounded-2xl">
              <ProjectImage src={images[active]} alt={project.title} className="aspect-[4/3] w-full" />
            </div>
          )}
          {!hasBeforeAfter && images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  aria-label={`Foto ${i + 1}`}
                  aria-pressed={i === active}
                  onClick={() => setActive(i)}
                  className={`overflow-hidden rounded-xl ${i === active ? 'ring-2 ring-ink' : 'opacity-70 hover:opacity-100'}`}
                >
                  <ProjectImage src={src} className="aspect-square w-full" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">{category?.name}</p>
            <button type="button" onClick={() => ref.current.close()} className="text-sm font-semibold" autoFocus>
              Cerrar
            </button>
          </div>
          <h2 id="project-title" className="mt-2 text-3xl font-extrabold">
            {project.title}
          </h2>
          {project.client && <p className="mt-1 text-muted">Para {project.client}</p>}
          {project.description && <p className="mt-4 leading-relaxed">{project.description}</p>}
          {project.example && <p className="mt-4 text-sm text-muted">Foto de ejemplo. Pronto verás aquí nuestros trabajos reales.</p>}
          <div className="mt-auto pt-8">
            <Button to={`/cotizar?categoria=${project.category}${project.subcategory ? `&sub=${project.subcategory}` : ''}`} className="w-full">
              Quiero algo así
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

const Projects = () => {
  const { data = [], isLoading } = useQuery({ queryKey: ['projects'], queryFn: getProjects, staleTime: 5 * 60 * 1000 });
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(null);

  const projects = data.length ? data : EXAMPLES;
  const visible = filter ? projects.filter((p) => p.category === filter) : projects;

  const chip = (active) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
      active ? 'border-ink bg-ink text-white' : 'border-line bg-surface hover:border-ink/40'
    }`;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
      <Helmet>
        <title>Proyectos | IMPRIME con SHIR</title>
        <meta name="description" content="Rotulación, lonas, stands, papelería y promocionales que hemos producido e instalado." />
      </Helmet>

      <Reveal className="mb-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Portafolio</p>
        <h1 className="mt-3 text-[clamp(2.25rem,5vw,4rem)] leading-none font-black">Proyectos.</h1>
      </Reveal>

      <div className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filtrar por categoría">
        <button type="button" aria-pressed={!filter} onClick={() => setFilter('')} className={chip(!filter)}>
          Todos
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.slug} type="button" aria-pressed={filter === c.slug} onClick={() => setFilter(c.slug)} className={chip(filter === c.slug)}>
            {c.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-line" />
          ))}
        </div>
      ) : (
        // Columnas tipo Fotobook: las fotos mantienen su proporción
        <div className="columns-2 gap-3 md:columns-3 [&>*]:mb-3">
          {visible.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setOpen(p)}
              className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl text-left"
            >
              <ProjectImage
                src={p.images?.[0]}
                alt={p.title}
                label={p.title}
                showLabel
                tone={i}
                className={i % 3 === 0 ? 'aspect-[4/5] w-full' : 'aspect-[4/3] w-full'}
              />
            </button>
          ))}
        </div>
      )}

      {!data.length && !isLoading && (
        <p className="mt-6 text-sm text-muted">
          Fotos de ejemplo mientras cargamos nuestros trabajos.{' '}
          <Link to="/cotizar" className="font-semibold text-ink underline underline-offset-4">
            Cotiza el tuyo
          </Link>
        </p>
      )}

      <ProjectDialog key={open?.id} project={open} onClose={() => setOpen(null)} />
    </div>
  );
};

export default Projects;
