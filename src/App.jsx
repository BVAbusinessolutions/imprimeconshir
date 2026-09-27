import React from 'react';
import AppRouter from './router/AppRouter';

// App.jsx ahora es solo el punto de montaje del router.
// Todos los providers se configuraron en main.jsx.
function App() {
  return <AppRouter />;
}

export default App;
