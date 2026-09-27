/**
 * Estados de logística y citas. Zonas, punto de salida, mensajeros y técnicos
 * se editan en Admin → Configuración (valores por defecto en settingsDefaults.js).
 */
export const DELIVERY_STATUS = {
  pending: 'Pendiente',
  on_route: 'En ruta',
  delivered: 'Entregado',
  failed: 'No entregado',
};

export const APPOINTMENT_STATUS = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  done: 'Realizada',
  cancelled: 'Cancelada',
};
