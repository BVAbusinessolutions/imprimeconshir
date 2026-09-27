import { useState } from 'react';

/**
 * Comparador "Antes / Después" para mostrar rotulaciones.
 * `before` y `after` aceptan cualquier nodo (una <img> o un SVG).
 * Usa un <input type="range"> invisible encima, así funciona con mouse, touch y teclado.
 */
const BeforeAfterSlider = ({
  before,
  after,
  label = 'Comparar antes y después',
  initial = 50,
  className = '',
}) => {
  const [position, setPosition] = useState(initial);

  return (
    <div className={`relative isolate overflow-hidden rounded-3xl bg-surface select-none ${className}`}>
      {/* Después (capa completa) */}
      <div className="absolute inset-0">{after}</div>

      {/* Antes (recortado según la posición) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        aria-hidden="true"
      >
        {before}
      </div>

      <span className="pointer-events-none absolute top-4 left-4 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur">
        Antes
      </span>
      <span className="pointer-events-none absolute top-4 right-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold tracking-wide text-ink backdrop-blur">
        Después
      </span>

      {/* Divisor */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.08)]"
        style={{ left: `${position}%` }}
      >
        <span className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[11px] font-bold tracking-widest text-ink shadow-lg">
          ‹ ›
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label={label}
        aria-valuetext={`${Math.round(position)}% antes`}
        className="peer absolute inset-0 z-10 h-full w-full cursor-ew-resize appearance-none opacity-0"
      />
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-accent ring-offset-2 peer-focus-visible:ring-2" />
    </div>
  );
};

export default BeforeAfterSlider;
