/**
 * Respuestas simuladas de n8n para desarrollar sin backend.
 * Siguen exactamente el contrato documentado en docs/n8n-webhooks.md.
 */
import { v4 as uuidv4 } from 'uuid';
import { addDays, format } from 'date-fns';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Precios de referencia simulados (MXN): por m² o por pieza
const PRICE_TABLE = {
  lonas: { unit: 'm2', price: 180 },
  vinil: { unit: 'm2', price: 260 },
  'rotulacion-vehicular': { unit: 'm2', price: 650 },
  'rotulos-corporeos': { unit: 'm2', price: 2800 },
  cajas: { unit: 'pieza', price: 14 },
  papeleria: { unit: 'pieza', price: 3.5 },
  'rollos-termicos': { unit: 'pieza', price: 22 },
  stands: { unit: 'pieza', price: 8500 },
  'material-pop': { unit: 'pieza', price: 450 },
  activaciones: { unit: 'pieza', price: 6000 },
  'senalizacion-eventos': { unit: 'm2', price: 320 },
  'articulos-promocionales': { unit: 'pieza', price: 38 },
  textiles: { unit: 'pieza', price: 145 },
  'kits-corporativos': { unit: 'pieza', price: 520 },
};

// Trabajos que requieren visita técnica para tomar medidas
const NEEDS_VISIT = new Set(['rotulacion-vehicular', 'rotulos-corporeos', 'stands']);

const suggestedSlots = () =>
  [1, 2, 3].flatMap((d) => {
    const day = format(addDays(new Date(), d), 'yyyy-MM-dd');
    return [`${day}T10:00`, `${day}T16:00`];
  });

const buildQuote = ({ subcategory, width, height, unit, quantity }) => {
  const rule = PRICE_TABLE[subcategory] ?? { unit: 'pieza', price: 100 };
  const factor = unit === 'cm' ? 0.01 : 1;
  const area = Math.max((Number(width) || 0) * factor * (Number(height) || 0) * factor, 0.5);
  const qty = Math.max(Number(quantity) || 1, 1);
  const base = rule.unit === 'm2' ? area * qty * rule.price : qty * rule.price;
  const design = 350;
  const subtotal = Math.round(base + design);
  const tax = Math.round(subtotal * 0.16);

  return {
    items: [
      {
        concept: rule.unit === 'm2' ? `Impresión ${area.toFixed(2)} m² × ${qty}` : `Producción ${qty} pzas`,
        amount: Math.round(base),
      },
      { concept: 'Ajuste de diseño y preprensa', amount: design },
    ],
    subtotal,
    tax,
    total: subtotal + tax,
    currency: 'MXN',
    validUntil: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
  };
};

export const mockChat = async ({ message }) => {
  await delay(900 + Math.random() * 700);
  const text = message.toLowerCase();

  if (/(rotul|veh[ií]culo|camioneta|carro|auto|flotilla|medir|medidas)/.test(text)) {
    return {
      reply:
        '¡Qué buen proyecto! Para rotular un vehículo necesitamos tomar medidas exactas. Te agendo una visita con uno de nuestros ninjas y te llevamos propuesta y precio final.',
      intent: 'appointment',
      appointment: { reason: 'Medición para rotulación vehicular', suggestedSlots: suggestedSlots() },
    };
  }

  if (/(cotiz|precio|cu[aá]nto|costo|lona|vinil|tarjeta)/.test(text)) {
    return {
      reply:
        'Te dejo una pre-cotización rápida de una lona de 2 × 1 m. Si me das tus medidas y cantidad exactas, te la ajusto al momento.',
      intent: 'quote',
      quote: { quoteId: `PRE-${uuidv4().slice(0, 6).toUpperCase()}`, status: 'preliminary', ...buildQuote({ subcategory: 'lonas', width: 2, height: 1, unit: 'm', quantity: 1 }) },
      suggestions: ['Quiero otras medidas', 'Necesito 10 piezas', 'Cotización formal'],
    };
  }

  return {
    reply:
      '¡Hola! Soy del equipo de IMPRIME con SHIR. Cuéntame qué necesitas imprimir y te ayudo a cotizarlo en minutos.',
    intent: 'general',
    suggestions: ['Cotizar una lona', 'Rotular mi camioneta', 'Material para un evento'],
  };
};

export const mockQuote = async (payload) => {
  await delay(1400);
  const quoteId = `COT-${uuidv4().slice(0, 6).toUpperCase()}`;

  if (NEEDS_VISIT.has(payload.subcategory)) {
    return {
      quoteId,
      status: 'requires_visit',
      message: 'Este trabajo necesita medidas en sitio. Agenda una visita y te enviamos el precio final.',
      appointment: { reason: 'Visita técnica para medición', suggestedSlots: suggestedSlots() },
    };
  }

  return {
    quoteId,
    status: 'preliminary',
    message: 'Pre-cotización lista. Un asesor te confirma el precio final en minutos.',
    ...buildQuote(payload),
  };
};

export const mockAppointment = async () => {
  await delay(1000);
  return {
    appointmentId: `CITA-${uuidv4().slice(0, 6).toUpperCase()}`,
    status: 'confirmed',
    message: 'Cita agendada. Te llegará la confirmación por correo y uno de nuestros ninjas te contactará.',
  };
};
