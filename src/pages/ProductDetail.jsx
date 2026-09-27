import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import ProjectImage from '../components/media/ProjectImage';
import { useProduct } from '../hooks/useProducts';
import { getCategory } from '../data/categories';
import useCartStore from '../store/cartStore';
import { formatCurrency } from '../utils/helpers';
import { placeholderImage } from '../data/placeholderImages';

const ProductDetail = () => {
  const { id } = useParams();
  const { data: product, isLoading, isError } = useProduct(id);
  const addItem = useCartStore((s) => s.addItem);
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-12 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8" aria-busy="true">
        <div className="aspect-[4/3] animate-pulse rounded-3xl bg-line" />
        <div className="space-y-4">
          <div className="h-10 w-3/4 animate-pulse rounded bg-line" />
          <div className="h-4 w-full animate-pulse rounded bg-line" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-line" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-4xl font-extrabold">No encontramos este producto.</h1>
        <Button to="/catalogo" variant="outline" className="mt-8">
          Volver al catálogo
        </Button>
      </section>
    );
  }

  const category = getCategory(product.category);
  const subcategory = category?.subcategories.find((s) => s.slug === product.subcategory);
  const images = product.images?.length ? product.images : [placeholderImage(product.id)];

  const handleAddToCart = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.images?.[0] ?? null });
    toast.success('Agregado al carrito');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <Helmet>
        <title>{`${product.name} | IMPRIME con SHIR`}</title>
        {product.description && <meta name="description" content={product.description.slice(0, 155)} />}
      </Helmet>

      <nav aria-label="Ruta" className="mb-8 text-sm text-muted">
        <Link to="/catalogo" className="hover:text-ink">
          Catálogo
        </Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <Link to={`/catalogo/${category.slug}`} className="hover:text-ink">
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        {/* Galería */}
        <div>
          <div className="overflow-hidden rounded-3xl">
            <ProjectImage src={images[activeImage]} alt={product.name} label={product.name} className="aspect-[4/3] w-full" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-3">
              {images.map((src, i) => (
                <button
                  key={src ?? i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  aria-pressed={i === activeImage}
                  className={`overflow-hidden rounded-xl ring-offset-2 ring-offset-paper transition ${
                    i === activeImage ? 'ring-2 ring-ink' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <ProjectImage src={src} tone={i} className="aspect-square w-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información */}
        <div className="lg:sticky lg:top-36 lg:self-start">
          {subcategory && (
            <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">{subcategory.name}</p>
          )}
          <h1 className="mt-3 text-4xl leading-tight font-extrabold sm:text-5xl">{product.name}</h1>
          {product.price > 0 && (
            <p className="mt-4 text-lg">
              Desde <span className="font-semibold">{formatCurrency(product.price)}</span>
            </p>
          )}
          {product.description && <p className="mt-6 leading-relaxed text-muted">{product.description}</p>}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Button to={`/cotizar?producto=${product.id}`} size="lg" className="flex-1">
              Cotizar este producto
            </Button>
            {product.price > 0 && (
              <Button variant="outline" size="lg" onClick={handleAddToCart} className="flex-1">
                Agregar al carrito
              </Button>
            )}
          </div>
          <Link to="/previsualizar" className="mt-6 inline-block text-sm font-semibold underline-offset-4 hover:underline">
            Probar con mi logo
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
