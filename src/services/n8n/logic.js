/**
 * Lógica de negocio de los flujos de n8n, escrita UNA sola vez.
 *
 * - En la web la usa el modo de prueba (mock.js).
 * - `npm run n8n:build` copia estas funciones dentro de los nodos Code de n8n-workflow-base.json.
 *
 * Reglas para que funcione en ambos lados: JavaScript puro, sin imports, sin APIs del navegador
 * y cada función exportada recibe el cuerpo de la petición y devuelve la respuesta JSON.
 */

// ─── Utilidades ───────────────────────────────────────────────

const pad = (n) => String(n).padStart(2, '0');

const isoDay = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
};

// Horarios sugeridos: próximos 3 días a las 10:00 y 16:00 (hora local del servidor)
const suggestedSlots = () => [1, 2, 3].flatMap((o) => [isoDay(o) + 'T10:00', isoDay(o) + 'T16:00']);

const shortId = (prefix) => prefix + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();

const round2 = (n) => Math.round(n * 100) / 100;

// ─── Chat (temporal, por reglas; se reemplazará por un AI Agent con el tono de Shirlene) ───

export function chatReply(body) {
  const text = String((body && body.message) || '').toLowerCase();

  if (/(rotul|veh[ií]culo|camioneta|carro|auto|flotilla|medir|medidas)/.test(text)) {
    return {
      reply:
        '¡Qué buen proyecto! Para rotular un vehículo necesitamos tomar medidas exactas. Te agendo una visita con uno de nuestros ninjas y te llevamos propuesta y precio final.',
      intent: 'appointment',
      appointment: { reason: 'Medición para rotulación vehicular', suggestedSlots: suggestedSlots() },
    };
  }

  if (/(cotiz|precio|cu[aá]nto|costo|lona|vinil|tarjeta)/.test(text)) {
    return {
      reply:
        'Te dejo una pre-cotización rápida de una lona de 2 × 1 m. Si me das tus medidas y cantidad exactas, te la ajusto al momento.',
      intent: 'quote',
      quote: buildQuote({ subcategory: 'lonas', width: 2, height: 1, unit: 'm', quantity: 1 }),
      suggestions: ['Quiero otras medidas', 'Necesito 10 piezas', 'Cotización formal'],
    };
  }

  return {
    reply: '¡Hola! Soy del equipo de IMPRIME con SHIR. Cuéntame qué necesitas imprimir y te ayudo a cotizarlo al instante.',
    intent: 'general',
    suggestions: ['Cotizar una lona', 'Rotular mi camioneta', 'Material para un evento'],
  };
}

// ─── Pre-cotización ───────────────────────────────────────────

// Precios de referencia (MXN) por m² o por pieza. Sustituir por la lista real (pendientes/precios.csv).
const PRICE_TABLE = {
  lonas: { unit: 'm2', price: 180 },
  vinil: { unit: 'm2', price: 260 },
  'rotulacion-vehicular': { unit: 'm2', price: 650 },
  'rotulos-corporeos': { unit: 'm2', price: 2800 },
  cajas: { unit: 'pieza', price: 14 },
  papeleria: { unit: 'pieza', price: 3.5 },
  'rollos-termicos': { unit: 'pieza', price: 22 },
  stands: { unit: 'pieza', price: 8500 },
  'material-pop': { unit: 'pieza', price: 450 },
  activaciones: { unit: 'pieza', price: 6000 },
  'senalizacion-eventos': { unit: 'm2', price: 320 },
  'articulos-promocionales': { unit: 'pieza', price: 38 },
  textiles: { unit: 'pieza', price: 145 },
  'kits-corporativos': { unit: 'pieza', price: 520 },
};
// Trabajos que necesitan visita técnica antes de dar precio
const NEEDS_VISIT = ['rotulacion-vehicular', 'rotulos-corporeos', 'stands'];
const DESIGN_FEE = 350;
const TAX_RATE = 0.16;

