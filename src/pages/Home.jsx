import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, Lock, Activity } from 'lucide-react';
import { sanitizeHtml } from '../security/sanitizer';

const Home = () => {
  // Simulación de un input potencialmente peligroso que limpiamos
  const unsafeData = "<p>Bienvenido a la plataforma segura. <script>alert('xss')</script></p>";
  
  return (
    <div className="home-container">
      <Helmet>
        <title>Imprime con Shir | Plataforma Segura</title>
        <meta name="description" content="Plataforma principal de Imprime con Shir con altos estándares de ciberseguridad." />
      </Helmet>

      <header className="hero-section">
        <h1>Imprime con Shir</h1>
        <p className="subtitle">Base de proyecto con integraciones de ciberseguridad</p>
      </header>

      <main className="features-grid">
        <div className="feature-card">
          <ShieldCheck className="feature-icon" size={48} />
          <h2>Protección XSS</h2>
          <p>Utilizando DOMPurify para asegurar que los datos renderizados sean completamente seguros.</p>
          <div 
            className="demo-box"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(unsafeData) }}
          />
        </div>

        <div className="feature-card">
          <Lock className="feature-icon" size={48} />
          <h2>Comunicaciones Seguras</h2>
          <p>Instancia de Axios configurada con interceptores para tokens y headers de seguridad listos para usar.</p>
        </div>

        <div className="feature-card">
          <Activity className="feature-icon" size={48} />
          <h2>Validación Robusta</h2>
          <p>Preparado con Zod y React Hook Form para validar los datos del lado del cliente antes de enviarlos.</p>
        </div>
      </main>
    </div>
  );
};

export default Home;
