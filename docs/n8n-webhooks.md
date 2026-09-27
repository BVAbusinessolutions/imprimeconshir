# Webhook de n8n

La web se comunica con **un solo webhook** `POST` (el nodo *Webhook Principal* de `n8n-workflow-base.json`). Su URL completa va en `VITE_N8N_WEBHOOK_URL` (p. ej. `https://n8n.tudominio.com/webhook/imprimeconshir`). Cada petición lleva un campo `action` y el workflow la enruta con el nodo *Enrutar por acción*. Si la URL está vacía o `VITE_N8N_MOCK=true`, la web usa respuestas simuladas (`src/services/n8n/mock.js`) con este mismo contrato.

| `action` | Uso | Origen en la web |
| --- | --- | --- |
| `chat` | Mensaje del chat web → respuesta de la IA | `ChatWidget` |
| `cotizar` | Pre-cotización inmediata desde el formulario | `/cotizar` |
| `cita` | Agendar visita técnica y avisar a los ninjas | Tarjeta de cita (chat y `/cotizar`) |
| `rutas` | Agrupar entregas del día por zona y armar rutas | Admin → Logística |
| `proveedores` | Márgenes de listas de proveedores y alertas de inventario | Admin → Proveedores |
| `finanzas` | Reporte histórico de ventas | Admin → Finanzas |

Una `action` desconocida responde `400`.

## Cómo actualizar el workflow

La lógica de cada acción vive en `src/services/n8n/logic.js`, la misma que usa el modo de prueba de la web. `npm run n8n:build` la copia a los nodos *Code* y regenera `n8n-workflow-base.json`; **no edites esos nodos a mano en n8n**, porque se sobrescriben en la siguiente importación (agrega nodos nuevos después de ellos).

Para aplicar cambios: importa `n8n-workflow-base.json` en n8n (*Workflows → Import from File*), desactiva la versión anterior y **activa** la nueva. Revisa las credenciales de los nodos que las usen.

## Seguridad

- Si el visitante inició sesión, cada petición lleva `Authorization: Bearer <Firebase ID token>`. **n8n debe verificar el token** (firma con las llaves públicas de Google, `aud` = ID del proyecto de Firebase) antes de confiar en `uid` o `email` del cuerpo. Los campos `uid`/`user` del cuerpo son solo informativos.
- El chat y la cotización también funcionan sin sesión: aplica límite de peticiones por IP o por `sessionId` en n8n (o un proxy delante) para evitar abuso del modelo de IA.
- En el nodo *Webhook Principal*, opción *Allowed Origins (CORS)*: hoy está en `*`; cámbiala a tu dominio (y `http://localhost:5173` para desarrollo) al publicar.
- Las respuestas del bot se muestran como **texto plano**; no envíes HTML.
- Los montos de una pre-cotización los calcula n8n; la web nunca envía precios.

---

## `action: "chat"`

### Petición

```json
{
  "action": "chat",
  "sessionId": "5f0c…-uuid",
  "message": "Quiero rotular mi camioneta",
  "history": [
    { "role": "assistant", "text": "¡Hola! Cuéntame qué quieres imprimir…" },
    { "role": "user", "text": "Hola" }
  ],
  "user": { "uid": "abc123", "email": "cliente@correo.com", "name": "Ana" },
  "page": "/catalogo/gran-formato"
}
```

- `sessionId`: identifica la conversación del chat web (independiente del WhatsApp de la dueña). Úsalo como clave de memoria en el nodo de IA (p. ej. *Postgres Chat Memory*).
- `history`: últimos 10 mensajes, por si el flujo no guarda memoria propia.
- `user`: `null` si el visitante no ha iniciado sesión.

### Respuesta

```json
{
  "reply": "¡Qué buen proyecto! Para rotular necesitamos medidas exactas…",
  "intent": "appointment",
  "quote": null,
  "appointment": {
    "reason": "Medición para rotulación vehicular",
    "suggestedSlots": ["2026-09-28T10:00", "2026-09-28T16:00"]
  },
  "suggestions": ["Ver ejemplos", "Otra fecha"]
}
```

| Campo | Tipo | Obligatorio | Notas |
| --- | --- | --- | --- |
| `reply` | string | sí | Texto plano; se respetan saltos de línea. |
| `intent` | `general` \| `quote` \| `appointment` | no | Por defecto `general`. |
| `quote` | objeto *Cotización* | no | Se muestra como tarjeta de pre-cotización. |
| `appointment` | `{ reason, suggestedSlots[] }` | no | Muestra la tarjeta para agendar. Horarios en `yyyy-MM-ddTHH:mm`, hora local. Sin horarios, la web ofrece los próximos 3 días a las 10:00 y 16:00. |
| `suggestions` | string[] | no | Hasta 4 respuestas rápidas. |

