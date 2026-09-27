import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute, AdminRoute } from './ProtectedRoute';
import { lazy } from 'react';
import Layout from '../components/layout/Layout';
import AdminLayout from '../components/admin/AdminLayout';

// Lazy imports para code-splitting (carga bajo demanda)
const Home        = lazy(() => import('../pages/Home'));
const Catalog     = lazy(() => import('../pages/Catalog'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const Preview     = lazy(() => import('../pages/Preview'));
const Quote       = lazy(() => import('../pages/Quote'));
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
const AdminLogistics = lazy(() => import('../pages/admin/Logistics'));
const AdminSuppliers = lazy(() => import('../pages/admin/Suppliers'));
const AdminFinance   = lazy(() => import('../pages/admin/Finance'));
const AdminAppointments = lazy(() => import('../pages/admin/Appointments'));
const AdminInventory = lazy(() => import('../pages/admin/Inventory'));
const AdminPlanning  = lazy(() => import('../pages/admin/Planning'));
const AdminEmails    = lazy(() => import('../pages/admin/Emails'));
const AdminSettings  = lazy(() => import('../pages/admin/Settings'));
const Projects    = lazy(() => import('../pages/Projects'));
const FilesGuide  = lazy(() => import('../pages/FilesGuide'));
const Faq         = lazy(() => import('../pages/Faq'));
const About       = lazy(() => import('../pages/About'));
const Privacy     = lazy(() => import('../pages/legal/Privacy'));
const Terms       = lazy(() => import('../pages/legal/Terms'));
const AdminClients   = lazy(() => import('../pages/admin/Clients'));
const AdminPortfolio = lazy(() => import('../pages/admin/Portfolio'));
const NotFound    = lazy(() => import('../pages/NotFound'));

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Layout envuelve el <Outlet> en Suspense, así la navegación queda fija al cargar cada página */}
      <Route element={<Layout />}>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/catalogo/:categoria" element={<Catalog />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/previsualizar" element={<Preview />} />
        <Route path="/cotizar" element={<Quote />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/proyectos" element={<Projects />} />
        <Route path="/guia-de-archivos" element={<FilesGuide />} />
        <Route path="/preguntas-frecuentes" element={<Faq />} />
        <Route path="/nosotros" element={<About />} />
        <Route path="/aviso-de-privacidad" element={<Privacy />} />
        <Route path="/terminos" element={<Terms />} />

        {/* Privadas (usuario autenticado) */}
        <Route element={<PrivateRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/mis-pedidos" element={<Orders />} />
          <Route path="/disenador" element={<Designer />} />
        </Route>

        {/* Privadas (solo admin) */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="pedidos" element={<AdminOrders />} />
            <Route path="productos" element={<AdminProducts />} />
            <Route path="logistica" element={<AdminLogistics />} />
            <Route path="proveedores" element={<AdminSuppliers />} />
            <Route path="finanzas" element={<AdminFinance />} />
            <Route path="citas" element={<AdminAppointments />} />
            <Route path="inventario" element={<AdminInventory />} />
            <Route path="planeacion" element={<AdminPlanning />} />
            <Route path="correos" element={<AdminEmails />} />
            <Route path="configuracion" element={<AdminSettings />} />
            <Route path="clientes" element={<AdminClients />} />
            <Route path="portafolio" element={<AdminPortfolio />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
