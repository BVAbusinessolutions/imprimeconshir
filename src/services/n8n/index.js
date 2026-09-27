/**
 * Integración con n8n. Todas las funciones llaman al mismo webhook con una `action` distinta
 * (contrato en docs/n8n-webhooks.md, workflow en n8n-workflow-base.json).
 * En modo de prueba (sin VITE_N8N_WEBHOOK_URL) se usan las respuestas simuladas de ./mock.
 */
import { IS_N8N_MOCK, postToN8n } from './client';
import { mockAppointment, mockChat, mockQuote } from './mock';

export { IS_N8N_MOCK, n8nErrorMessage } from './client';

/**
 * Envía un mensaje del chat web. n8n responde con el texto de la IA
 * y, opcionalmente, una pre-cotización o una solicitud de cita.
 * @param {{ sessionId: string, message: string, history: Array<{role: string, text: string}>, user?: object, page?: string }} payload
 */
export const sendChatMessage = (payload) =>
  IS_N8N_MOCK ? mockChat(payload) : postToN8n('chat', payload);

/**
 * Solicita una pre-cotización inmediata desde el formulario.
 */
export const requestQuote = (payload) =>
  IS_N8N_MOCK ? mockQuote(payload) : postToN8n('cotizar', payload);

/**
 * Agenda una cita técnica (p. ej. medición de vehículo). n8n notifica a los ninjas.
 */
export const scheduleAppointment = (payload) =>
  IS_N8N_MOCK ? mockAppointment(payload) : postToN8n('cita', payload);