### Flujo sugerido en n8n

1. **Webhook Principal** → **Enrutar por acción** (salida `chat`).
2. **Verificar token** si viene `Authorization` (nodo Code o JWT).
3. **AI Agent** (OpenAI o Anthropic Claude) con:
   - *System prompt* con el vocabulario, estilo de ventas y tono de Shirlene. Vive **solo en n8n**; la web no lo conoce.
   - Memoria por `sessionId`.
   - Herramientas: consultar catálogo/lista de precios (Firestore o Postgres) para cotizar, y clasificar la intención.
   - Salida estructurada (*Structured Output Parser*) con el esquema de arriba.
4. **Switch** por `intent`: si es `appointment`, consulta disponibilidad de técnicos para llenar `suggestedSlots`.
5. **Respond to Webhook** con el JSON.

Responde en menos de ~30 s (la web espera 45 s y reintenta una vez ante errores de red o 5xx).

---

## `action: "cotizar"`

### Petición

```json
{
  "action": "cotizar",
  "category": "gran-formato",
  "subcategory": "lonas",
  "width": 3,
  "height": 1.5,
  "unit": "m",
  "quantity": 2,
  "deadline": "2026-10-05",
  "notes": "Con ojillos cada 50 cm",
  "contact": { "name": "Ana", "email": "ana@correo.com", "phone": "5512345678" },
  "files": [{ "name": "logo.pdf", "type": "application/pdf", "url": "https://firebasestorage…" }],
  "productId": null,
  "productName": null,
  "uid": "abc123",
  "sessionId": "5f0c…-uuid",
  "source": "web-form"
}
```

- `category`/`subcategory` usan los `slug` de `src/data/categories.js`.
- `width`/`height` pueden faltar (trabajos por pieza). `deadline`, `notes` y `files` son opcionales.
- `files` solo llega con sesión iniciada; son URLs de Firebase Storage (`designs/{uid}/…`).

### Respuesta: pre-cotización

```json
{
  "quoteId": "COT-8F21A0",
  "status": "preliminary",
  "message": "Pre-cotización lista. Un asesor te confirma el precio final en minutos.",
  "items": [
    { "concept": "Impresión 4.50 m² × 2", "amount": 1620 },
    { "concept": "Ajuste de diseño y preprensa", "amount": 350 }
  ],
  "subtotal": 1970,
  "tax": 315,
  "total": 2285,
  "currency": "MXN",
  "validUntil": "2026-10-03"
}
```

### Respuesta: requiere visita técnica

```json
{
  "quoteId": "COT-19C4D2",
  "status": "requires_visit",
  "message": "Este trabajo necesita medidas en sitio. Agenda una visita y te enviamos el precio final.",
  "appointment": { "reason": "Visita técnica para medición", "suggestedSlots": ["2026-09-28T10:00"] }
}
```

### Flujo sugerido en n8n

1. **Enrutar por acción** (salida `cotizar`) → validar campos.
2. Buscar precio base y margen de la `subcategory` (lista de precios propia o de proveedores).
3. Si la subcategoría requiere medición (rotulación vehicular, rótulos corpóreos, stands) → `requires_visit`.
4. Guardar la solicitud (Firestore/Postgres) con estado `pendiente_confirmacion` y hora de entrada.
5. Notificar al equipo (correo/Telegram/Slack) para confirmar el precio final.
6. **Meta de servicio**: un nodo *Wait* o un flujo programado revisa las cotizaciones sin confirmar a los 10 minutos y escala la alerta, para que el precio final llegue en minutos.
7. Responder al webhook.

---

## `action: "cita"`

### Petición

```json
{
  "action": "cita",
  "slot": "2026-09-28T10:00",
  "address": "Av. Siempre Viva 742, Col. Centro",
  "contact": { "name": "Ana", "email": "ana@correo.com", "phone": "5512345678" },
  "reason": "Medición para rotulación vehicular",
  "quoteId": "COT-19C4D2",
  "sessionId": "5f0c…-uuid",
  "uid": "abc123"
}
```

### Respuesta

```json
{
  "appointmentId": "CITA-7A11B3",
  "status": "confirmed",
  "message": "Cita agendada. Te llegará la confirmación por correo y uno de nuestros ninjas te contactará."
}
```

