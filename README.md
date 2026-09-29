# IMPRIME con SHIR

Plataforma web para **Visión Integral Gráfica**: catálogo de productos, atención de solicitudes, panel operativo y creación manual de proformas profesionales.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19, React Router y Vite |
| Estilos | Tailwind CSS v4 |
| Estado | TanStack Query y Zustand |
| Datos | Firebase Authentication, Firestore y Storage |
| Automatizaciones opcionales | n8n para WhatsApp, IA y notificaciones |
| Hosting | Firebase Hosting |

## Flujo de cotización y proforma

El flujo administrativo funciona directamente con Firestore, sin requerir n8n:

1. Un pedido nuevo aparece como **Borrador** en `Admin → Cotizaciones y proformas`.
2. Shirlene abre **Asignar precio / Proforma** y captura únicamente el precio unitario de cada partida.
3. El sistema calcula subtotal, IVA del 13 % y total en colones costarricenses.
4. Al guardar, el pedido pasa a **Cotizado** y conserva su número, versión y datos de proforma en Firestore.
5. **Ver proforma** muestra un documento A4 con la identidad de IMPRIME con SHIR; desde allí se puede usar **Imprimir / Guardar como PDF**.
6. Cuando el cliente acepta, se marca como **Aprobado**.

## Acceso al panel administrador

No se incluyen usuarios ni contraseñas en el repositorio. Para crear el primer acceso administrativo:

1. Registra o inicia sesión con la cuenta de Shirlene en `/registro` o `/login`.
2. En Firebase Console → Firestore Database → colección `users`, abre el documento cuyo ID sea el UID de esa cuenta.
3. Cambia el campo `role` a `admin`.
4. Cierra sesión y vuelve a entrar. La cuenta podrá abrir `/admin`.

Las reglas de Firestore impiden que un cliente se asigne ese rol desde la aplicación.

## Estructura del proyecto

```text
src/
├── components/
│   ├── admin/
│   │   ├── AdminLayout.jsx       # Navegación del panel
│   │   ├── AdminUI.jsx           # Componentes comunes del panel
│   │   ├── Orders.jsx            # Gestión de pedidos, precios y estados
│   │   └── ProformaPDF.jsx       # Documento imprimible / PDF
│   ├── auth/                     # Acceso y manejo de errores de autenticación
│   ├── billing/                  # Facturación y consentimiento
│   ├── chat/                     # Atención por chat
│   ├── layout/                   # Navbar, footer y layout global
│   ├── media/ y mockup/          # Imágenes y previsualizadores
│   └── ui/                       # Controles reutilizables
├── context/                      # Sesión de usuario
├── data/                         # Datos estáticos y valores predeterminados
├── firebase/                     # Configuración y servicios de Firebase
├── hooks/                        # Hooks de productos y ajustes
├── pages/
│   ├── admin/                    # Rutas del panel (Orders reexporta el componente admin)
│   ├── auth/                     # Login y registro
│   ├── legal/                    # Privacidad y términos
│   └── user/                     # Perfil y pedidos del cliente
├── router/                       # Rutas y protección por rol
├── services/                     # Acceso a Firestore y servicios opcionales n8n
├── store/                        # Estado local
└── utils/                        # Formateo y utilidades

pendientes/                       # Checklist y materiales por entregar
scripts/                           # Generación de SEO y workflow n8n
firestore.rules                    # Seguridad de Firestore
storage.rules                      # Seguridad de Firebase Storage
INVENTARIO_PROYECTO.md             # Inventario actualizado de archivos
```

## Desarrollo local

```bash
npm install
Copy-Item .env.example .env.local  # PowerShell
npm run dev
```

Completa las variables de Firebase en `.env.local`. No subas claves, cuentas de servicio ni contraseñas al repositorio.

## Validación y despliegue

```bash
npm run lint
npm run build
npm run deploy:rules
npm run deploy
```

`deploy:rules` publica las reglas de Firestore y Storage. `deploy` genera el build y publica Firebase Hosting.

## Pendientes

Consulta [pendientes/README.md](./pendientes/README.md) para conocer los datos, contenido, credenciales externas y acciones que aún debe proporcionar el negocio.
