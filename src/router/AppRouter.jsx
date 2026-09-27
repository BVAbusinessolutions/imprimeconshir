import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute, AdminRoute } from './ProtectedRoute';
import { lazy, Suspense } from 'react';

// Lazy imports para code-splitting (carga bajo demanda)
const Home        = lazy(() => import('../pages/Home'));
const Catalog     = lazy(() => import('../pages/Catalog'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const Cart        = lazy(() => import('../pages/Cart'));
const Checkout    = lazy(() => import('../pages/Checkout'));
const Login       = lazy(() => import('../pages/auth/Login'));
const Register    = lazy(() => import('../pages/auth/Register'));
const Profile     = lazy(() => import('../pages/user/Profile'));
const Orders      = lazy(() => import('../pages/user/Orders'));
const Designer    = lazy(() => import('../pages/Designer'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminProducts  = lazy(() => import('../pages/admin/Products'));
const AdminOrders    = lazy(() => import('../pages/admin/Orders'));
const NotFound    = lazy(() => import('../pages/NotFound'));

// Spinner de carga global
const GlobalLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div className="spinner" />
  </div>
);

const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<GlobalLoader />}>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />

        {/* Privadas (usuario autenticado) */}
        <Route element={<PrivateRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/mis-pedidos" element={<Orders />} />
          <Route path="/disenador" element={<Designer />} />
        </Route>

        {/* Privadas (solo admin) */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/productos" element={<AdminProducts />} />
          <Route path="/admin/pedidos" element={<AdminOrders />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;
