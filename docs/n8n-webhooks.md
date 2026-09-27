# Webhooks de n8n

La web se comunica con n8n mediante tres webhooks `POST` con cuerpo JSON. La URL base se define en `VITE_N8N_WEBHOOK_URL` (p. ej. `https://n8n.tudominio.com/webhook`); si está vacía, la web usa respuestas simuladas (`src/services/n8n/mock.js`) con este mismo contrato.

| Ruta | Uso | Origen en la web |
| --- | --- | --- |
| `/chat` | Mensaje del chat web → respuesta de la IA | `ChatWidget` |
| `/cotizacion` | Pre-cotización inmediata desde el formulario | `/cotizar` |
| `/citas` | Agendar visita técnica y avisar a los ninjas | Tarjeta de cita (chat y `/cotizar`) |

## Seguridad

- Si el visitante inició sesión, cada petición lleva `Authorization: Bearer <Firebase ID token>`. **n8n debe verificar el token** (firma con las llaves públicas de Google, `aud` = ID del proyecto de Firebase) antes de confiar en `uid` o `email` del cuerpo. Los campos `uid`/`user` del cuerpo son solo informativos.
- El chat y la cotización también funcionan sin sesión: aplica límite de peticiones por IP o por `sessionId` en n8n (o un proxy delante) para evitar abuso del modelo de IA.
- Configura CORS del webhook para aceptar solo el dominio de la web.
- Las respuestas del bot se muestran como **texto plano**; no envíes HTML.
- Los montos de una pre-cotización los calcula n8n; la web nunca envía precios.

---

## `POST /chat`

### Petición

```json
{
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

1. **Webhook** (POST, *Respond: Using 'Respond to Webhook' node*).
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

## `POST /cotizacion`

### Petición

```json
{
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
  "message": "Pre-cotización lista. Te confirmamos el precio final en menos de 2 horas.",
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

1. Webhook → validar campos.
2. Buscar precio base y margen de la `subcategory` (lista de precios propia o de proveedores).
3. Si la subcategoría requiere medición (rotulación vehicular, rótulos corpóreos, stands) → `requires_visit`.
4. Guardar la solicitud (Firestore/Postgres) con estado `pendiente_confirmacion` y hora de entrada.
5. Notificar al equipo (correo/Telegram/Slack) para confirmar el precio final.
6. **Meta de servicio**: un nodo *Wait* o un flujo programado revisa las cotizaciones sin confirmar a los 90 minutos y escala la alerta para cumplir el límite de 2 horas.
7. Responder al webhook.

---

## `POST /citas`

### Petición

```json
{
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

1. Webhook → verificar que el horario siga libre.
2. Crear el evento (Google Calendar del equipo técnico) y guardar la cita.
3. **Notificar a los ninjas** con dirección, horario, contacto y enlace a Google Maps.
4. Enviar confirmación al cliente por correo.
5. Responder al webhook.

---

## Errores

Responde con un código HTTP distinto de 2xx. La web muestra un mensaje genérico según el tipo:

- sin respuesta o timeout → mensaje de conexión y botón "Reintentar";
- `429` → "Demasiados mensajes seguidos";
- otros `4xx`/`5xx` → error genérico.
