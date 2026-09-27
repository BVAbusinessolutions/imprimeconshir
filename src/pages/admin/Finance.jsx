import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminHeader, Badge, ErrorNote, LoadingBlock, Panel, StatTile } from '../../components/admin/AdminUI';
import { fetchFinanceReport } from '../../services/n8n';
import { CATEGORY_COLORS, SERIES, VIZ } from '../../data/vizPalette';
import { formatCurrency } from '../../utils/helpers';

const compactMoney = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', notation: 'compact', maximumFractionDigits: 1 }).format(n);

const wholeMoney = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

const TooltipBox = ({ children }) => (
  <div className="rounded-xl border border-line bg-white px-3 py-2 text-sm shadow-lg">{children}</div>
);

const MonthTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const m = payload[0].payload;
  return (
    <TooltipBox>
      <p className="font-semibold">{m.label}</p>
      <p className="tabular-nums">{formatCurrency(m.revenue)}</p>
      <p className="text-muted tabular-nums">{m.orders} pedidos</p>
    </TooltipBox>
  );
};

const CategoryTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null;
  const c = payload[0].payload;
  return (
    <TooltipBox>
      <p className="font-semibold">{c.name}</p>
      <p className="tabular-nums">
        {formatCurrency(c.revenue)} · {Math.round((c.revenue / total) * 100)}%
      </p>
    </TooltipBox>
  );
};

/** Etiqueta directa solo en los meses bajos (selectiva: no un número en cada barra). */
const LowMonthLabel = ({ x, y, width, index, lows }) => {
  const low = lows[index];
  if (!low) return null;
  return (
    <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize={12} fontWeight={600} fill={VIZ.text}>
      −{low}%
    </text>
  );
};

