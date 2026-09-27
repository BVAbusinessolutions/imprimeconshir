/**
 * Colores de gráficas (paleta de referencia de la guía de visualización).
 * Validada sobre la superficie #f8f8f6: separación CVD y visión normal PASS; aqua y amarillo
 * quedan bajo 3:1 de contraste, por eso las gráficas llevan etiquetas visibles y vista de tabla.
 * Orden fijo por categoría: el color sigue a la categoría, nunca a su posición en un ranking.
 */
export const SERIES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100'];

export const CATEGORY_COLORS = {
  'gran-formato': SERIES[0],
  'pequeno-formato': SERIES[1],
  'publicidad-eventos': SERIES[2],
  promocionales: SERIES[3],
};

export const VIZ = {
  surface: '#f8f8f6',
  grid: '#e4e4e0',
  axis: '#5c5c57',
  text: '#161616',
  muted: '#5c5c57',
};
