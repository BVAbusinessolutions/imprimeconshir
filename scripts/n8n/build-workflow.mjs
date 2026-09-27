/**
 * Genera n8n-workflow-base.json a partir de src/services/n8n/logic.js.
 *
 *   npm run n8n:build
 *
 * Cada nodo Code del workflow recibe la lógica completa (sin `export`) y llama a su función.
 * Así la web (modo de prueba) y n8n responden exactamente igual. Después de generarlo,
 * importa el archivo en n8n (Workflows → Import from File) y actívalo.
 *
 * Flujo:
 *   Webhook → Preparar (lee action y token) → ¿Acción de admin?
 *     ├─ sí → Verificar admin (Firestore REST con el token del usuario) → ¿Es admin? → Enrutar por acción
 *     └─ no ───────────────────────────────────────────────────────────────────────→ Enrutar por acción
 *   Enrutar por acción → nodo de cada acción → Responder
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const logicSource = readFileSync(resolve(root, 'src/services/n8n/logic.js'), 'utf8').replace(/^export /gm, '');
const projectId = JSON.parse(readFileSync(resolve(root, '.firebaserc'), 'utf8')).projects.default;
const outFile = resolve(root, 'n8n-workflow-base.json');

// [acción, nombre del nodo, función de logic.js, ¿solo admin?]
const ACTIONS = [
  ['chat', 'Chat', 'chatReply', false],
  ['cotizar', 'Pre-cotización', 'quoteReply', false],
  ['cita', 'Cita técnica', 'appointmentReply', false],
  ['rutas', 'Logística · rutas', 'planRoutes', true],
  ['proveedores', 'Proveedores · márgenes', 'analyzeSuppliers', true],
  ['finanzas', 'Finanzas · reporte', 'financeReport', true],
  ['notificar', 'Citas · aviso a técnico', 'notifyReply', true],
  ['correo', 'Correos · envío', 'emailReply', true],
  ['proyeccion', 'Planeación · proyección', 'planForecast', true],
];
const ADMIN_ACTIONS = ACTIONS.filter((a) => a[3]).map((a) => a[0]);

const HEADER = `// Generado por scripts/n8n/build-workflow.mjs. No editar aquí: cambia el código fuente y ejecuta "npm run n8n:build".\n`;

const codeFor = (fn) => `${HEADER}// Fuente: src/services/n8n/logic.js\n\n${logicSource}\nreturn [{ json: ${fn}($input.first().json.body || {}) }];\n`;

// Lee la acción y el ID de usuario del token (sin verificar: Firestore lo verifica en el siguiente nodo)
const prepareCode = `${HEADER}
const ADMIN_ACTIONS = ${JSON.stringify(ADMIN_ACTIONS)};
const item = $input.first().json;
const body = item.body || {};
const header = String((item.headers && item.headers.authorization) || '');
const token = header.startsWith('Bearer ') ? header.slice(7) : '';

let uid = null;
try {
  const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const json = typeof Buffer !== 'undefined' ? Buffer.from(part, 'base64').toString('utf8') : atob(part);
  const claims = JSON.parse(json);
  uid = claims.user_id || claims.sub || null;
} catch (e) {
  uid = null;
}

return [{ json: { body, _admin: ADMIN_ACTIONS.includes(body.action), _uid: uid, _auth: token ? 'Bearer ' + token : '' } }];
`;

// Continúa solo si Firestore devolvió el perfil con role = admin
const isAdminCode = `${HEADER}
const res = $input.first().json;
const role = res.statusCode === 200 && res.body && res.body.fields && res.body.fields.role && res.body.fields.role.stringValue;
if (role === 'admin') return [{ json: $('Preparar').first().json }];
return [{ json: { _denied: true } }];
`;

const rule = (leftValue, rightValue, outputKey) => ({
  conditions: {
    options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
    conditions: [{ id: randomUUID(), leftValue, rightValue, operator: { type: 'string', operation: 'equals' } }],
    combinator: 'and',
  },
  renameOutput: true,
  outputKey,
});

const switchNode = (name, rules, fallback, position) => ({
  parameters: { rules: { values: rules }, options: { fallbackOutput: 'extra', renameFallbackOutput: fallback } },
  id: randomUUID(),
  name,
  type: 'n8n-nodes-base.switch',
  typeVersion: 3.2,
  position,
});

const code = (name, jsCode, position) => ({
  parameters: { jsCode },
  id: randomUUID(),
  name,
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position,
});

const respond = (name, responseBody, position, responseCode) => ({
  parameters: { respondWith: 'json', responseBody, options: responseCode ? { responseCode } : {} },
  id: randomUUID(),
  name,
  type: 'n8n-nodes-base.respondToWebhook',
  typeVersion: 1.1,
  position,
});

const note = (name, content, position, width, height) => ({
  parameters: { content, width, height },
  id: randomUUID(),
  name,
  type: 'n8n-nodes-base.stickyNote',
  typeVersion: 1,
  position,
});

const X = { webhook: 0, prepare: 220, isAdminAction: 440, verify: 660, isAdmin: 880, gate: 1100, router: 1320, action: 1600, respond: 1920 };
const MID = 900;

const nodes = [
  {
    parameters: {
      httpMethod: 'POST',
      path: 'imprimeconshir',
      responseMode: 'responseNode',
      // CORS: cambia "*" por tu dominio al publicar (ver pendientes/README.md)
      options: { allowedOrigins: '*' },
    },
    id: randomUUID(),
    name: 'Webhook Principal',
    type: 'n8n-nodes-base.webhook',
    typeVersion: 2,
    position: [X.webhook, MID],
    webhookId: 'imprimeconshir-webhook-1234',
  },
  code('Preparar', prepareCode, [X.prepare, MID]),
  switchNode('¿Acción de admin?', [rule("={{ $json._admin ? 'admin' : 'publica' }}", 'admin', 'admin')], 'publica', [X.isAdminAction, MID]),
  {
    parameters: {
      url: `=https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/{{ $json._uid || 'sin-usuario' }}`,
      sendHeaders: true,
      headerParameters: { parameters: [{ name: 'Authorization', value: '={{ $json._auth }}' }] },
      options: { response: { response: { neverError: true, fullResponse: true } }, timeout: 10000 },
    },
    id: randomUUID(),
    name: 'Verificar admin',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [X.verify, MID - 200],
  },
  code('¿Es admin?', isAdminCode, [X.isAdmin, MID - 200]),
  switchNode('Permiso', [rule("={{ $json._denied ? 'no' : 'si' }}", 'si', 'permitido')], 'denegado', [X.gate, MID - 200]),
  respond('Sin permiso', '={"error": "Solo administradores."}', [X.gate + 220, MID - 420], 403),
  switchNode(
    'Enrutar por acción',
    ACTIONS.map(([action]) => rule('={{ $json.body.action }}', action, action)),
    'desconocida',
    [X.router, MID]
  ),
  ...ACTIONS.map(([, name, fn], i) => code(name, codeFor(fn), [X.action, 60 + i * 200])),
  respond('Responder', '={{ $json }}', [X.respond, MID]),
  respond('Acción no válida', '={"error": "Acción no válida."}', [X.action, 60 + ACTIONS.length * 200], 400),
  note(
    'Nota general',
    '## IMPRIME con SHIR · Recepción web\nUn solo webhook POST; el campo `action` decide el flujo.\nContrato: `docs/n8n-webhooks.md`.\n\n**Este archivo se genera** con `npm run n8n:build` desde `src/services/n8n/logic.js`. Agrega nodos nuevos *después* de los generados.',
    [X.webhook - 40, MID + 200],
    420,
    220
  ),
  note(
    'Nota seguridad',
    `### Acciones de admin\n${ADMIN_ACTIONS.map((a) => '`' + a + '`').join(', ')} pasan por **Verificar admin**: con el token del usuario se lee su perfil en Firestore (\`users/{uid}\`); las reglas solo lo permiten al propio usuario y Firestore rechaza tokens inválidos. Solo continúa si \`role = admin\`.`,
    [X.verify - 40, MID - 560],
    460,
    200
  ),
  note(
    'Nota IA',
    '### Próximo paso: IA\nSustituir **Chat** por un **AI Agent** con el tono de Shirlene y memoria por `sessionId`. Debe devolver `reply`, `intent` y opcionalmente `quote`, `appointment`, `suggestions`.',
    [X.respond - 40, -160],
    380,
    170
  ),
  note(
    'Nota integraciones',
    '### Pendiente de credenciales\n- **Citas · aviso** y **Cita técnica** → Gmail/Telegram a ninjas + Google Calendar (luego `sent: true`).\n- **Correos · envío** → Gmail/SMTP a `recipients` (luego `sent: true`).\n- **Proveedores** → correo con `alerts` a `alertEmail`.\n- **Pre-cotización / Cita** → guardar en Firestore (`quotes`, `appointments`).\n- **Finanzas** → leer pedidos reales (hoy `isSample: true`).',
    [X.respond - 40, MID + 200],
    440,
    260
  ),
];

const to = (node) => [{ node, type: 'main', index: 0 }];
const connections = {
  'Webhook Principal': { main: [to('Preparar')] },
  Preparar: { main: [to('¿Acción de admin?')] },
  '¿Acción de admin?': { main: [to('Verificar admin'), to('Enrutar por acción')] },
  'Verificar admin': { main: [to('¿Es admin?')] },
  '¿Es admin?': { main: [to('Permiso')] },
  Permiso: { main: [to('Enrutar por acción'), to('Sin permiso')] },
  'Enrutar por acción': { main: [...ACTIONS.map(([, name]) => to(name)), to('Acción no válida')] },
  ...Object.fromEntries(ACTIONS.map(([, name]) => [name, { main: [to('Responder')] }])),
};

const workflow = { name: 'Imprime con SHIR - Recepción Web', nodes, connections, settings: { executionOrder: 'v1' } };

// ─── Verificación ─────────────────────────────────────────────
// 1) cada nodo de acción compila y responde con un cuerpo de ejemplo
const samples = {
  chatReply: { message: 'quiero rotular mi camioneta' },
  quoteReply: { subcategory: 'lonas', width: 3, height: 1.5, unit: 'm', quantity: 1 },
  appointmentReply: { slot: '2026-10-01T10:00', address: 'Calle 1', contact: { phone: '5500000000' } },
  planRoutes: { deliveries: [{ id: 'a', address: 'Calle 1', zone: 'Norte' }, { id: 'b', address: 'Calle 2', zone: 'Sur' }] },
  analyzeSuppliers: { suppliers: [{ id: 's', name: 'Prov', items: [{ id: 'i', name: 'Vinil', cost: 90, salePrice: 100 }] }], inventory: [{ id: 'v', name: 'Vinil', stock: 1, minStock: 5 }] },
  financeReport: { year: 2026 },
  notifyReply: { appointment: { reason: 'Medición', slot: '2026-10-01T10:00' }, technician: { name: 'Beto', email: 'b@x.com' } },
  emailReply: { to: ['a@b.com'], subject: 'Hola', text: 'Prueba' },
  planForecast: { startMonth: '2026-10', baseline: new Array(12).fill(100000), expenses: [{ amount: 50000, type: 'monthly', month: '2026-10' }] },
};
for (const [, name, fn] of ACTIONS) {
  const node = nodes.find((n) => n.name === name);
  const out = new Function('$input', node.parameters.jsCode)({ first: () => ({ json: { body: samples[fn] } }) });
  if (!out?.[0]?.json) throw new Error(`El nodo "${name}" no devolvió JSON`);
}

// 2) el nodo Preparar extrae el uid de un token y marca las acciones de admin
const fakeToken = ['x', Buffer.from(JSON.stringify({ user_id: 'uid123' })).toString('base64url'), 'y'].join('.');
const prep = new Function('$input', nodes.find((n) => n.name === 'Preparar').parameters.jsCode)({
  first: () => ({ json: { body: { action: 'finanzas' }, headers: { authorization: `Bearer ${fakeToken}` } } }),
})[0].json;
if (prep._uid !== 'uid123' || prep._admin !== true) throw new Error('Preparar no leyó el token correctamente');

// 3) ¿Es admin? solo deja pasar role = admin
const gate = (statusCode, role) =>
  new Function('$input', '$', nodes.find((n) => n.name === '¿Es admin?').parameters.jsCode)(
    { first: () => ({ json: { statusCode, body: { fields: role ? { role: { stringValue: role } } : {} } } }) },
    () => ({ first: () => ({ json: prep }) })
  )[0].json;
if (gate(200, 'admin')._denied || !gate(200, 'customer')._denied || !gate(403)._denied) throw new Error('¿Es admin? no filtra bien');

writeFileSync(outFile, JSON.stringify(workflow, null, 2) + '\n');
console.log(`n8n-workflow-base.json generado: ${nodes.length} nodos · públicas: ${ACTIONS.filter((a) => !a[3]).map((a) => a[0]).join(', ')} · admin: ${ADMIN_ACTIONS.join(', ')}`);
