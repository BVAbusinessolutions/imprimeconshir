import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { addMonths, format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminHeader, Badge, ConfirmButton, EmptyState, ErrorNote, Panel, StatTile } from '../../components/admin/AdminUI';
import Button from '../../components/ui/Button';
import { createItem, deleteItem, listAll, updateItem } from '../../services/adminService';
import { fetchFinanceReport, n8nErrorMessage } from '../../services/n8n';
import { planForecast } from '../../services/n8n/logic';
import { SERIES, VIZ } from '../../data/vizPalette';
import { formatCurrency } from '../../utils/helpers';

const CATEGORIES = ['Nómina', 'Renta', 'Servicios', 'Material', 'Publicidad', 'Equipo', 'Mantenimiento', 'Impuestos', 'Otro'];
const PRESETS = [
  { concept: 'Renta del local', category: 'Renta', amount: 18000, type: 'monthly' },
  { concept: 'Nómina', category: 'Nómina', amount: 45000, type: 'monthly' },
  { concept: 'Luz, agua e internet', category: 'Servicios', amount: 4500, type: 'monthly' },
  { concept: 'Publicidad en redes', category: 'Publicidad', amount: 6000, type: 'monthly' },
  { concept: 'Plotter nuevo', category: 'Equipo', amount: 180000, type: 'once' },
];

const nextMonth = () => format(addMonths(new Date(), 1), 'yyyy-MM');
const money = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
const compact = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', notation: 'compact', maximumFractionDigits: 1 }).format(n);
const pct = (n) => `${n > 0 ? '+' : ''}${Math.round(n * 100)}%`;

const newPlan = () => ({
  name: 'Plan sin nombre',
  startMonth: nextMonth(),
  months: 12,
  startingBalance: 50000,
  growth: 0,
  costOfSalesPct: 0.45,
  expenses: [],
  incomes: [],
});

// ─── Tabla editable de movimientos (gastos o ingresos extra) ──

const inputClass = 'w-full rounded-lg border border-line bg-paper px-2 py-1.5 text-sm focus:border-ink focus:outline-none';

const LinesEditor = ({ title, rows, onChange, withCategory, startMonth, emptyText }) => {
  const update = (id, patch) => onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const add = (preset = {}) =>
    onChange([...rows, { id: uuidv4(), concept: '', category: 'Otro', amount: 0, type: 'monthly', month: startMonth, months: '', ...preset }]);

  return (
    <Panel
      title={title}
      actions={
        <Button size="sm" variant="outline" onClick={() => add()}>
          Agregar
        </Button>
      }
    >
      {withCategory && (
        <div className="mb-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.concept}
              type="button"
              onClick={() => add({ ...p, month: startMonth })}
              className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium hover:border-ink/40"
            >
              + {p.concept}
            </button>
          ))}
        </div>
      )}
      {rows.length === 0 ? (
        <EmptyState>{emptyText}</EmptyState>
      ) : (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th scope="col" className="px-2 py-1.5 font-medium">Concepto</th>
                {withCategory && <th scope="col" className="px-2 py-1.5 font-medium">Categoría</th>}
                <th scope="col" className="px-2 py-1.5 font-medium">Monto</th>
                <th scope="col" className="px-2 py-1.5 font-medium">Frecuencia</th>
                <th scope="col" className="px-2 py-1.5 font-medium">Desde</th>
                <th scope="col" className="px-2 py-1.5 font-medium">Meses</th>
                <th scope="col"><span className="sr-only">Quitar</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-2 py-1">
                    <input aria-label="Concepto" className={inputClass} value={r.concept} onChange={(e) => update(r.id, { concept: e.target.value })} />
                  </td>
                  {withCategory && (
                    <td className="px-2 py-1">
                      <select aria-label="Categoría" className={inputClass} value={r.category} onChange={(e) => update(r.id, { category: e.target.value })}>
                        {CATEGORIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </td>
                  )}
                  <td className="px-2 py-1">
                    <input
                      aria-label="Monto"
                      type="number"
                      min="0"
                      className={`${inputClass} tabular-nums`}
                      value={r.amount}
                      onChange={(e) => update(r.id, { amount: Number(e.target.value) })}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <select aria-label="Frecuencia" className={inputClass} value={r.type} onChange={(e) => update(r.id, { type: e.target.value })}>
                      <option value="monthly">Mensual</option>
                      <option value="once">Una vez</option>
                    </select>
                  </td>
                  <td className="px-2 py-1">
                    <input aria-label="Mes de inicio" type="month" className={inputClass} value={r.month} onChange={(e) => update(r.id, { month: e.target.value })} />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      aria-label="Duración en meses"
                      type="number"
                      min="1"
                      placeholder="∞"
                      disabled={r.type === 'once'}
                      className={`${inputClass} w-20 tabular-nums`}
                      value={r.months}
                      onChange={(e) => update(r.id, { months: e.target.value ? Number(e.target.value) : '' })}
                    />
                  </td>
                  <td className="px-2 py-1 text-right">
                    <button type="button" onClick={() => onChange(rows.filter((x) => x.id !== r.id))} className="text-muted hover:text-ink">
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
};

// ─── Gráficas ─────────────────────────────────────────────────

const TooltipBox = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 tabular-nums">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
          {p.name}: {money(p.value)}
        </p>
      ))}
    </div>
  );
};

