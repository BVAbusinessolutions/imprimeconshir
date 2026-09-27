# Imprime con Shir 🖨️

Plataforma web para **Visión Integral Gráfica** — catálogo de productos, cotizador automático vía WhatsApp, panel administrativo y generación de proformas en PDF.

---

## 🗂️ Descripción del proyecto

Aplicación web full-stack construida con **React + Vite** y desplegada en **Firebase Hosting**. Permite a los clientes explorar el catálogo de impresión, solicitar cotizaciones por WhatsApp (atendidas por una IA entrenada con el tono de Shirlene) y recibir su proforma en PDF de forma automática.

El panel administrativo permite a Shirlene gestionar cotizaciones, citas técnicas, inventario, proveedores, logística y finanzas, todo desde el navegador.

---

## 🚀 Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19, React Router, TailwindCSS v4 |
| Estado / Datos | TanStack Query, Zustand |
| Backend / BD | Firebase Firestore, Firebase Auth, Firebase Storage |
| Automatizaciones | n8n (WhatsApp Business API, IA, notificaciones) |
| Hosting | Firebase Hosting |
| CI/CD | GitHub → Firebase (manual deploy) |

---

## 📁 Estructura del proyecto

```
src/
├── components/       # Componentes reutilizables (UI, admin)
├── context/          # AuthContext (sesión del usuario)
├── firebase/         # Configuración de Firebase y servicios de auth/storage
├── pages/            # Páginas públicas y del panel admin
│   ├── admin/        # Dashboard, Pedidos, Citas, Logística, Inventario…
│   └── auth/         # Login, Registro
├── services/         # Servicios de Firestore (adminService, contentService…)
├── data/             # Datos estáticos (categorías, imágenes de ejemplo, legal)
└── utils/            # Helpers

pendientes/           # Checklist de pendientes para el cliente
scripts/              # Scripts de build (SEO, n8n workflow)
firestore.rules       # Reglas de seguridad de Firestore
storage.rules         # Reglas de seguridad de Storage
```

---

## ⚙️ Cómo correr el proyecto localmente

### 1. Clonar el repositorio

```bash
git clone -b setup-base https://github.com/BVAbusinessolutions/imprimeconshir.git
cd imprimeconshir
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y rellena tus credenciales de Firebase:

```bash
cp .env.example .env.local
```

Edita `.env.local` con los valores de tu proyecto de Firebase Console.

### 4. Correr el servidor de desarrollo

```bash
npm run dev
```

---

## 🛡️ Reglas de Firestore

Para publicar las reglas de seguridad en Firebase:

```bash
npm run deploy:rules
# equivale a: firebase deploy --only firestore:rules,storage
```

> **Nota:** Firebase Storage debe estar activado en la consola para que el comando de storage funcione.

---

## 🚢 Despliegue a producción

```bash
npm run deploy
# equivale a: npm run build && firebase deploy --only hosting
```

---

## 🤖 Automatizaciones (n8n)

El archivo `n8n-workflow-base.json` contiene el workflow principal que conecta:
- **WhatsApp Business API** → Atención al cliente con IA
- **Firebase Firestore** → Guardado de cotizaciones y citas
- **Notificaciones** → Avisos a Shirlene y a los técnicos

Para importarlo: en n8n ve a *Workflows → Import from File* y selecciona `n8n-workflow-base.json`.

---

## 📋 Pendientes

Revisa [`pendientes/README.md`](./pendientes/README.md) para ver la lista completa de tareas que requieren acción del cliente (fotos, precios, credenciales, etc.).

---

## 👥 Colaboradores

- **Shirlene** — Operaciones y contenido
- **BVA Business Solutions** — Desarrollo y automatizaciones
