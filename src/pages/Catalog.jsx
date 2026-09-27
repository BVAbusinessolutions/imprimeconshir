import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Reveal from '../components/motion/Reveal';
import ProjectImage from '../components/media/ProjectImage';
import ProductCard, { ProductCardSkeleton } from '../components/catalog/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { CATEGORIES, getCategory } from '../data/categories';
import NotFound from './NotFound';

const SubcategoryTile = ({ category, sub, tone }) => (
  <Link to={`/catalogo/${category.slug}?sub=${sub.slug}`} className="group block">
    <div className="overflow-hidden rounded-2xl">
      <ProjectImage src={sub.image} alt={sub.name} label={sub.name} tone={tone} className="aspect-[4/5] w-full" />
    </div>
    <p className="mt-3 font-semibold">{sub.name}</p>
  </Link>
);

/** Vista general: todas las categorías con sus subcategorías */
const CatalogOverview = () => (
  <div className="space-y-24">
    {CATEGORIES.map((c, ci) => (
      <section key={c.slug} aria-labelledby={`cat-${c.slug}`}>
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id={`cat-${c.slug}`} className="text-3xl font-extrabold">
              {c.fullName}
            </h2>
            <p className="mt-2 text-muted">{c.tagline}</p>
          </div>
          <Link to={`/catalogo/${c.slug}`} className="text-sm font-semibold underline-offset-4 hover:underline">
            Ver todo
          </Link>
        </Reveal>
        <Reveal delay={0.08} className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {c.subcategories.map((s, si) => (
            <SubcategoryTile key={s.slug} category={c} sub={s} tone={ci + si} />
          ))}
        </Reveal>
      </section>
    ))}
  </div>
);

/** Vista de una categoría: filtro por subcategoría + productos de Firestore */
const CategoryView = ({ category }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSub = searchParams.get('sub');
  const { data: products = [], isLoading, isError } = useProducts(category.slug);

  const visible = activeSub ? products.filter((p) => p.subcategory === activeSub) : products;
  const subName = (slug) => category.subcategories.find((s) => s.slug === slug)?.name ?? category.name;

  const setSub = (slug) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set('sub', slug);
    else next.delete('sub');
    setSearchParams(next, { replace: true });
  };

  const chipClass = (active) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
      active ? 'border-ink bg-ink text-white' : 'border-line bg-surface hover:border-ink/40'
    }`;

  return (
    <>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtrar por tipo">
        <button type="button" aria-pressed={!activeSub} onClick={() => setSub(null)} className={chipClass(!activeSub)}>
          Todo
        </button>
        {category.subcategories.map((s) => (
          <button
            key={s.slug}
            type="button"
            aria-pressed={activeSub === s.slug}
            onClick={() => setSub(s.slug)}
            className={chipClass(activeSub === s.slug)}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {isLoading && Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)}

        {!isLoading &&
          visible.map((p, i) => (
            <ProductCard key={p.id} product={p} subcategoryName={subName(p.subcategory)} tone={i} />
          ))}

        {/* Sin productos cargados aún (o sin conexión): mostrar las subcategorías */}
        {!isLoading &&
          visible.length === 0 &&
          category.subcategories
            .filter((s) => !activeSub || s.slug === activeSub)
            .map((s, i) => <SubcategoryTile key={s.slug} category={category} sub={s} tone={i} />)}
      </div>

      {!isLoading && (isError || visible.length === 0) && (
        <p className="mt-10 text-sm text-muted">
          Pronto verás aquí nuestros proyectos.{' '}
          <Link to="/cotizar" className="font-semibold text-ink underline underline-offset-4">
            Cotiza el tuyo
          </Link>
        </p>
      )}
    </>
  );
};

const Catalog = () => {
  const { categoria } = useParams();
  const category = categoria ? getCategory(categoria) : null;

  if (categoria && !category) return <NotFound />;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16 lg:px-8">
      <Helmet>
        <title>{`${category ? category.fullName : 'Catálogo'} | IMPRIME con SHIR`}</title>
        {category && <meta name="description" content={category.tagline} />}
      </Helmet>

      <Reveal className="mb-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Catálogo</p>
        <h1 className="mt-3 text-[clamp(2.25rem,5vw,4rem)] leading-none font-black">
          {category ? category.fullName : 'Todo lo que imprimimos.'}
        </h1>
        {category && <p className="mt-4 max-w-xl text-muted">{category.tagline}</p>}
      </Reveal>

      {category ? <CategoryView key={category.slug} category={category} /> : <CatalogOverview />}
    </div>
  );
};

export default Catalog;
