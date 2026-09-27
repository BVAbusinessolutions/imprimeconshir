/**
 * Genera n8n-workflow-base.json a partir de src/services/n8n/logic.js.
 *
 *   npm run n8n:build
 *
 * Cada nodo Code del workflow recibe la lógica completa (sin `export`) y llama a su función.
 * Así la web (modo de prueba) y n8n responden exactamente igual. Después de generarlo,
 * importa el archivo en n8n (Workflows → Import from File) y actívalo.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const logicSource = readFileSync(resolve(root, 'src/services/n8n/logic.js'), 'utf8').replace(/^export /gm, '');
const outFile = resolve(root, 'n8n-workflow-base.json');

// Acción del webhook → [nombre del nodo, función de logic.js, posición y]
const ACTIONS = [
  ['chat', 'Chat', 'chatReply', 0],
  ['cotizar', 'Pre-cotización', 'quoteReply', 200],
  ['cita', 'Cita técnica', 'appointmentReply', 400],
  ['rutas', 'Logística · rutas', 'planRoutes', 600],
  ['proveedores', 'Proveedores · márgenes', 'analyzeSuppliers', 800],
  ['finanzas', 'Finanzas · reporte', 'financeReport', 1000],
];

const codeFor = (fn) =>
  `// Generado por scripts/n8n/build-workflow.mjs desde src/services/n8n/logic.js. No editar aquí:\n` +
  `// cambia logic.js y ejecuta "npm run n8n:build".\n\n${logicSource}\n` +
  `return [{ json: ${fn}($input.first().json.body || {}) }];\n`;

const condition = (value) => ({
  conditions: {
    options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
    conditions: [
      {
        id: randomUUID(),
        leftValue: '={{ $json.body.action }}',
        rightValue: value,
        operator: { type: 'string', operation: 'equals' },
      },
    ],
    combinator: 'and',
  },
  renameOutput: true,
  outputKey: value,
});

const note = (name, content, position, width, height) => ({
  parameters: { content, width, height },
  id: randomUUID(),
  name,
  type: 'n8n-nodes-base.stickyNote',
  typeVersion: 1,
  position,
});

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
    position: [240, 560],
    webhookId: 'imprimeconshir-webhook-1234',
  },
  {
    parameters: {
      rules: { values: ACTIONS.map(([action]) => condition(action)) },
      options: { fallbackOutput: 'extra', renameFallbackOutput: 'desconocida' },
    },
    id: randomUUID(),
    name: 'Enrutar por acción',
    type: 'n8n-nodes-base.switch',
    typeVersion: 3.2,
    position: [480, 560],
  },
  ...ACTIONS.map(([, name, fn, y]) => ({
    parameters: { jsCode: codeFor(fn) },
    id: randomUUID(),
    name,
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [780, 60 + y],
  })),
  {
    parameters: { respondWith: 'json', responseBody: '={{ $json }}', options: {} },
    id: randomUUID(),
    name: 'Responder',
    type: 'n8n-nodes-base.respondToWebhook',
    typeVersion: 1.1,
    position: [1100, 560],
  },
  {
    parameters: {
      respondWith: 'json',
      responseBody: '={"error": "Acción no válida."}',
      options: { responseCode: 400 },
    },
    id: randomUUID(),
    name: 'Acción no válida',
    type: 'n8n-nodes-base.respondToWebhook',
    typeVersion: 1.1,
    position: [780, 1260],
  },
  note(
    'Nota general',
    '## IMPRIME con SHIR · Recepción web\nUn solo webhook POST; el campo `action` decide el flujo.\nContrato: `docs/n8n-webhooks.md`.\n\n**Este archivo se genera** con `npm run n8n:build` desde `src/services/n8n/logic.js`.',
    [140, 300],
    420,
    220
  ),
  note(
    'Nota IA',
    '### Próximo paso: IA\nSustituir **Chat** por un **AI Agent** con el tono de Shirlene y memoria por `sessionId`. Debe devolver `reply`, `intent` y opcionalmente `quote`, `appointment`, `suggestions`.',
    [1000, -120],
    380,
    170
  ),
  note(
    'Nota integraciones',
    '### Pendiente de credenciales\n- **Cita técnica** → Google Calendar + aviso a ninjas.\n- **Proveedores** → correo con `alerts` (Gmail/SMTP).\n- **Pre-cotización / Cita** → guardar en Firestore (`quotes`, `appointments`) con `userId` verificado.\n- **Finanzas** → leer pedidos reales de Firestore (hoy devuelve datos de ejemplo, `isSample: true`).',
    [1300, 700],
    420,
    240
  ),
];

const connections = {
  'Webhook Principal': { main: [[{ node: 'Enrutar por acción', type: 'main', index: 0 }]] },
  'Enrutar por acción': {
    main: [
      ...ACTIONS.map(([, name]) => [{ node: name, type: 'main', index: 0 }]),
      [{ node: 'Acción no válida', type: 'main', index: 0 }],
    ],
  },
  ...Object.fromEntries(ACTIONS.map(([, name]) => [name, { main: [[{ node: 'Responder', type: 'main', index: 0 }]] }])),
};

const workflow = { name: 'Imprime con SHIR - Recepción Web', nodes, connections, settings: { executionOrder: 'v1' } };

// Verificación: cada nodo compila y responde con un cuerpo de ejemplo
const samples = {
  chatReply: { message: 'quiero rotular mi camioneta' },
  quoteReply: { subcategory: 'lonas', width: 3, height: 1.5, unit: 'm', quantity: 1 },
  appointmentReply: { slot: '2026-10-01T10:00', address: 'Calle 1', contact: { phone: '5500000000' } },
  planRoutes: { deliveries: [{ id: 'a', address: 'Calle 1', zone: 'Norte' }, { id: 'b', address: 'Calle 2', zone: 'Sur' }] },
  analyzeSuppliers: { suppliers: [{ id: 's', name: 'Prov', items: [{ id: 'i', name: 'Vinil', cost: 90, salePrice: 100, stock: 2, minStock: 5 }] }] },
  financeReport: { year: 2026 },
};
for (const [, name, fn] of ACTIONS) {
  const node = nodes.find((n) => n.name === name);
  const out = new Function('$input', node.parameters.jsCode)({ first: () => ({ json: { body: samples[fn] } }) });
  if (!out?.[0]?.json) throw new Error(`El nodo "${name}" no devolvió JSON`);
}

writeFileSync(outFile, JSON.stringify(workflow, null, 2) + '\n');
console.log(`n8n-workflow-base.json generado: ${nodes.length} nodos, acciones: ${ACTIONS.map((a) => a[0]).join(', ')}`);
