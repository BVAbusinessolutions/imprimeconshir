import axios from 'axios';
import { auth } from '../firebase/config';

// Configuración base de axios (para un backend propio, si se agrega más adelante)
const secureApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000, // Timeout para evitar colgar la aplicación
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Prevenir CSRF en algunos backends
  },
});

// Interceptor de peticiones: adjunta el ID token de Firebase del usuario actual.
// getIdToken() lo renueva automáticamente cuando está por expirar, así que no se guarda en localStorage.
secureApi.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuestas
secureApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo global de errores de red o autenticación
    if (error.response) {
      if (error.response.status === 401) {
        console.warn('Sesión no válida o expirada.');
      } else if (error.response.status === 403) {
        console.warn('Prohibido. No tienes permisos para esta acción.');
      }
    }
    return Promise.reject(error);
  }
);

export default secureApi;