function buildQuote(body) {
  const rule = PRICE_TABLE[body.subcategory] || { unit: 'pieza', price: 100 };
  const factor = body.unit === 'cm' ? 0.01 : 1;
  const area = Math.max((Number(body.width) || 0) * factor * (Number(body.height) || 0) * factor, 0.5);
  const qty = Math.max(parseInt(body.quantity, 10) || 1, 1);
  const base = Math.round(rule.unit === 'm2' ? area * qty * rule.price : qty * rule.price);
  const subtotal = base + DESIGN_FEE;
  const tax = Math.round(subtotal * TAX_RATE);

  return {
    quoteId: shortId('COT'),
    status: 'preliminary',
    items: [
      { concept: rule.unit === 'm2' ? 'Impresión ' + area.toFixed(2) + ' m² × ' + qty : 'Producción ' + qty + ' pzas', amount: base },
      { concept: 'Ajuste de diseño y preprensa', amount: DESIGN_FEE },
    ],
    subtotal,
    tax,
    total: subtotal + tax,
    currency: 'MXN',
    validUntil: isoDay(7),
  };
}

export function quoteReply(body) {
  if (NEEDS_VISIT.includes(body.subcategory)) {
    return {
      quoteId: shortId('COT'),
      status: 'requires_visit',
      message: 'Este trabajo necesita medidas en sitio. Agenda una visita y te enviamos el precio final.',
      appointment: { reason: 'Visita técnica para medición', suggestedSlots: suggestedSlots() },
    };
  }
  return { ...buildQuote(body), message: 'Pre-cotización lista. Un asesor te confirma el precio final en minutos.' };
}

// ─── Cita técnica ─────────────────────────────────────────────

export function appointmentReply(body) {
  if (!body.slot || !body.address || !body.contact || !body.contact.phone) {
    return { status: 'pending', message: 'Nos faltan datos de la cita. Un asesor te contactará en minutos.' };
  }
  return {
    appointmentId: shortId('CITA'),
    status: 'confirmed',
    message: 'Cita agendada. Te llegará la confirmación y uno de nuestros ninjas te contactará.',
  };
}

// ─── Logística: sectorización de rutas por zona ───────────────

const MAX_STOPS_PER_LINK = 10; // Google Maps admite origen + 9 paradas intermedias + destino por enlace

const mapsLink = (origin, stops) => {
  const enc = encodeURIComponent;
  const destination = stops[stops.length - 1];
  const waypoints = stops.slice(0, -1).join('|');
  return (
    'https://www.google.com/maps/dir/?api=1&travelmode=driving' +
    (origin ? '&origin=' + enc(origin) : '') +
    '&destination=' + enc(destination) +
    (waypoints ? '&waypoints=' + enc(waypoints) : '')
  );
};

const distance = (a, b) => Math.hypot(a.lat - b.lat, a.lng - b.lng);

// Vecino más cercano cuando hay coordenadas; si no, se respeta el orden por horario
const orderStops = (stops, originCoords) => {
  const withCoords = stops.filter((s) => typeof s.lat === 'number' && typeof s.lng === 'number');
  if (!originCoords || withCoords.length !== stops.length) {
    return stops.slice().sort((a, b) => String(a.timeWindow || '').localeCompare(String(b.timeWindow || '')));
  }
  const pending = stops.slice();
  const ordered = [];
  let current = originCoords;
  while (pending.length) {
    let best = 0;
    for (let i = 1; i < pending.length; i++) if (distance(current, pending[i]) < distance(current, pending[best])) best = i;
    current = pending.splice(best, 1)[0];
    ordered.push(current);
  }
  return ordered;
};

/**
 * body: { date, origin: { address, lat?, lng? }, couriers: [nombre], deliveries: [{ id, customer, address, zone, lat?, lng?, timeWindow? }] }
 */
export function planRoutes(body) {
  const deliveries = Array.isArray(body.deliveries) ? body.deliveries : [];
  const couriers = Array.isArray(body.couriers) && body.couriers.length ? body.couriers : [];
  const origin = body.origin || {};
  const originCoords = typeof origin.lat === 'number' && typeof origin.lng === 'number' ? origin : null;

  const byZone = {};
  for (const d of deliveries) {
    const zone = d.zone || 'Sin zona';
    (byZone[zone] = byZone[zone] || []).push(d);
  }

  const routes = Object.keys(byZone)
    .sort()
    .map((zone, i) => {
      const stops = orderStops(byZone[zone], originCoords);
      const addresses = stops.map((s) => s.address);
      const links = [];
      for (let k = 0; k < addresses.length; k += MAX_STOPS_PER_LINK) {
        const chunk = addresses.slice(k, k + MAX_STOPS_PER_LINK);
        links.push(mapsLink(k === 0 ? origin.address : addresses[k - 1], chunk));
      }
      return {
        zone,
        courier: couriers.length ? couriers[i % couriers.length] : null,
        stops: stops.map((s, n) => ({ order: n + 1, id: s.id, customer: s.customer, address: s.address, timeWindow: s.timeWindow || null })),
        mapsLinks: links,
      };
    });

  return {
    date: body.date || null,
    totalStops: deliveries.length,
    routes,
    message: routes.length
      ? deliveries.length + ' entregas agrupadas en ' + routes.length + (routes.length === 1 ? ' ruta.' : ' rutas por zona.')
      : 'No hay entregas para ese día.',
  };
}

