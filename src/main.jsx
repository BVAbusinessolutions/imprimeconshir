import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import AppRouter from './router/AppRouter';
import './index.css';

// Configuración global de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reintentar fallas de red, no respuestas que no van a cambiar (formato inválido, sin permiso)
      retry: (failureCount, error) =>
        failureCount < 2 &&
        error?.code !== 'N8N_UNEXPECTED_RESPONSE' &&
        error?.code !== 'permission-denied' &&
        error?.response?.status !== 403,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppRouter />
            {/* Notificaciones globales */}
            <ToastContainer
              position="bottom-right"
              autoClose={4000}
              hideProgressBar
              newestOnTop
              closeOnClick
              pauseOnHover
              theme="light"
            />
          </AuthProvider>
          {/* Dev tools solo en desarrollo */}
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
);
