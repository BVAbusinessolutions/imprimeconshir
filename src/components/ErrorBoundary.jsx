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
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', gap: '1rem',
          background: '#0a0a0f', color: '#f8f9fa', fontFamily: 'Inter, sans-serif'
        }}>
          <h1 style={{ fontSize: '3rem' }}>⚠️ Algo salió mal</h1>
          <p style={{ color: '#a0aab2' }}>Recarga la página o contacta soporte.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 2rem', background: '#00ffaa', color: '#0a0a0f',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700'
            }}
          >
            Recargar
          </button>
          {import.meta.env.DEV && (
            <pre style={{ color: '#ff6b6b', fontSize: '0.75rem', maxWidth: '600px', overflow: 'auto' }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