// ─── Proveedores e inventario: márgenes y alertas ─────────────

const DEFAULT_MIN_MARGIN = 0.25; // debajo de este margen se marca alerta

/**
 * body: {
 *   suppliers: [{ id, name, email?, items: [{ id, name, unit, cost, salePrice }] }],
 *   inventory: [{ id, name, unit, stock, minStock, supplierId? }],
 *   minMargin?: 0.25,
 *   alertEmail?: 'correo para alertas'
 * }
 */
export function analyzeSuppliers(body) {
  const suppliers = Array.isArray(body.suppliers) ? body.suppliers : [];
  const inventory = Array.isArray(body.inventory) ? body.inventory : [];
  const minMargin = typeof body.minMargin === 'number' ? body.minMargin : DEFAULT_MIN_MARGIN;
  const supplierName = Object.fromEntries(suppliers.map((s) => [s.id, s.name]));
  const items = [];
  const stock = [];
  const alerts = [];

  for (const s of suppliers) {
    for (const it of s.items || []) {
      const cost = Number(it.cost) || 0;
      const sale = Number(it.salePrice) || 0;
      const margin = sale > 0 ? round2((sale - cost) / sale) : null;
      const lowMargin = margin != null && margin < minMargin;
      items.push({ supplierId: s.id, itemId: it.id, margin, profit: sale > 0 ? round2(sale - cost) : null, lowMargin });
      if (lowMargin) {
        alerts.push({
          type: 'margin',
          supplier: s.name,
          item: it.name,
          message: 'Margen de ' + Math.round(margin * 100) + '% en ' + it.name + ' (' + s.name + '), por debajo del ' + Math.round(minMargin * 100) + '%.',
        });
      }
    }
  }

  for (const it of inventory) {
    const low = it.minStock != null && Number(it.stock) <= Number(it.minStock);
    stock.push({ itemId: it.id, lowStock: low });
    if (low) {
      const from = supplierName[it.supplierId];
      alerts.push({
        type: 'stock',
        supplier: from || null,
        item: it.name,
        message: 'Inventario bajo de ' + it.name + ': quedan ' + it.stock + ' ' + (it.unit || '') + ' (mínimo ' + it.minStock + ')' + (from ? '. Proveedor: ' + from + '.' : '.'),
      });
    }
  }

  return {
    items,
    stock,
    alerts,
    alertEmail: body.alertEmail || null,
    // n8n cambia esto a true cuando el nodo de correo envía las alertas
    emailSent: false,
    message: alerts.length ? alerts.length + ' alerta(s) detectada(s).' : 'Sin alertas: márgenes e inventario en orden.',
  };
}

// ─── Citas: aviso al técnico ──────────────────────────────────

/** Texto del aviso para el técnico (también lo usa la web para WhatsApp y correo). */
export function buildTechnicianMessage(appointment, technician) {
  const a = appointment || {};
  const c = a.contact || {};
  const when = String(a.slot || '').replace('T', ' a las ');
  const maps = a.address ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(a.address) : '';
  const subject = 'Nueva visita: ' + (a.reason || 'visita técnica') + (when ? ' · ' + when : '');
  const text = [
    'Hola ' + ((technician && technician.name) || '') + ', tienes una visita asignada.',
    '',
    'Motivo: ' + (a.reason || 'Visita técnica'),
    'Cuándo: ' + (when || 'por confirmar'),
    'Dirección: ' + (a.address || 'por confirmar'),
    maps ? 'Mapa: ' + maps : '',
    'Cliente: ' + [c.name, c.phone].filter(Boolean).join(' · '),
    a.notes ? 'Notas: ' + a.notes : '',
  ]
    .filter((line, i, all) => line !== '' || (i > 0 && all[i - 1] !== ''))
    .join('\n')
    .trim();
  return { subject, text };
}

