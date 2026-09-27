import React from 'react';

/**
 * Componente de pantalla de error global.
 * Se usa como ErrorBoundary fallback.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Aquí puedes enviar el error a Sentry u otro servicio de monitoreo
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-4 text-center text-ink">
          <h1 className="text-4xl font-extrabold">Algo salió mal.</h1>
          <p className="text-muted">Recarga la página o escríbenos si el problema continúa.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 h-11 rounded-full bg-accent px-6 font-semibold text-white hover:bg-accent-hover"
          >
            Recargar
          </button>
          {import.meta.env.DEV && (
            <pre className="mt-4 max-w-xl overflow-auto text-xs text-accent">{this.state.error?.toString()}</pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