`status` puede ser `confirmed` o `pending` (si un humano debe aprobar el horario). El `message` se muestra tal cual al cliente.

### Flujo sugerido en n8n

1. **Enrutar por acción** (salida `cita`) → verificar que el horario siga libre.
2. Crear el evento (Google Calendar del equipo técnico) y guardar la cita.
3. **Notificar a los ninjas** con dirección, horario, contacto y enlace a Google Maps.
4. Enviar confirmación al cliente por correo.
5. Responder al webhook.

---

## `action: "rutas"` (admin)

### Petición

```json
{
  "action": "rutas",
  "date": "2026-09-28",
  "origin": { "address": "Taller IMPRIME con SHIR", "lat": null, "lng": null },
  "couriers": ["Mensajero 1", "Mensajero 2"],
  "deliveries": [
    { "id": "d1", "customer": "Ana", "address": "Av. Juárez 10", "zone": "Centro", "timeWindow": "10:00-12:00" }
  ]
}
```

### Respuesta

```json
{
  "date": "2026-09-28",
  "totalStops": 1,
  "message": "1 entregas agrupadas en 1 ruta.",
  "routes": [
    {
      "zone": "Centro",
      "courier": "Mensajero 1",
      "stops": [{ "order": 1, "id": "d1", "customer": "Ana", "address": "Av. Juárez 10", "timeWindow": "10:00-12:00" }],
      "mapsLinks": ["https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=…"]
    }
  ]
}
```

Agrupa por `zone`, asigna mensajeros en rotación y ordena las paradas por horario, o por cercanía si todas las paradas y el origen traen `lat`/`lng`. Cada enlace de Google Maps lleva hasta 10 paradas; si hay más, se divide en tramos. **Mejora futura:** con una clave de Google Maps, geocodificar las direcciones y optimizar el orden con la *Directions API*.

---

## `action: "proveedores"` (admin)

### Petición

```json
{
  "action": "proveedores",
  "suppliers": [
    {
      "id": "s1",
      "name": "Vinilos del Centro",
      "email": "ventas@proveedor.com",
      "items": [{ "id": "i1", "name": "Vinil blanco", "unit": "m", "cost": 90, "salePrice": 100, "stock": 2, "minStock": 5 }]
    }
  ]
}
```

### Respuesta

```json
{
  "items": [{ "supplierId": "s1", "itemId": "i1", "margin": 0.1, "profit": 10, "lowStock": true, "lowMargin": true }],
  "alerts": [
    { "type": "stock", "supplier": "Vinilos del Centro", "item": "Vinil blanco", "message": "Inventario bajo de Vinil blanco (Vinilos del Centro): quedan 2 m." },
    { "type": "margin", "supplier": "Vinilos del Centro", "item": "Vinil blanco", "message": "Margen de 10% en Vinil blanco (Vinilos del Centro), por debajo del 25%." }
  ],
  "emailSent": false,
  "message": "2 alerta(s) detectada(s)."
}
```

`margin` = (venta − costo) / venta; se marca `lowMargin` por debajo del 25 %. **Pendiente:** después del nodo, si `alerts` no está vacío, enviar un correo (Gmail/SMTP) y devolver `emailSent: true`.

---

## `action: "finanzas"` (admin)

### Petición

```json
{ "action": "finanzas", "year": 2026 }
```

### Respuesta

```json
{
  "year": 2026,
  "currency": "MXN",
  "isSample": true,
  "monthly": [{ "month": "2026-01", "label": "Ene", "revenue": 108560, "orders": 46 }],
  "byCategory": [{ "slug": "gran-formato", "name": "Gran Formato", "revenue": 629930 }],
  "kpis": { "revenue": 1431660, "orders": 611, "avgTicket": 2343, "monthlyAverage": 119305, "bestMonth": "Dic", "worstMonth": "Sep" },
  "insights": ["May vendió 30% menos que el promedio mensual: conviene preparar una promoción desde el mes anterior."]
}
```

Hoy devuelve **datos de ejemplo** (`isSample: true`) con la estacionalidad baja de mayo y septiembre. **Pendiente:** leer los pedidos reales de Firestore y **verificar que el token sea de un admin** antes de responder, porque este reporte tendrá datos sensibles.

---

## Errores

Responde con un código HTTP distinto de 2xx. La web muestra un mensaje genérico según el tipo:

- sin respuesta o timeout → mensaje de conexión y botón "Reintentar";
- `429` → "Demasiados mensajes seguidos";
- otros `4xx`/`5xx` → error genérico.