const MonthlyChart = ({ monthly, average }) => {
  // En pantallas angostas, solo la inicial del mes para que quepan los 12
  const narrow = typeof window !== 'undefined' && window.innerWidth < 640;
  // Porcentaje bajo el promedio para los meses débiles (< 80% del promedio)
  const lows = monthly.map((m) => (m.revenue < average * 0.8 ? Math.round((1 - m.revenue / average) * 100) : null));

  return (
    <div className="h-72" role="img" aria-label="Ingresos por mes; los meses marcados vendieron bastante menos que el promedio">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthly} margin={{ top: 24, right: 64, bottom: 0, left: 0 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke={VIZ.grid} />
          <XAxis
            dataKey="label"
            interval={0}
            tickFormatter={(label) => (narrow ? label.slice(0, 1) : label)}
            tickLine={false}
            axisLine={false}
            tick={{ fill: VIZ.axis, fontSize: 11 }}
          />
          <YAxis
            tickFormatter={compactMoney}
            tickLine={false}
            axisLine={false}
            width={64}
            tick={{ fill: VIZ.axis, fontSize: 12 }}
          />
          <Tooltip content={<MonthTooltip />} cursor={{ fill: 'rgb(22 22 22 / 0.05)' }} />
          <ReferenceLine
            y={average}
            stroke={VIZ.muted}
            strokeDasharray="4 4"
            label={{ value: 'Promedio', position: 'right', fill: VIZ.muted, fontSize: 11 }}
          />
          <Bar dataKey="revenue" fill={SERIES[0]} radius={[4, 4, 0, 0]} maxBarSize={36}>
            <LabelList dataKey="revenue" content={(props) => <LowMonthLabel {...props} lows={lows} />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const CategoryChart = ({ categories }) => {
  const total = categories.reduce((a, c) => a + c.revenue, 0);
  return (
    <div className="grid items-center gap-6 sm:grid-cols-[180px_1fr]">
      <div className="h-44" role="img" aria-label="Participación de cada categoría en las ventas">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              dataKey="revenue"
              nameKey="name"
              innerRadius="58%"
              outerRadius="100%"
              stroke={VIZ.surface}
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {categories.map((c) => (
                <Cell key={c.slug} fill={CATEGORY_COLORS[c.slug] ?? VIZ.muted} />
              ))}
            </Pie>
            <Tooltip content={<CategoryTooltip total={total} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Leyenda con etiquetas directas: la identidad nunca depende solo del color */}
      <ul className="space-y-2.5 text-sm">
        {categories.map((c) => (
          <li key={c.slug} className="flex items-center gap-3">
            <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: CATEGORY_COLORS[c.slug] }} />
            <span className="flex-1">{c.name}</span>
            <span className="font-semibold tabular-nums">{Math.round((c.revenue / total) * 100)}%</span>
            <span className="w-24 text-right text-muted tabular-nums">{compactMoney(c.revenue)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const DataTable = ({ report }) => (
  <div className="grid gap-6 lg:grid-cols-2">
    <table className="w-full text-left text-sm">
      <caption className="mb-2 text-left font-semibold">Ingresos por mes</caption>
      <thead className="text-xs text-muted">
        <tr>
          <th scope="col" className="py-1.5 font-medium">Mes</th>
          <th scope="col" className="py-1.5 text-right font-medium">Ingresos</th>
          <th scope="col" className="py-1.5 text-right font-medium">Pedidos</th>
        </tr>
      </thead>
      <tbody>
        {report.monthly.map((m) => (
          <tr key={m.month} className="border-t border-line">
            <th scope="row" className="py-1.5 font-normal">{m.label}</th>
            <td className="py-1.5 text-right tabular-nums">{formatCurrency(m.revenue)}</td>
            <td className="py-1.5 text-right tabular-nums">{m.orders}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <table className="w-full self-start text-left text-sm">
      <caption className="mb-2 text-left font-semibold">Ingresos por categoría</caption>
      <tbody>
        {report.byCategory.map((c) => (
          <tr key={c.slug} className="border-t border-line">
            <th scope="row" className="py-1.5 font-normal">{c.name}</th>
            <td className="py-1.5 text-right tabular-nums">{formatCurrency(c.revenue)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Finance = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [asTable, setAsTable] = useState(false);
  const report = useQuery({ queryKey: ['admin', 'finance', year], queryFn: () => fetchFinanceReport({ year }), staleTime: 5 * 60 * 1000 });
  const r = report.data;

  return (
    <>
      <AdminHeader
        title="Finanzas"
        description="Ventas históricas por mes y categoría para detectar temporadas bajas y planear promociones."
        actions={
          <>
            <label className="inline-flex items-center gap-2 text-sm">
              <span className="text-muted">Año</span>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="rounded-xl border border-line bg-surface px-3 py-2 focus:border-ink focus:outline-none"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              aria-pressed={asTable}
              onClick={() => setAsTable((v) => !v)}
              className="rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium hover:border-ink/40"
            >
              {asTable ? 'Ver gráficas' : 'Ver como tabla'}
            </button>
          </>
        }
      />

      {report.isLoading && <LoadingBlock className="h-80" />}
      {report.isError && <ErrorNote>No pudimos obtener el reporte de n8n.</ErrorNote>}

      {r && (
        <div className="space-y-6">
          {r.isSample && (
            <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <Badge tone="warning">Datos de ejemplo</Badge>
              Se reemplazan por ventas reales cuando n8n se conecte a Firestore.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile label={`Ingresos ${r.year}`} value={compactMoney(r.kpis.revenue)} />
            <StatTile label="Pedidos" value={r.kpis.orders.toLocaleString('es-MX')} />
            <StatTile label="Ticket promedio" value={wholeMoney(r.kpis.avgTicket)} />
            <StatTile label="Mes más bajo" value={r.kpis.worstMonth} hint={`Mejor mes: ${r.kpis.bestMonth}`} />
          </div>

          {asTable ? (
            <Panel>
              <DataTable report={r} />
            </Panel>
          ) : (
            <div className="grid gap-6">
              <Panel title="Ingresos por mes">
                <MonthlyChart monthly={r.monthly} average={r.kpis.monthlyAverage} />
              </Panel>
              <Panel title="Ventas por categoría">
                <CategoryChart categories={r.byCategory} />
              </Panel>
            </div>
          )}

          {r.insights?.length > 0 && (
            <Panel title="Temporadas bajas">
              <ul className="space-y-2 text-sm">
                {r.insights.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      )}
    </>
  );
};

export default Finance;
