import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import './index.css';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="app-layout">
          <nav className="navbar">
            <div className="nav-brand">Imprime con Shir</div>
            <div className="nav-links">
              <a href="/">Inicio</a>
              <a href="#">Servicios</a>
              <a href="#">Contacto</a>
            </div>
          </nav>
          
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
          
          <footer className="footer">
            <p>&copy; {new Date().getFullYear()} Imprime con Shir. Todos los derechos reservados. | Sistema de alta seguridad.</p>
          </footer>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
