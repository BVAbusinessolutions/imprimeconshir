/**
 * Configuración de logística. Ajustar a la ciudad real (ver pendientes/README.md):
 * zonas de reparto, dirección de salida del taller y mensajeros.
 */
export const ZONES = ['Centro', 'Norte', 'Sur', 'Oriente', 'Poniente'];

// Punto de salida de las rutas. Con coordenadas (lat/lng) las paradas se ordenan por cercanía.
export const ORIGIN = { address: 'Taller IMPRIME con SHIR', lat: null, lng: null };

export const COURIERS = ['Mensajero 1', 'Mensajero 2'];

export const DELIVERY_STATUS = {
  pending: 'Pendiente',
  on_route: 'En ruta',
  delivered: 'Entregado',
  failed: 'No entregado',
};
