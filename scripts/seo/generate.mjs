/**
 * Genera dist/robots.txt y dist/sitemap.xml después del build (npm run build lo ejecuta solo).
 * La URL del sitio sale de VITE_SITE_URL (.env.local o variable de entorno).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dist = resolve(root, 'dist');
if (!existsSync(dist)) {
  console.error('No existe dist/: ejecuta primero vite build');
  process.exit(1);
}

const env = loadEnv('production', root, 'VITE_');
const site = (env.VITE_SITE_URL || '').replace(/\/+$/, '');

// Rutas privadas: no se indexan
const PRIVATE = ['/admin', '/perfil', '/mis-pedidos', '/checkout', '/carrito', '/disenador', '/login', '/registro'];

// Slugs de categorías (las entradas con `fullName`), leídos del archivo para no depender de la resolución de Vite
const categoriesSource = readFileSync(resolve(root, 'src/data/categories.js'), 'utf8');
const CATEGORIES = [...categoriesSource.matchAll(/slug: '([^']+)',\s*name: '[^']+',\s*fullName:/g)].map((m) => ({ slug: m[1] }));
const PUBLIC = [
  ['/', '1.0', 'weekly'],
  ['/catalogo', '0.9', 'weekly'],
  ...CATEGORIES.map((c) => [`/catalogo/${c.slug}`, '0.8', 'weekly']),
  ['/proyectos', '0.8', 'weekly'],
  ['/cotizar', '0.8', 'monthly'],
  ['/previsualizar', '0.6', 'monthly'],
  ['/guia-de-archivos', '0.6', 'monthly'],
  ['/preguntas-frecuentes', '0.6', 'monthly'],
  ['/nosotros', '0.5', 'monthly'],
  ['/aviso-de-privacidad', '0.2', 'yearly'],
  ['/terminos', '0.2', 'yearly'],
];

const robots = ['User-agent: *', 'Allow: /', ...PRIVATE.map((p) => `Disallow: ${p}`), site ? `\nSitemap: ${site}/sitemap.xml` : ''].join('\n');
writeFileSync(resolve(dist, 'robots.txt'), robots.trim() + '\n');

if (site) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = PUBLIC.map(
    ([path, priority, freq]) =>
      `  <url><loc>${site}${path}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`
  ).join('\n');
  writeFileSync(
    resolve(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
  console.log(`SEO: robots.txt y sitemap.xml (${PUBLIC.length} URLs) para ${site}`);
} else {
  console.log('SEO: robots.txt generado. Define VITE_SITE_URL para generar sitemap.xml.');
}