/** body: { appointment, technician: { name, email, phone } } */
export function notifyReply(body) {
  const technician = body.technician || {};
  if (!technician.email && !technician.phone) {
    return { sent: false, message: 'El técnico no tiene correo ni teléfono registrado.' };
  }
  const msg = buildTechnicianMessage(body.appointment, technician);
  return {
    ...msg,
    to: technician.email || null,
    // n8n cambia esto a true cuando el nodo de Gmail/Telegram envía el aviso
    sent: false,
    message: 'Aviso preparado para ' + (technician.name || 'el técnico') + '.',
  };
}

// ─── Correos ──────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RECIPIENTS = 50;

/** body: { to: [correo], subject, text, kind? } → valida y deja listo el envío. */
export function emailReply(body) {
  const to = (Array.isArray(body.to) ? body.to : [body.to]).map((e) => String(e || '').trim()).filter(Boolean);
  const valid = to.filter((e) => EMAIL_RE.test(e));
  const invalid = to.filter((e) => !EMAIL_RE.test(e));

  if (!valid.length) return { status: 'invalid', sent: false, count: 0, invalid, message: 'No hay destinatarios válidos.' };
  if (valid.length > MAX_RECIPIENTS) {
    return { status: 'invalid', sent: false, count: valid.length, invalid, message: 'Máximo ' + MAX_RECIPIENTS + ' destinatarios por envío.' };
  }
  if (!String(body.subject || '').trim() || !String(body.text || '').trim()) {
    return { status: 'invalid', sent: false, count: valid.length, invalid, message: 'Falta el asunto o el mensaje.' };
  }

  return {
    status: 'queued',
    // n8n cambia esto a true cuando el nodo de correo realmente envía
    sent: false,
    count: valid.length,
    recipients: valid,
    invalid,
    subject: String(body.subject).trim(),
    text: String(body.text).trim(),
    message: valid.length + ' correo(s) listo(s) para enviar.',
  };
}

// ─── Planeación financiera: proyección y escenarios ───────────

const addMonthsIso = (ym, n) => {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1);
};

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// ¿El movimiento aplica en este mes? type: 'monthly' (desde `month`, opcionalmente por `months`) o 'once'
const appliesIn = (item, ym) => {
  const start = item.month || '0000-00';
  if (item.type === 'once') return ym === start;
  if (ym < start) return false;
  if (item.months) return ym < addMonthsIso(start, Number(item.months));
  return true;
};

function simulate(body, growth) {
  const months = Math.min(Math.max(Number(body.months) || 12, 1), 36);
  const start = body.startMonth || isoDay(0).slice(0, 7);
  const baseline = Array.isArray(body.baseline) && body.baseline.length === 12 ? body.baseline : new Array(12).fill(0);
  const costPct = Math.min(Math.max(Number(body.costOfSalesPct) || 0, 0), 1);
  const expenses = Array.isArray(body.expenses) ? body.expenses : [];
  const incomes = Array.isArray(body.incomes) ? body.incomes : [];
  let balance = Number(body.startingBalance) || 0;

  const rows = [];
  for (let i = 0; i < months; i++) {
    const ym = addMonthsIso(start, i);
    const monthIndex = Number(ym.slice(5, 7)) - 1;
    const sales = Math.round((Number(baseline[monthIndex]) || 0) * (1 + growth));
    const extraIncome = incomes.filter((x) => appliesIn(x, ym)).reduce((a, x) => a + (Number(x.amount) || 0), 0);
    const income = sales + extraIncome;
    const costOfSales = Math.round(sales * costPct);
    const planned = expenses.filter((x) => appliesIn(x, ym)).reduce((a, x) => a + (Number(x.amount) || 0), 0);
    const net = income - costOfSales - planned;
    balance += net;
    rows.push({ month: ym, label: MONTH_LABELS[monthIndex] + ' ' + ym.slice(2, 4), income, costOfSales, expenses: planned, net, balance });
  }

  const minRow = rows.reduce((a, r) => (r.balance < a.balance ? r : a), rows[0]);
  return {
    rows,
    finalBalance: rows[rows.length - 1].balance,
    minBalance: minRow.balance,
    minMonth: minRow.label,
    negativeMonths: rows.filter((r) => r.balance < 0).map((r) => r.label),
    totalIncome: rows.reduce((a, r) => a + r.income, 0),
    totalExpenses: rows.reduce((a, r) => a + r.expenses + r.costOfSales, 0),
  };
}

