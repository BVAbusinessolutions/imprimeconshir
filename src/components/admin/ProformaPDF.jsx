const currencyFormatter = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('es-CR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const asDate = (value) => {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = asDate(value);
  return date ? dateFormatter.format(date) : '—';
};

const money = (value) => currencyFormatter.format(Number(value) || 0);

/** Documento independiente que se puede previsualizar, imprimir o guardar como PDF. */
const ProformaPDF = ({
  proformaNumber,
  date = new Date(),
  validUntil,
  validityDays = 15,
  client = {},
  job = {},
  items = [],
  subtotal,
  iva,
  total,
  onClose,
}) => {
  const computedSubtotal = subtotal ?? items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const computedIva = iva ?? computedSubtotal * 0.13;
  const computedTotal = total ?? computedSubtotal + computedIva;
  const validDate = validUntil ?? new Date(asDate(date)?.getTime() + validityDays * 24 * 60 * 60 * 1000);

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body * { visibility: hidden; }
          #proforma-print, #proforma-print * { visibility: visible; }
          #proforma-print {
            position: absolute;
            inset: 0;
            width: 100%;
            max-width: none;
            margin: 0;
            border: 0;
            box-shadow: none;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <section id="proforma-print" className="mx-auto max-w-4xl bg-white p-5 text-[#242424] shadow-2xl sm:p-10 print:p-0">
        <header className="flex flex-col justify-between gap-8 border-b-2 border-[#242424] pb-7 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-bold tracking-[0.24em] text-[#6a6a66] uppercase">Visión Integral Gráfica</p>
            <p className="mt-1 font-display text-4xl font-black tracking-tight sm:text-5xl">
              IMPRIME <span className="relative inline-block">con<span className="absolute right-0 bottom-0 left-0 h-1 bg-[#d9480f]" /></span>{' '}
              <span className="tracking-[0.08em]">SHIR</span>
            </p>
            <p className="mt-3 text-sm text-[#5c5c57]">Impresión, publicidad y soluciones gráficas.</p>
          </div>
          <div className="rounded-xl border border-[#d8d8d3] bg-[#f8f8f6] px-4 py-3 text-sm sm:min-w-56">
            <p className="text-xs font-bold tracking-[0.15em] text-[#6a6a66] uppercase">Proforma / Cotización</p>
            <p className="mt-1 font-display text-xl font-extrabold">{proformaNumber || 'PRO-—'}</p>
            <dl className="mt-3 space-y-1 text-[#5c5c57]">
              <div className="flex justify-between gap-4"><dt>Fecha</dt><dd className="font-medium text-[#242424]">{formatDate(date)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Vigencia</dt><dd className="font-medium text-[#242424]">{formatDate(validDate)}</dd></div>
            </dl>
          </div>
        </header>

        <div className="mt-8 grid gap-7 sm:grid-cols-2">
          <section>
            <h2 className="text-xs font-bold tracking-[0.16em] text-[#6a6a66] uppercase">Cliente</h2>
            <p className="mt-2 font-semibold">{client.name || 'Cliente por confirmar'}</p>
            {client.company && <p className="text-sm text-[#5c5c57]">{client.company}</p>}
            {client.email && <p className="mt-1 break-all text-sm text-[#5c5c57]">{client.email}</p>}
            {client.phone && <p className="text-sm text-[#5c5c57]">{client.phone}</p>}
          </section>
          <section>
            <h2 className="text-xs font-bold tracking-[0.16em] text-[#6a6a66] uppercase">Detalle del trabajo</h2>
            <p className="mt-2 text-sm leading-relaxed">{job.description || 'Trabajo gráfico e impresión según especificaciones del cliente.'}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-[#5c5c57]">
              {job.materials && <><dt>Materiales</dt><dd className="text-right text-[#242424]">{job.materials}</dd></>}
              {job.printing && <><dt>Impresión</dt><dd className="text-right text-[#242424]">{job.printing}</dd></>}
              {job.finishing && <><dt>Acabado</dt><dd className="text-right text-[#242424]">{job.finishing}</dd></>}
              {job.measurements && <><dt>Medidas</dt><dd className="text-right text-[#242424]">{job.measurements}</dd></>}
              {job.delivery && <><dt>Entrega</dt><dd className="text-right text-[#242424]">{job.delivery}</dd></>}
            </dl>
          </section>
        </div>

        <div className="mt-8 overflow-x-auto border-y border-[#d8d8d3]">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-[#eeeeeb] text-xs tracking-wide text-[#5c5c57] uppercase">
              <tr>
                <th className="px-3 py-3 font-bold">Cantidad</th>
                <th className="px-3 py-3 font-bold">Descripción</th>
                <th className="px-3 py-3 text-right font-bold">Precio unitario</th>
                <th className="px-3 py-3 text-right font-bold">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                return (
                  <tr key={item.id || index} className="border-t border-[#d8d8d3]">
                    <td className="px-3 py-3 tabular-nums">{item.quantity || 0}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{item.description || 'Ítem sin descripción'}</p>
                      {item.detail && <p className="mt-0.5 text-xs text-[#5c5c57]">{item.detail}</p>}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{money(item.unitPrice)}</td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums">{money(lineTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 ml-auto w-full max-w-sm space-y-2 text-sm">
          <div className="flex justify-between border-b border-[#d8d8d3] py-2"><span>Subtotal</span><span className="tabular-nums">{money(computedSubtotal)}</span></div>
          <div className="flex justify-between border-b border-[#d8d8d3] py-2"><span>IVA (13%)</span><span className="tabular-nums">{money(computedIva)}</span></div>
          <div className="flex justify-between bg-[#242424] px-4 py-3 font-display text-lg font-extrabold text-white"><span>Total</span><span className="tabular-nums">{money(computedTotal)}</span></div>
        </div>

        <footer className="mt-10 border-t border-[#d8d8d3] pt-5 text-xs leading-relaxed text-[#5c5c57]">
          <p><strong className="text-[#242424]">Condiciones:</strong> Se requiere un anticipo del 50% para iniciar producción. El saldo se cancela antes de la entrega o instalación.</p>
          <p className="mt-1">Esta oferta es válida por {validityDays} días naturales a partir de su fecha de emisión. Los tiempos de producción comienzan una vez aprobado el arte final y confirmado el anticipo.</p>
        </footer>

        <div className="no-print mt-8 flex flex-col gap-3 border-t border-[#d8d8d3] pt-5 sm:flex-row sm:justify-end">
          {onClose && <button type="button" onClick={onClose} className="rounded-full border border-[#d8d8d3] px-5 py-2.5 text-sm font-semibold hover:border-[#242424]">Volver a pedidos</button>}
          <button type="button" onClick={() => window.print()} className="rounded-full bg-[#d9480f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#b93c0b]">Imprimir / Guardar como PDF</button>
        </div>
      </section>
    </>
  );
};

export default ProformaPDF;
