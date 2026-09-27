/**
 * Fotos de ejemplo mientras llegan las fotos reales de trabajos de IMPRIME con SHIR.
 * Todas son CC0 (dominio público) del directorio de fotos de WordPress: no requieren atribución,
 * pero se guarda `credit` con la página original por transparencia.
 * Para reemplazarlas basta con cambiar `src` (o definir `cover`/`image` en categories.js).
 */
const photo = (src, alt, credit) => ({ src, alt, credit });

export const EXAMPLE_IMAGES = {
  // Portadas de categoría
  granFormato: photo(
    'https://pd.w.org/2025/05/52268342a57e5a333.63968278-1024x683.jpg',
    'Rótulo luminoso de gran formato en una fachada',
    'https://wordpress.org/photos/photo/52268342a5/'
  ),
  pequenoFormato: photo(
    'https://pd.w.org/2022/12/888639c77c8a0b281.91486273-1024x683.jpeg',
    'Pilas de libretas negras con acabado profesional',
    'https://wordpress.org/photos/photo/888639c77c/'
  ),
  publicidadEventos: photo(
    'https://pd.w.org/2025/08/42468ae307fe7f417.38948853-1024x683.jpg',
    'Público escuchando a un ponente en un evento',
    'https://wordpress.org/photos/photo/42468ae307/'
  ),
  promocionales: photo(
    'https://pd.w.org/2022/11/6226383ad14a30960.57443512-1024x577.jpg',
    'Tazas de colores alineadas',
    'https://wordpress.org/photos/photo/6226383ad1/'
  ),

  // Gran formato
  lonas: photo(
    'https://pd.w.org/2025/09/73468d2e65ccb5fd3.21522740-1024x576.jpeg',
    'Fachada comercial con letreros impresos',
    'https://wordpress.org/photos/photo/73468d2e65/'
  ),
  vinil: photo(
    'https://pd.w.org/2024/11/385672a9ef02355d3.21519311-1024x683.jpg',
    'Vitrina cubierta de stickers de vinil',
    'https://wordpress.org/photos/photo/385672a9ef/'
  ),
  rotulacionVehicular: photo(
    'https://pd.w.org/2025/09/57268b72026d83b24.99356257-1024x433.jpeg',
    'Food truck con rotulación integral',
    'https://wordpress.org/photos/photo/57268b7202/'
  ),
  rotulosCorporeos: photo(
    'https://pd.w.org/2025/12/408694afc954aad95.65341393-1024x576.jpg',
    'Letras corpóreas rojas en tres dimensiones',
    'https://wordpress.org/photos/photo/408694afc9/'
  ),

  // Pequeño formato y litografía
  cajas: photo(
    'https://pd.w.org/2023/12/53365787e6db2f2c7.79885840-1024x1017.jpg',
    'Cajas impresas con acabado dorado',
    'https://wordpress.org/photos/photo/53365787e6/'
  ),
  papeleria: photo(
    'https://pd.w.org/2025/08/54368a4c048cb9933.51167001-1024x576.jpg',
    'Libretas con portadas impresas',
    'https://wordpress.org/photos/photo/54368a4c04/'
  ),
  rollosTermicos: photo(
    'https://pd.w.org/2023/03/40364079bbc64b1e9.33231026-1024x768.jpg',
    'Rollo de etiquetas impresas',
    'https://wordpress.org/photos/photo/40364079bb/'
  ),

  // Publicidad, mercadeo y eventos
  stands: photo(
    'https://pd.w.org/2026/04/31869ce0ced6b1863.43675135-1024x753.jpg',
    'Stand de exhibición en una feria',
    'https://wordpress.org/photos/photo/31869ce0ce/'
  ),
  materialPop: photo(
    'https://pd.w.org/2026/05/2396a0d87f21312b0.53197417-1024x768.jpg',
    'Letrero impreso para punto de venta',
    'https://wordpress.org/photos/photo/2396a0d87f/'
  ),
  activaciones: photo(
    'https://pd.w.org/2026/01/46169733650dff2d2.08661171-1024x768.jpg',
    'Escenario de evento con letras iluminadas',
    'https://wordpress.org/photos/photo/4616973365/'
  ),
  senalizacionEventos: photo(
    'https://pd.w.org/2022/09/89563211ad21fa515.66005029-2048x1536.jpg',
    'Señalización de punto de encuentro en un centro de convenciones',
    'https://wordpress.org/photos/photo/89563211ad/'
  ),

  // Promocionales / branding
  articulosPromocionales: photo(
    'https://pd.w.org/2025/01/386793599e81e560.19124802-769x1024.jpg',
    'Taza con ilustración impresa',
    'https://wordpress.org/photos/photo/386793599e/'
  ),
  textiles: photo(
    'https://pd.w.org/2024/10/4796710dba2995844.87644023-1024x576.jpg',
    'Playeras tipo polo con logotipo bordado',
    'https://wordpress.org/photos/photo/4796710dba/'
  ),
  kitsCorporativos: photo(
    'https://pd.w.org/2025/12/120694383a5c25fd6.14424525-768x1024.jpeg',
    'Cajas de regalo para kits corporativos',
    'https://wordpress.org/photos/photo/120694383a/'
  ),

  // Extras para el mosaico del inicio
  letreros: photo(
    'https://pd.w.org/2025/09/13568d27c702efe05.36307979-1024x768.jpg',
    'Letra corpórea montada en muro',
    'https://wordpress.org/photos/photo/13568d27c7/'
  ),
  plumas: photo(
    'https://pd.w.org/2024/04/1556621057a869b44.91210437-1024x713.jpg',
    'Plumas de colores sobre papel',
    'https://wordpress.org/photos/photo/1556621057/'
  ),
  tazas: photo(
    'https://pd.w.org/2026/06/936a23055553d5b7.24974911-768x1024.jpg',
    'Tazas de colores en exhibición',
    'https://wordpress.org/photos/photo/936a230555/'
  ),
};

// slug de categoría/subcategoría → foto de ejemplo
export const EXAMPLE_BY_SLUG = {
  'gran-formato': EXAMPLE_IMAGES.granFormato,
  'pequeno-formato': EXAMPLE_IMAGES.pequenoFormato,
  'publicidad-eventos': EXAMPLE_IMAGES.publicidadEventos,
  promocionales: EXAMPLE_IMAGES.promocionales,
  lonas: EXAMPLE_IMAGES.lonas,
  vinil: EXAMPLE_IMAGES.vinil,
  'rotulacion-vehicular': EXAMPLE_IMAGES.rotulacionVehicular,
  'rotulos-corporeos': EXAMPLE_IMAGES.rotulosCorporeos,
  cajas: EXAMPLE_IMAGES.cajas,
  papeleria: EXAMPLE_IMAGES.papeleria,
  'rollos-termicos': EXAMPLE_IMAGES.rollosTermicos,
  stands: EXAMPLE_IMAGES.stands,
  'material-pop': EXAMPLE_IMAGES.materialPop,
  activaciones: EXAMPLE_IMAGES.activaciones,
  'senalizacion-eventos': EXAMPLE_IMAGES.senalizacionEventos,
  'articulos-promocionales': EXAMPLE_IMAGES.articulosPromocionales,
  textiles: EXAMPLE_IMAGES.textiles,
  'kits-corporativos': EXAMPLE_IMAGES.kitsCorporativos,
};