/**
 * body: {
 *   startMonth: 'yyyy-MM', months: 12, startingBalance,
 *   baseline: [12 ventas por mes calendario (Ene..Dic)], growth: 0.05, costOfSalesPct: 0.45,
 *   expenses: [{ concept, category, amount, type: 'monthly'|'once', month, months? }],
 *   incomes:  [{ concept, amount, type, month, months? }]
 * }
 */
export function planForecast(body) {
  const growth = Number(body.growth) || 0;
  const spread = typeof body.scenarioSpread === 'number' ? body.scenarioSpread : 0.1;
  const base = simulate(body, growth);
  const scenario = (g) => {
    const r = simulate(body, g);
    return { growth: round2(g), finalBalance: r.finalBalance, minBalance: r.minBalance, viable: r.minBalance >= 0 };
  };

  // Crecimiento mínimo necesario para no quedar en negativo ningún mes (búsqueda binaria entre -90% y +300%)
  let lo = -0.9;
  let hi = 3;
  let breakEvenGrowth = null;
  if (simulate(body, hi).minBalance >= 0) {
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (simulate(body, mid).minBalance >= 0) hi = mid;
      else lo = mid;
    }
    breakEvenGrowth = round2(hi);
  }

  const viable = base.minBalance >= 0;
  return {
    ...base,
    growth,
    viable,
    breakEvenGrowth,
    scenarios: {
      pessimistic: scenario(growth - spread),
      base: scenario(growth),
      optimistic: scenario(growth + spread),
    },
    verdict: viable
      ? 'El plan resulta: la caja nunca queda en negativo y cierra en ' + base.finalBalance + ' MXN.'
      : 'El plan no resulta: la caja queda en negativo en ' + base.negativeMonths.join(', ') + ' (punto más bajo: ' + base.minMonth + ').',
  };
}

// ─── Finanzas: reporte histórico ──────────────────────────────

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
// Estacionalidad de ejemplo (mayo y septiembre bajos). Se reemplaza por datos reales de pedidos.
const SEASONALITY = [0.92, 0.96, 1.04, 1.0, 0.68, 0.98, 1.02, 1.08, 0.71, 1.1, 1.24, 1.38];
const CATEGORY_SHARE = [
  { slug: 'gran-formato', name: 'Gran Formato', share: 0.44 },
  { slug: 'pequeno-formato', name: 'Pequeño Formato', share: 0.21 },
  { slug: 'publicidad-eventos', name: 'Publicidad y Eventos', share: 0.22 },
  { slug: 'promocionales', name: 'Promocionales', share: 0.13 },
];

/**
 * body: { year } → reporte con ingresos por mes, por categoría, KPIs y hallazgos.
 * Hoy genera datos de ejemplo; al conectar Firestore en n8n, se calcula desde los pedidos reales.
 */
export function financeReport(body) {
  const year = Number(body.year) || new Date().getFullYear();
  const base = 118000;
  // Variación pseudoaleatoria estable por año y mes, para que el ejemplo no cambie en cada consulta
  const jitter = (m) => 1 + (((year * 31 + m * 17) % 11) - 5) / 100;

  const monthly = MONTHS.map((label, m) => {
    const revenue = Math.round(base * SEASONALITY[m] * jitter(m));
    return { month: year + '-' + pad(m + 1), label, revenue, orders: Math.round(revenue / 2350) };
  });

  const revenueTotal = monthly.reduce((a, m) => a + m.revenue, 0);
  const ordersTotal = monthly.reduce((a, m) => a + m.orders, 0);
  const avg = revenueTotal / 12;
  const sorted = monthly.slice().sort((a, b) => a.revenue - b.revenue);
  const lows = monthly.filter((m) => m.revenue < avg * 0.8);

  return {
    year,
    currency: 'MXN',
    isSample: true,
    monthly,
    byCategory: CATEGORY_SHARE.map((c) => ({ slug: c.slug, name: c.name, revenue: Math.round(revenueTotal * c.share) })),
    kpis: {
      revenue: revenueTotal,
      orders: ordersTotal,
      avgTicket: Math.round(revenueTotal / ordersTotal),
      monthlyAverage: Math.round(avg),
      bestMonth: sorted[sorted.length - 1].label,
      worstMonth: sorted[0].label,
    },
    insights: lows.map(
      (m) => m.label + ' vendió ' + Math.round((1 - m.revenue / avg) * 100) + '% menos que el promedio mensual: conviene preparar una promoción desde el mes anterior.'
    ),
  };
}
