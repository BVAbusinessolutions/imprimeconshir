/**
 * Imágenes temporales para presentación (Picsum: fotos libres de uso).
 * La misma `seed` siempre devuelve la misma foto.
 * Para usar fotos reales: define `cover`/`image` en categories.js o `images` en cada producto,
 * y estas dejan de usarse automáticamente.
 */
export const placeholderImage = (seed, width = 1200, height = 900) =>
  `https://picsum.photos/seed/shir-${encodeURIComponent(seed)}/${width}/${height}`;
