/**
 * Integración con n8n. Todas las funciones llaman al mismo webhook con una `action` distinta
 * (contrato en docs/n8n-webhooks.md, workflow en n8n-workflow-base.json).
 * En modo de prueba (sin VITE_N8N_WEBHOOK_URL) se usan las respuestas simuladas de ./mock.
 */
import { IS_N8N_MOCK, postToN8n } from './client';
import {
  mockAppointment,
  mockChat,
  mockEmail,
  mockFinance,
  mockForecast,
  mockNotify,
  mockQuote,
  mockRoutes,
  mockSuppliers,
} from './mock';

export { IS_N8N_MOCK, n8nErrorMessage } from './client';

const isObj = (d) => d !== null && typeof d === 'object';

/** Formato mínimo que debe cumplir cada respuesta (ver docs/n8n-webhooks.md). */
const VALID = {
  chat: (d) => isObj(d) && typeof d.reply === 'string',
  cotizar: (d) => isObj(d) && ['preliminary', 'requires_visit'].includes(d.status),
  cita: (d) => isObj(d) && ['confirmed', 'pending'].includes(d.status),
  rutas: (d) => isObj(d) && Array.isArray(d.routes),
  proveedores: (d) => isObj(d) && Array.isArray(d.items) && Array.isArray(d.alerts),
  finanzas: (d) => isObj(d) && Array.isArray(d.monthly) && isObj(d.kpis) && Array.isArray(d.byCategory),
  notificar: (d) => isObj(d) && typeof d.sent === 'boolean',
  correo: (d) => isObj(d) && typeof d.status === 'string' && typeof d.sent === 'boolean',
  proyeccion: (d) => isObj(d) && Array.isArray(d.rows),
};

/**
 * Envía un mensaje del chat web. n8n responde con el texto de la IA
 * y, opcionalmente, una pre-cotización o una solicitud de cita.
 * @param {{ sessionId: string, message: string, history: Array<{role: string, text: string}>, user?: object, page?: string }} payload
 */
export const sendChatMessage = (payload) =>
  IS_N8N_MOCK ? mockChat(payload) : postToN8n('chat', payload, { validate: VALID.chat });

/**
 * Solicita una pre-cotización inmediata desde el formulario.
 */
export const requestQuote = (payload) =>
  IS_N8N_MOCK ? mockQuote(payload) : postToN8n('cotizar', payload, { validate: VALID.cotizar });

/**
 * Agenda una cita técnica (p. ej. medición de vehículo). n8n notifica a los ninjas.
 */
export const scheduleAppointment = (payload) =>
  IS_N8N_MOCK ? mockAppointment(payload) : postToN8n('cita', payload, { validate: VALID.cita });

// ─── Panel administrativo ─────────────────────────────────────

/** Agrupa las entregas de un día por zona y arma las rutas de los mensajeros. */
export const planDeliveryRoutes = (payload) =>
  IS_N8N_MOCK ? mockRoutes(payload) : postToN8n('rutas', payload, { validate: VALID.rutas });

/** Calcula márgenes de las listas de proveedores y dispara alertas de inventario bajo. */
export const analyzeSupplierPrices = (payload) =>
  IS_N8N_MOCK ? mockSuppliers(payload) : postToN8n('proveedores', payload, { validate: VALID.proveedores });

/** Reporte financiero histórico (ingresos por mes y categoría, KPIs, hallazgos estacionales). */
export const fetchFinanceReport = (payload) =>
  IS_N8N_MOCK ? mockFinance(payload) : postToN8n('finanzas', payload, { validate: VALID.finanzas });

/** Prepara (y cuando haya credencial, envía) el aviso de una cita al técnico asignado. */
export const notifyTechnician = (payload) =>
  IS_N8N_MOCK ? mockNotify(payload) : postToN8n('notificar', payload, { validate: VALID.notificar });

/** Envía un correo desde el panel (clientes, proveedores, técnicos). */
export const sendEmail = (payload) =>
  IS_N8N_MOCK ? mockEmail(payload) : postToN8n('correo', payload, { validate: VALID.correo });

/** Proyecta un plan de ingresos y gastos a futuro con escenarios. */
export const forecastPlan = (payload) =>
  IS_N8N_MOCK ? mockForecast(payload) : postToN8n('proyeccion', payload, { validate: VALID.proyeccion });
