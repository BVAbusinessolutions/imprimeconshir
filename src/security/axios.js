import axios from 'axios';

// Configuración base de axios
const secureApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000, // Timeout para evitar colgar la aplicación
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Prevenir CSRF en algunos backends
  },
});

// Interceptor de peticiones
secureApi.interceptors.request.use(
  (config) => {
    // Aquí puedes añadir el token de autenticación desde el local storage, sessionStorage o cookies seguras
    const token = localStorage.getItem('authToken'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Podrías agregar un token CSRF si el backend lo proporciona
    // const csrfToken = sessionStorage.getItem('csrfToken');
    // if (csrfToken) {
    //   config.headers['X-CSRF-Token'] = csrfToken;
    // }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas
secureApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejo global de errores de red o autenticación
    if (error.response) {
      if (error.response.status === 401) {
        // Redirigir a login o limpiar tokens
        console.warn('Acceso no autorizado. Redirigiendo o limpiando sesión...');
      } else if (error.response.status === 403) {
        console.warn('Prohibido. No tienes permisos para esta acción.');
      }
    }
    return Promise.reject(error);
  }
);

export default secureApi;
