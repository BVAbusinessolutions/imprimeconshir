import axios from 'axios';
import { auth } from '../../firebase/config';

// URL completa del webhook único ("Webhook Principal" de n8n-workflow-base.json)
const WEBHOOK_URL = (import.meta.env.VITE_N8N_WEBHOOK_URL || '').replace(/\/+$/, '');

/** Sin URL configurada (o con VITE_N8N_MOCK=true) se usan respuestas simuladas. */
export const IS_N8N_MOCK = !WEBHOOK_URL || import.meta.env.VITE_N8N_MOCK === 'true';

/**
 * Cliente HTTP para el webhook de n8n.
 * Timeout amplio: las respuestas del chat pasan por un modelo de IA.
 */
const n8nClient = axios.create({
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
});

// Adjunta el ID token de Firebase si hay sesión; n8n debe verificarlo antes de confiar en el uid.
n8nClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    config.headers.Authorization = `Bearer ${await user.getIdToken()}`;
  }
  return config;
});

const isRetryable = (error) =>
  !error.response || error.code === 'ECONNABORTED' || error.response.status >= 500;

/**
 * POST al webhook único de n8n con un reintento ante errores de red o 5xx.
 * El workflow enruta por el campo `action` del cuerpo.
 * @param {'chat'|'cotizar'|'cita'} action - Acción que ejecuta el workflow.
 * @param {object} payload - Datos de la acción.
 */
export const postToN8n = async (action, payload, { retries = 1 } = {}) => {
  try {
    const { data } = await n8nClient.post(WEBHOOK_URL, { action, ...payload });
    return data;
  } catch (error) {
    if (retries > 0 && isRetryable(error)) {
      await new Promise((r) => setTimeout(r, 1200));
      return postToN8n(action, payload, { retries: retries - 1 });
    }
    throw error;
  }
};

/** Mensaje de error legible para mostrar al cliente. */
export const n8nErrorMessage = (error) => {
  if (error?.code === 'ECONNABORTED') return 'La respuesta está tardando más de lo normal. Intenta de nuevo.';
  if (!error?.response) return 'No pudimos conectar. Revisa tu conexión e intenta de nuevo.';
  if (error.response.status === 429) return 'Demasiados mensajes seguidos. Espera un momento.';
  return 'Algo salió mal de nuestro lado. Intenta de nuevo en un momento.';
};
