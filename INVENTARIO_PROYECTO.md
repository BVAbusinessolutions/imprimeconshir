# Inventario del proyecto

Generado el 28 de septiembre de 2026. Las rutas están ordenadas alfabéticamente. Este inventario describe los archivos propios del proyecto; no enumera individualmente las dependencias instaladas ni los metadatos internos de Git.

## Resumen

| Elemento | Cantidad | Tamaño |
| --- | ---: | ---: |
| Directorios del proyecto | 38 | — |
| Archivos del proyecto | 117 | 848.42 KB |
| `.git` (metadatos) | 22 directorios / 30 archivos | 340.29 KB |
| `node_modules` (dependencias instaladas) | 5,261 directorios / 36,260 archivos | 418.91 MB |

## Estructura y archivos

```text
imprimeconshir/
├── .env.example                         1,520 B  Variables de entorno de ejemplo
├── .env.local                           1,520 B  Variables de entorno locales
├── .firebaserc                             61 B  Configuración de proyecto Firebase
├── .gitignore                             524 B  Exclusiones de Git
├── .oxlintrc.json                         239 B  Configuración de Oxlint
├── docs/
│   └── n8n-webhooks.md                 14,907 B  Documentación de webhooks n8n
├── firebase.json                        1,447 B  Configuración de Firebase
├── firestore.rules                      5,281 B  Reglas de seguridad Firestore
├── index.html                           1,538 B  Documento HTML de entrada
├── n8n-workflow-base.json             218,357 B  Flujo base de automatización n8n
├── package-lock.json                  205,209 B  Bloqueo de versiones npm
├── package.json                         1,505 B  Dependencias y scripts npm
├── pendientes/
│   ├── fotos/
│   │   └── .gitkeep                         0 B  Mantiene el directorio en Git
│   ├── precios.csv                        514 B  Datos pendientes de precios
│   ├── productos.csv                      280 B  Datos pendientes de productos
│   ├── README.md                        9,942 B  Instrucciones de pendientes
│   └── tono-shirlene.md                   506 B  Guía de tono
├── public/
│   └── favicon.svg                        353 B  Ícono del sitio
├── README.md                            3,820 B  Documentación principal
├── scripts/
│   ├── n8n/
│   │   └── build-workflow.mjs          12,231 B  Generador del flujo n8n
│   └── seo/
│       └── generate.mjs                 2,571 B  Generador de SEO
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.jsx            1,446 B  Manejo de errores de interfaz
│   │   ├── account/
│   │   │   └── AccountLayout.jsx        1,073 B  Diseño de cuenta
│   │   ├── admin/
│   │   │   ├── AdminLayout.jsx          2,352 B  Diseño administrativo
│   │   │   └── AdminUI.jsx              3,877 B  Componentes administrativos
│   │   ├── auth/
│   │   │   ├── AuthCard.jsx             2,619 B  Tarjeta de autenticación
│   │   │   └── authErrors.js              818 B  Errores de autenticación
│   │   ├── billing/
│   │   │   └── BillingFields.jsx        2,811 B  Campos de facturación
│   │   ├── brand/
│   │   │   └── Logo.jsx                   852 B  Logotipo
│   │   ├── catalog/
│   │   │   └── ProductCard.jsx          1,234 B  Tarjeta de producto
│   │   ├── chat/
│   │   │   ├── AppointmentCard.jsx      4,599 B  Tarjeta de cita
│   │   │   ├── ChatWidget.jsx           9,152 B  Widget de chat
│   │   │   └── QuoteCard.jsx            1,844 B  Tarjeta de cotización
│   │   ├── content/
│   │   │   ├── ContentPage.jsx          1,323 B  Página de contenido
│   │   │   └── Testimonials.jsx         1,598 B  Testimonios
│   │   ├── layout/
│   │   │   ├── Footer.jsx               3,797 B  Pie de página
│   │   │   ├── Layout.jsx               1,342 B  Contenedor de página
│   │   │   ├── Navbar.jsx               5,619 B  Navegación
│   │   │   └── SeoDefaults.jsx          1,591 B  Valores SEO predeterminados
│   │   ├── media/
│   │   │   ├── BeforeAfterSlider.jsx    2,377 B  Comparador antes/después
│   │   │   ├── ProjectImage.jsx         2,058 B  Imagen de proyecto
│   │   │   ├── vanGeometry.js             353 B  Geometría de vehículo
│   │   │   └── VanGraphic.jsx           2,204 B  Gráfico de vehículo
│   │   ├── mockup/
│   │   │   ├── LogoMockupPreview.jsx    8,195 B  Vista previa de mockup
│   │   │   └── mockupScenes.jsx         3,534 B  Escenas de mockup
│   │   ├── motion/
│   │   │   └── Reveal.jsx                 617 B  Animación de revelado
│   │   └── ui/
│   │       ├── Button.jsx               1,242 B  Botón reutilizable
│   │       ├── ComingSoon.jsx             830 B  Aviso próximamente
│   │       └── Field.jsx                1,337 B  Campo reutilizable
│   ├── context/
│   │   └── AuthContext.jsx              1,922 B  Contexto de autenticación
│   ├── data/
│   │   ├── categories.js                2,903 B  Categorías
│   │   ├── emailTemplates.js            2,104 B  Plantillas de correo
│   │   ├── exampleImages.js             5,892 B  Imágenes de ejemplo
│   │   ├── legal.js                       417 B  Datos legales
│   │   ├── logistics.js                   466 B  Datos logísticos
│   │   ├── sat.js                         721 B  Datos fiscales SAT
│   │   ├── settingsDefaults.js            783 B  Ajustes predeterminados
│   │   └── vizPalette.js                  754 B  Paleta visual
│   ├── firebase/
│   │   ├── authService.js               2,238 B  Servicio de autenticación
│   │   ├── config.js                    1,293 B  Configuración Firebase
│   │   └── storageService.js            1,601 B  Servicio de almacenamiento
│   ├── hooks/
│   │   ├── useProducts.js               1,705 B  Hook de productos
│   │   └── useSettings.js                 893 B  Hook de ajustes
│   ├── index.css                        2,267 B  Estilos globales
│   ├── main.jsx                         1,838 B  Entrada React
│   ├── pages/
│   │   ├── About.jsx                    4,598 B  Página sobre nosotros
│   │   ├── Cart.jsx                       155 B  Carrito
│   │   ├── Catalog.jsx                  5,606 B  Catálogo
│   │   ├── Checkout.jsx                   164 B  Pago
│   │   ├── Designer.jsx                   173 B  Diseñador
│   │   ├── Faq.jsx                      4,196 B  Preguntas frecuentes
│   │   ├── FilesGuide.jsx               4,515 B  Guía de archivos
│   │   ├── Home.jsx                     7,010 B  Inicio
│   │   ├── NotFound.jsx                   625 B  Página no encontrada
│   │   ├── Preview.jsx                    848 B  Vista previa
│   │   ├── ProductDetail.jsx            5,275 B  Detalle de producto
│   │   ├── Projects.jsx                 7,434 B  Proyectos
│   │   ├── Quote.jsx                   15,006 B  Cotizador
│   │   ├── admin/
│   │   │   ├── Appointments.jsx        10,835 B  Gestión de citas
│   │   │   ├── Clients.jsx              8,697 B  Gestión de clientes
│   │   │   ├── Dashboard.jsx            4,244 B  Panel administrativo
│   │   │   ├── Emails.jsx               7,686 B  Gestión de correos
│   │   │   ├── Finance.jsx             10,656 B  Finanzas
│   │   │   ├── Inventory.jsx           13,329 B  Inventario
│   │   │   ├── Logistics.jsx           11,530 B  Logística
│   │   │   ├── Orders.jsx               4,241 B  Pedidos
│   │   │   ├── Planning.jsx            27,723 B  Planificación
│   │   │   ├── Portfolio.jsx           12,614 B  Portafolio
│   │   │   ├── Products.jsx             8,653 B  Productos
│   │   │   ├── Settings.jsx             7,070 B  Ajustes
│   │   │   ├── Suppliers.jsx            9,111 B  Proveedores
│   │   │   └── Users.jsx                5,402 B  Usuarios
│   │   ├── auth/
│   │   │   ├── Login.jsx                3,402 B  Inicio de sesión
│   │   │   └── Register.jsx             3,539 B  Registro
│   │   ├── legal/
│   │   │   ├── Privacy.jsx              5,215 B  Aviso de privacidad
│   │   │   └── Terms.jsx                3,453 B  Términos y condiciones
│   │   └── user/
│   │       ├── Orders.jsx               3,960 B  Pedidos del usuario
│   │       └── Profile.jsx              4,983 B  Perfil del usuario
│   ├── router/
│   │   ├── AppRouter.jsx                5,284 B  Rutas de la aplicación
│   │   └── ProtectedRoute.jsx             864 B  Protección de rutas
│   ├── schemas/
│   │   └── validations.js               9,133 B  Validaciones
│   ├── security/
│   │   ├── axios.js                     1,474 B  Cliente HTTP protegido
│   │   └── sanitizer.js                   527 B  Sanitización de datos
│   ├── services/
│   │   ├── adminService.js              2,976 B  Servicio administrativo
│   │   ├── contentService.js              858 B  Servicio de contenido
│   │   ├── firestoreService.js          3,581 B  Servicio Firestore
│   │   ├── settingsService.js             924 B  Servicio de ajustes
│   │   └── n8n/
│   │       ├── client.js                3,311 B  Cliente n8n
│   │       ├── index.js                 3,849 B  Exportaciones n8n
│   │       ├── logic.js                21,355 B  Lógica n8n
│   │       └── mock.js                  1,396 B  Simulación n8n
│   ├── store/
│   │   ├── cartStore.js                 1,616 B  Estado del carrito
│   │   ├── chatStore.js                 3,713 B  Estado del chat
│   │   └── uiStore.js                     761 B  Estado de interfaz
│   └── utils/
│       └── helpers.js                   1,939 B  Utilidades generales
├── storage.rules                         1,517 B  Reglas de seguridad Storage
└── vite.config.js                          937 B  Configuración Vite
```

## Directorios excluidos del detalle

- `.git/`: historial y configuración interna del repositorio. Se excluye porque no forma parte del código fuente.
- `node_modules/`: dependencias instaladas por npm. Se excluye porque se reconstruye con `npm install` a partir de `package.json` y `package-lock.json`.

## Notas

- Los tamaños corresponden al estado del proyecto en el momento de generar este inventario.
- Las descripciones se infieren del nombre y ubicación de cada archivo; no contienen valores de los archivos de entorno.
