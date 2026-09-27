/**
 * Categorías principales del catálogo (navegación superior).
 * `slug` es el valor que se guarda en `products.category` / `products.subcategory` en Firestore.
 * `cover` admite una URL de imagen; mientras no haya fotos se muestra un placeholder.
 */
export const CATEGORIES = [
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

export const getCategory = (slug) => CATEGORIES.find((c) => c.slug === slug) ?? null;
