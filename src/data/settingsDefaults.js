/**
 * Valores por defecto de la configuración. Lo que Shirlene guarde en Admin → Configuración
 * (Firestore: settings/public y settings/operations) tiene prioridad sobre esto.
 */

// Contacto público del negocio (lo ve cualquiera: pie de página, correos)
export const PUBLIC_DEFAULTS = {
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  hours: '',
  facebook: '',
  instagram: '',
  tiktok: '',
};

// Operación interna (solo admin)
export const OPERATIONS_DEFAULTS = {
  origin: { address: 'Taller IMPRIME con SHIR', lat: null, lng: null },
  zones: ['Centro', 'Norte', 'Sur', 'Oriente', 'Poniente'],
  couriers: ['Mensajero 1', 'Mensajero 2'],
  technicians: [], // [{ id, name, phone, email }]
  alertEmail: '',
  minMargin: 0.25,
};
