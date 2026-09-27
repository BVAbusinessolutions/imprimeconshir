import { formatCurrency } from '../../utils/helpers';

/**
 * Resumen de una pre-cotización devuelta por n8n.
 */
const QuoteCard = ({ quote, compact = false }) => {
  if (!quote?.total) return null;

  return (
    <div className={`rounded-2xl border border-line bg-surface ${compact ? 'p-4' : 'p-6 sm:p-8'}`}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">Pre-cotización</p>
        {quote.quoteId && <p className="text-xs text-muted tabular-nums">{quote.quoteId}</p>}
      </div>

      <dl className={`space-y-2 ${compact ? 'mt-3 text-sm' : 'mt-6'}`}>
        {quote.items?.map((item) => (
          <div key={item.concept} className="flex justify-between gap-4">
            <dt className="text-muted">{item.concept}</dt>
            <dd className="tabular-nums">{formatCurrency(item.amount)}</dd>
          </div>
        ))}
        {quote.tax > 0 && (
          <div className="flex justify-between gap-4 border-t border-line pt-2">
            <dt className="text-muted">IVA</dt>
            <dd className="tabular-nums">{formatCurrency(quote.tax)}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-ink/10 pt-4">
        <span className="font-semibold">Total estimado</span>
        <span className={`font-display font-extrabold tabular-nums ${compact ? 'text-xl' : 'text-3xl'}`}>
          {formatCurrency(quote.total)}
        </span>
      </div>

      <p className="mt-3 text-xs text-muted">
        Precio preliminar{quote.validUntil && `, válido hasta el ${quote.validUntil}`}. Un asesor te confirma el precio final
        en minutos.
      </p>
    </div>
  );
};

export default QuoteCard;
