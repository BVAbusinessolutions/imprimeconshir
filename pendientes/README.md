# Pendientes del cliente

Lo que necesito de ti (o de Shirlene) para terminar. Marca con `[x]` lo que ya entregues y deja los archivos en esta misma carpeta (`pendientes/`) o en la ruta que indica cada punto.

Última actualización: 2026-09-26.

---

## 1. Contenido de la web

- [ ] **Fotos reales de trabajos** (mínimo 1 por subcategoría, idealmente 3 o más).
  - Horizontal, al menos 1600 px de ancho, JPG o WEBP.
  - Nombre sugerido: `subcategoria-01.jpg` (p. ej. `rotulacion-vehicular-01.jpg`).
  - Carpeta: `pendientes/fotos/`.
  - Reemplazan las fotos de ejemplo de `src/data/exampleImages.js`. **Varias de las fotos de ejemplo muestran marcas o textos de terceros; hay que cambiarlas antes de publicar.**
- [ ] **Datos de contacto para el pie de página**: teléfono, correo, dirección, horario y redes sociales. Captúralos tú mismo en *Admin → Configuración → Contacto público*.
- [ ] **Productos del catálogo**. Una vez listo el panel (Fase 3), Shirlene puede cargarlos desde *Admin → Productos*. Si prefieres pasármelos, usa la plantilla `productos.csv` de esta carpeta.
- [ ] **Revisar subcategorías**. Las de *Publicidad y Eventos* y *Promocionales* las propuse yo (`src/data/categories.js`): ¿se quedan así?
- [ ] **Vista 360º** (opcional): 24–36 fotos del mismo trabajo girando a su alrededor, con la misma distancia y la misma luz. ¿La hacemos más adelante?
- [ ] **Decidir el carrito**: el negocio trabaja con cotizaciones. ¿Quitamos *Carrito/Checkout* o se construye un pago en línea (y con qué pasarela: Mercado Pago, Stripe, Conekta…)?
- [ ] **Dominio** donde se publicará la web (se usa para CORS de n8n y para las etiquetas al compartir en redes).

## 2. Automatizaciones (n8n)

- [ ] **Importar el workflow** `n8n-workflow-base.json` (*Workflows → Import from File*), desactivar el anterior y activar el nuevo. Cada vez que te avise de un cambio, hay que volver a importarlo.
- [ ] **Tono de Shirlene para la IA**: 10–20 conversaciones reales con clientes (capturas o texto), sus frases típicas, cómo saluda/cierra y preguntas frecuentes con sus respuestas. Archivo: `pendientes/tono-shirlene.md`.
- [ ] **Proveedor de IA**: ¿Claude (Anthropic) u OpenAI? Crea la credencial en n8n (*Credentials → New*); yo nunca necesito ver la clave.
- [ ] **Lista de precios real** por subcategoría (precio por m² o por pieza, costo de diseño, mínimos). Plantilla: `pendientes/precios.csv`. Hoy los precios del cotizador son inventados.
- [ ] **Cómo avisar a los técnicos ("ninjas")**: ¿Telegram, correo o WhatsApp Business API? Crea la credencial correspondiente en n8n.
- [ ] **Calendario de citas**: ¿usan Google Calendar? Crea la credencial de Google en n8n.
- [ ] **Correo para confirmaciones al cliente** (Gmail o SMTP) y credencial en n8n.
- [ ] **Credencial de Firebase para n8n** (cuenta de servicio): *Firebase Console → Configuración del proyecto → Cuentas de servicio → Generar clave privada*, y cárgala en n8n como credencial **Google Firebase Cloud Firestore**. Con esto n8n guarda cotizaciones, citas y rutas. **No subas ese archivo JSON al repositorio.**
- [ ] **Clave de Google Maps** (opcional, para geocodificar direcciones y optimizar rutas). Sin ella, las rutas se agrupan por zona y se abren en Google Maps con enlaces normales.

## 3. Panel administrativo (Fase 3)

- [ ] En *Admin → Configuración → Operación*: **zonas de reparto** reales, **dirección del taller** (y coordenadas si las tienes), **mensajeros** y **técnicos (ninjas)** con su teléfono y correo.
- [ ] **Datos históricos de ventas** (Excel o CSV por mes y por categoría) si quieren ver años anteriores en *Finanzas*; hoy el reporte muestra datos de ejemplo.
- [ ] En la misma pantalla: **correo para alertas** (inventario bajo y margen bajo) y **margen mínimo** aceptable (hoy 25 %).
- [ ] **Inventario inicial**: cargar los insumos con su existencia y mínimo en *Admin → Inventario*.

## 4. Seguridad antes de publicar

- [ ] En el nodo *Webhook Principal* de n8n, cambiar *Allowed Origins (CORS)* de `*` al dominio real.
- [x] ~~Verificar en n8n que las acciones del panel las haga un admin~~ → resuelto en el workflow (nodo *Verificar admin*), no requiere configurar nada.
- [ ] **Volver a publicar las reglas** (cambiaron en la Fase 3): `firebase deploy --only firestore:rules,storage`. Repetirlo cada vez que cambie `firestore.rules` o `storage.rules`.
- [ ] Crear el usuario admin de Shirlene (documento `users/{uid}` con `role: "admin"`).
