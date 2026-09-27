import { EXAMPLE_BY_SLUG } from './exampleImages';

/**
 * Categorías principales del catálogo (navegación superior).
 * `slug` es el valor que se guarda en `products.category` / `products.subcategory` en Firestore.
 * `cover` (categoría) e `image` (subcategoría) admiten una URL; si faltan se usa una foto de ejemplo (exampleImages.js).
 */
const RAW_CATEGORIES = [
  {
    slug: 'gran-formato',
    name: 'Gran Formato',
    fullName: 'Impresión de Gran Formato',
    tagline: 'Lonas, vinil, vehículos y rótulos que se ven a distancia.',
    cover: null,
    subcategories: [
      { slug: 'lonas', name: 'Lonas' },
      { slug: 'vinil', name: 'Vinil' },
      { slug: 'rotulacion-vehicular', name: 'Rotulación de vehículos' },
      { slug: 'rotulos-corporeos', name: 'Rótulos corpóreos' },
    ],
  },
  {
    slug: 'pequeno-formato',
    name: 'Pequeño Formato',
    fullName: 'Pequeño Formato y Litografía',
    tagline: 'Cajas, papelería y rollos térmicos con acabado impecable.',
    cover: null,
    subcategories: [
      { slug: 'cajas', name: 'Cajas' },
      { slug: 'papeleria', name: 'Papelería' },
      { slug: 'rollos-termicos', name: 'Rollos térmicos' },
    ],
  },
  {
    slug: 'publicidad-eventos',
    name: 'Publicidad y Eventos',
    fullName: 'Publicidad, Mercadeo y Eventos Masivos',
    tagline: 'Stands, material POP y montaje para eventos que llenan.',
    cover: null,
    subcategories: [
      { slug: 'stands', name: 'Stands' },
      { slug: 'material-pop', name: 'Material POP' },
      { slug: 'activaciones', name: 'Activaciones de marca' },
      { slug: 'senalizacion-eventos', name: 'Señalización de eventos' },
    ],
  },
  {
    slug: 'promocionales',
    name: 'Promocionales',
    fullName: 'Promocionales / Branding',
    tagline: 'Artículos con tu marca que la gente sí conserva.',
    cover: null,
    subcategories: [
      { slug: 'articulos-promocionales', name: 'Artículos promocionales' },
      { slug: 'textiles', name: 'Textiles y uniformes' },
      { slug: 'kits-corporativos', name: 'Kits corporativos' },
    ],
  },
];

// Mientras no haya fotos reales, cada categoría y subcategoría usa una foto de ejemplo
export const CATEGORIES = RAW_CATEGORIES.map((c) => ({
  ...c,
  cover: c.cover ?? EXAMPLE_BY_SLUG[c.slug]?.src ?? null,
  subcategories: c.subcategories.map((s) => ({ ...s, image: s.image ?? EXAMPLE_BY_SLUG[s.slug]?.src ?? null })),
}));

export const getCategory = (slug) => CATEGORIES.find((c) => c.slug === slug) ?? null;

/** Imagen de respaldo para un producto sin fotos: la de su subcategoría o categoría */
export const fallbackImageFor = (product) => {
  const category = getCategory(product?.category);
  return category?.subcategories.find((s) => s.slug === product?.subcategory)?.image ?? category?.cover ?? null;
};
