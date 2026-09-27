/**
 * Plantillas de correo del panel. {contacto} se reemplaza con los datos de Configuración;
 * los demás campos entre corchetes los completa quien escribe.
 */
export const EMAIL_TEMPLATES = [
  {
    id: 'cotizacion',
    name: 'Cotización lista',
    subject: 'Tu cotización de IMPRIME con SHIR',
    body: 'Hola [nombre],\n\nYa tenemos lista tu cotización de [producto]:\n\nTotal: $[monto] MXN (IVA incluido)\nTiempo de entrega: [días] días hábiles\n\nSi te parece bien, responde este correo y arrancamos.\n\n¡Gracias por confiar en nosotros!\n{contacto}',
  },
  {
    id: 'recordatorio-cita',
    name: 'Recordatorio de cita',
    subject: 'Recordatorio: tu visita técnica',
    body: 'Hola [nombre],\n\nTe recordamos tu visita técnica el [día] a las [hora] en [dirección].\nNuestro técnico te contactará antes de llegar.\n\nSi necesitas cambiar la fecha, responde este correo.\n{contacto}',
  },
  {
    id: 'pedido-listo',
    name: 'Pedido listo',
    subject: 'Tu pedido está listo',
    body: 'Hola [nombre],\n\n¡Tu pedido [folio] está listo! Puedes pasar por él o coordinamos la entrega.\n{contacto}',
  },
  {
    id: 'promocion',
    name: 'Promoción de temporada',
    subject: 'Promoción del mes en IMPRIME con SHIR',
    body: 'Hola,\n\nEste mes tenemos [promoción] en [productos]. Válido hasta el [fecha].\n\nCotiza al instante en nuestra web o responde este correo.\n{contacto}\n\nSi ya no quieres recibir promociones, responde con la palabra BAJA.',
  },
  {
    id: 'pedido-proveedor',
    name: 'Pedido a proveedor',
    subject: 'Pedido de material',
    body: 'Hola,\n\nQueremos pedir:\n- [material] — [cantidad]\n\nPor favor confírmanos precio y tiempo de entrega.\n\nGracias,\nIMPRIME con SHIR',
  },
];

/** Firma con los datos públicos de contacto. */
export const contactSignature = (s = {}) =>
  ['IMPRIME con SHIR', s.phone && `Tel. ${s.phone}`, s.email, s.address].filter(Boolean).join('\n');

export const fillTemplate = (text, settings) => text.replaceAll('{contacto}', contactSignature(settings));