/** Leyenda con texto en tinta normal; el color solo va en la muestra. */
const SeriesLegend = ({ payload = [] }) => (
  <ul className="mt-2 flex justify-center gap-5 text-xs">
    {[...payload]
      .sort((a, b) => (a.dataKey === 'ingresos' ? -1 : b.dataKey === 'ingresos' ? 1 : 0))
      .map((p) => (
        <li key={p.dataKey} className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
          {p.value}
        </li>
      ))}
  </ul>
);

const axisProps = { tickLine: false, axisLine: false, tick: { fill: VIZ.axis, fontSize: 11 } };

const BalanceChart = ({ rows }) => (
  <div className="h-64" role="img" aria-label="Saldo de caja proyectado por mes">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={rows} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke={VIZ.grid} />
        <XAxis dataKey="label" interval="preserveStartEnd" {...axisProps} />
        {/* El eje siempre incluye /usr/bin/bash: es la línea que decide si el plan resulta */}
        <YAxis
          tickFormatter={compact}
          width={64}
          domain={[(min) => Math.min(0, min), (max) => Math.max(0, max)]}
          {...axisProps}
        />
        <Tooltip content={<TooltipBox />} cursor={{ stroke: VIZ.muted, strokeDasharray: '3 3' }} />
        <ReferenceLine y={0} stroke={VIZ.text} strokeWidth={1} label={{ value: '$0', position: 'insideBottomLeft', fill: VIZ.muted, fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="balance"
          name="Saldo"
          stroke={SERIES[0]}
          strokeWidth={2}
          dot={{ r: 4, fill: SERIES[0], stroke: VIZ.surface, strokeWidth: 2 }}
          activeDot={{ r: 6, stroke: VIZ.surface, strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const FlowChart = ({ rows }) => {
  const data = rows.map((r) => ({ label: r.label, ingresos: r.income, gastos: r.expenses + r.costOfSales }));
  return (
    <div className="h-64" role="img" aria-label="Ingresos y gastos proyectados por mes">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: 0 }} barGap={2} barCategoryGap="24%">
          <CartesianGrid vertical={false} stroke={VIZ.grid} />
          <XAxis dataKey="label" interval="preserveStartEnd" {...axisProps} />
          <YAxis tickFormatter={compact} width={64} {...axisProps} />
          <Tooltip content={<TooltipBox />} cursor={{ fill: 'rgb(22 22 22 / 0.05)' }} />
          <Legend content={<SeriesLegend />} />
          <Bar dataKey="ingresos" name="Ingresos" fill={SERIES[0]} radius={[4, 4, 0, 0]} maxBarSize={22} />
          <Bar dataKey="gastos" name="Gastos (incl. material)" fill={SERIES[1]} radius={[4, 4, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ─── Gastos reales vs plan ────────────────────────────────────

const RealVsPlan = ({ rows }) => {
  const qc = useQueryClient();
  const expenses = useQuery({ queryKey: ['admin', 'expenses'], queryFn: () => listAll('expenses') });
  const [draft, setDraft] = useState({ date: format(new Date(), 'yyyy-MM-dd'), concept: '', category: 'Otro', amount: '' });

  const add = async () => {
    if (!draft.concept.trim() || !(Number(draft.amount) > 0)) return toast.info('Escribe concepto y monto.');
    try {
      await createItem('expenses', { ...draft, amount: Number(draft.amount) });
      setDraft((d) => ({ ...d, concept: '', amount: '' }));
      qc.invalidateQueries({ queryKey: ['admin', 'expenses'] });
    } catch {
      toast.error('No se pudo registrar el gasto.');
    }
  };

  const realByMonth = (expenses.data ?? []).reduce((acc, e) => {
    const m = String(e.date).slice(0, 7);
    acc[m] = (acc[m] ?? 0) + (Number(e.amount) || 0);
    return acc;
  }, {});
  const compared = rows.filter((r) => realByMonth[r.month] != null);

  return (
    <Panel title="Gastos reales vs plan">
      <div className="grid gap-2 sm:grid-cols-[auto_1fr_auto_auto_auto]">
        <input aria-label="Fecha" type="date" className={inputClass} value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
        <input aria-label="Concepto" placeholder="Concepto" className={inputClass} value={draft.concept} onChange={(e) => setDraft({ ...draft, concept: e.target.value })} />
        <select aria-label="Categoría" className={inputClass} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          aria-label="Monto"
          type="number"
          min="0"
          placeholder="Monto"
          className={`${inputClass} w-32 tabular-nums`}
          value={draft.amount}
          onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
        />
        <Button size="sm" onClick={add}>
          Registrar
        </Button>
      </div>

      {compared.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Registra gastos reales de los meses del plan para ver si vas por buen camino.</p>
      ) : (
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-xs text-muted">
            <tr>
              <th scope="col" className="py-1.5 font-medium">Mes</th>
              <th scope="col" className="py-1.5 text-right font-medium">Plan</th>
              <th scope="col" className="py-1.5 text-right font-medium">Real</th>
              <th scope="col" className="py-1.5 text-right font-medium">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {compared.map((r) => {
              const real = realByMonth[r.month];
              const diff = real - r.expenses;
              return (
                <tr key={r.month} className="border-t border-line">
                  <th scope="row" className="py-1.5 text-left font-normal">{r.label}</th>
                  <td className="py-1.5 text-right tabular-nums">{money(r.expenses)}</td>
                  <td className="py-1.5 text-right tabular-nums">{money(real)}</td>
                  <td className="py-1.5 text-right tabular-nums">
                    {diff > 0 ? `+${money(diff)} sobre el plan` : diff < 0 ? `${money(-diff)} de ahorro` : 'En plan'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {expenses.data?.length > 0 && (
        <ul className="mt-4 max-h-48 space-y-1 overflow-y-auto border-t border-line pt-3 text-sm">
          {expenses.data.slice(0, 30).map((e) => (
            <li key={e.id} className="flex justify-between gap-3">
              <span className="truncate">
                <span className="tabular-nums text-muted">{e.date}</span> · {e.concept} <span className="text-muted">({e.category})</span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="tabular-nums">{money(e.amount)}</span>
                <ConfirmButton label="Quitar" confirmLabel="Sí" onConfirm={() => deleteItem('expenses', e.id).then(() => qc.invalidateQueries({ queryKey: ['admin', 'expenses'] }))} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
};

// ─── Página ───────────────────────────────────────────────────

const Planning = () => {
  const qc = useQueryClient();
  const [plan, setPlan] = useState(newPlan);
  const [planId, setPlanId] = useState(null);
  const [asTable, setAsTable] = useState(false);
  const plans = useQuery({ queryKey: ['admin', 'plans'], queryFn: () => listAll('plans') });

  // Base de ventas: el año anterior del reporte de Finanzas (Ene..Dic)
  const lastYear = new Date().getFullYear() - 1;
  const history = useQuery({ queryKey: ['admin', 'finance', lastYear], queryFn: () => fetchFinanceReport({ year: lastYear }), staleTime: 5 * 60 * 1000 });
  const baseline = useMemo(() => history.data?.monthly?.map((m) => m.revenue) ?? new Array(12).fill(0), [history.data]);

  const result = useMemo(() => planForecast({ ...plan, baseline }), [plan, baseline]);
  const set = (patch) => setPlan((p) => ({ ...p, ...patch }));

  const save = async () => {
    try {
      if (planId) await updateItem('plans', planId, plan);
      else setPlanId((await createItem('plans', plan)).id);
      qc.invalidateQueries({ queryKey: ['admin', 'plans'] });
      toast.success('Plan guardado.');
    } catch {
      toast.error('No se pudo guardar el plan.');
    }
  };

  const load = (id) => {
    if (!id) {
      setPlan(newPlan());
      setPlanId(null);
      return;
    }
    const p = plans.data?.find((x) => x.id === id);
    if (p) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...data } = p;
      setPlan({ ...newPlan(), ...data });
      setPlanId(id);
    }
  };

  const s = result.scenarios;

  return (
    <>
      <AdminHeader
        title="Planeación"
        description="Planea gastos e ingresos a futuro y comprueba si la caja aguanta antes de comprometerte."
        actions={
          <>
            <select
              aria-label="Planes guardados"
              value={planId ?? ''}
              onChange={(e) => load(e.target.value)}
              className="rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:border-ink focus:outline-none"
            >
              <option value="">Nuevo plan</option>
              {plans.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Button size="sm" onClick={save}>
              Guardar plan
            </Button>
          </>
        }
      />

      {history.isError && (
        <div className="mb-6">
          <ErrorNote>Sin ventas base del año pasado: {n8nErrorMessage(history.error)} La proyección usa /usr/bin/bash de ventas.</ErrorNote>
        </div>
      )}
      {history.data?.isSample && (
        <p className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted">
          <Badge tone="warning">Base de ejemplo</Badge>
          Las ventas base salen del reporte de {lastYear}, que aún usa datos de ejemplo.
        </p>
      )}

      <div className="space-y-6">
        <Panel title="Supuestos">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-medium">
              Nombre del plan
              <input className={`${inputClass} mt-1.5 py-2`} value={plan.name} onChange={(e) => set({ name: e.target.value })} />
            </label>
            <label className="text-sm font-medium">
              Empieza en
              <input type="month" className={`${inputClass} mt-1.5 py-2`} value={plan.startMonth} onChange={(e) => set({ startMonth: e.target.value })} />
            </label>
            <label className="text-sm font-medium">
              Horizonte
              <select className={`${inputClass} mt-1.5 py-2`} value={plan.months} onChange={(e) => set({ months: Number(e.target.value) })}>
                {[6, 12, 18, 24].map((m) => (
                  <option key={m} value={m}>
                    {m} meses
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Dinero disponible hoy
              <input
                type="number"
                className={`${inputClass} mt-1.5 py-2 tabular-nums`}
                value={plan.startingBalance}
                onChange={(e) => set({ startingBalance: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm font-medium">
              <span className="flex justify-between">
                Crecimiento de ventas <span className="tabular-nums">{pct(plan.growth)}</span>
              </span>
              <input
                type="range"
                min="-0.5"
                max="1"
                step="0.01"
                value={plan.growth}
                onChange={(e) => set({ growth: Number(e.target.value) })}
                className="mt-3 w-full accent-accent"
              />
            </label>
            <label className="text-sm font-medium">
              <span className="flex justify-between">
                Costo de material <span className="tabular-nums">{Math.round(plan.costOfSalesPct * 100)}% de la venta</span>
              </span>
              <input
                type="range"
                min="0"
                max="0.9"
                step="0.01"
                value={plan.costOfSalesPct}
                onChange={(e) => set({ costOfSalesPct: Number(e.target.value) })}
                className="mt-3 w-full accent-accent"
              />
            </label>
          </div>
        </Panel>

        <LinesEditor
          title="Gastos planeados"
          rows={plan.expenses}
          withCategory
          startMonth={plan.startMonth}
          onChange={(expenses) => set({ expenses })}
          emptyText="Agrega renta, nómina, compras de equipo… o usa los atajos."
        />
        <LinesEditor
          title="Ingresos extra planeados"
          rows={plan.incomes}
          startMonth={plan.startMonth}
          onChange={(incomes) => set({ incomes })}
          emptyText="Contratos o proyectos grandes que ya esperas, aparte de las ventas normales."
        />

        {/* Veredicto */}
        <section
          aria-live="polite"
          className={`rounded-3xl p-6 ${result.viable ? 'bg-ink text-white' : 'border-2 border-accent bg-surface'}`}
        >
          <p className={`text-xs font-semibold tracking-[0.2em] uppercase ${result.viable ? 'text-white/70' : 'text-accent'}`}>
            {result.viable ? 'Resulta' : 'No resulta'}
          </p>
          <p className="mt-2 text-xl font-bold">
            {result.viable
              ? `La caja nunca queda en negativo y cierra en ${money(result.finalBalance)}.`
              : `La caja queda en negativo en ${result.negativeMonths.length} mes(es); el punto más bajo es ${result.minMonth} (${money(result.minBalance)}).`}
          </p>
          <p className={`mt-2 text-sm ${result.viable ? 'text-white/70' : 'text-muted'}`}>
            {result.breakEvenGrowth == null
              ? 'Ni con un crecimiento de 300% se cubre: hay que recortar o aplazar gastos.'
              : result.viable
                ? result.breakEvenGrowth < 0
                  ? `Margen de seguridad: aguanta una caída de ventas de hasta ${Math.round(-result.breakEvenGrowth * 100)}%.`
                  : `Resulta con el crecimiento planeado; con menos de ${pct(result.breakEvenGrowth)} ya no alcanzaría.`
                : `Necesitas que las ventas crezcan al menos ${pct(result.breakEvenGrowth)}, o recortar gastos.`}
          </p>
        </section>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Saldo final" value={compact(result.finalBalance)} />
          <StatTile label="Punto más bajo" value={compact(result.minBalance)} hint={result.minMonth} />
          <StatTile label="Ingresos del periodo" value={compact(result.totalIncome)} />
          <StatTile label="Gastos del periodo" value={compact(result.totalExpenses)} hint="Incluye material" />
        </div>

        <Panel title="Escenarios">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Pesimista', s.pessimistic],
              ['Base', s.base],
              ['Optimista', s.optimistic],
            ].map(([label, sc]) => (
              <div key={label} className="rounded-2xl bg-paper p-4">
                <p className="text-sm text-muted">
                  {label} · ventas {pct(sc.growth)}
                </p>
                <p className="font-display mt-1 text-2xl font-extrabold tabular-nums">{compact(sc.finalBalance)}</p>
                <p className="mt-1 text-sm font-semibold">{sc.viable ? 'Resulta' : 'No resulta'}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Proyección mes a mes"
          actions={
            <button
              type="button"
              aria-pressed={asTable}
              onClick={() => setAsTable((v) => !v)}
              className="rounded-xl border border-line bg-paper px-3 py-1.5 text-sm font-medium hover:border-ink/40"
            >
              {asTable ? 'Ver gráficas' : 'Ver como tabla'}
            </button>
          }
        >
          {asTable ? (
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr>
                    {['Mes', 'Ingresos', 'Material', 'Gastos', 'Neto', 'Saldo'].map((h) => (
                      <th key={h} scope="col" className={`px-2 py-1.5 font-medium ${h !== 'Mes' ? 'text-right' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r) => (
                    <tr key={r.month} className="border-t border-line">
                      <th scope="row" className="px-2 py-1.5 text-left font-normal">{r.label}</th>
                      <td className="px-2 py-1.5 text-right tabular-nums">{formatCurrency(r.income)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{formatCurrency(r.costOfSales)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{formatCurrency(r.expenses)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{formatCurrency(r.net)}</td>
                      <td className={`px-2 py-1.5 text-right font-semibold tabular-nums ${r.balance < 0 ? 'text-accent' : ''}`}>
                        {formatCurrency(r.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-8">
              <div>
                <p className="mb-2 text-sm font-semibold">Saldo de caja</p>
                <BalanceChart rows={result.rows} />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Ingresos y gastos</p>
                <FlowChart rows={result.rows} />
              </div>
            </div>
          )}
        </Panel>

        <RealVsPlan rows={result.rows} />

        {planId && (
          <div className="text-right">
            <ConfirmButton
              label="Eliminar este plan"
              onConfirm={async () => {
                await deleteItem('plans', planId);
                load('');
                qc.invalidateQueries({ queryKey: ['admin', 'plans'] });
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Planning;
