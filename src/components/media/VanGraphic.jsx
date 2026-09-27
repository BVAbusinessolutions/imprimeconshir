import { useId } from 'react';
import { VAN_BODY_PATH } from './vanGeometry';

const Wheel = ({ cx }) => (
  <g>
    <circle cx={cx} cy={390} r={50} fill="var(--color-paper)" />
    <circle cx={cx} cy={390} r={42} fill="#1f1f1f" />
    <circle cx={cx} cy={390} r={18} fill="#8a8a85" />
  </g>
);

/**
 * Van en vista lateral, como grupo SVG para componer escenas.
 * - `wrapped`: muestra una rotulación de ejemplo (para el "después").
 * - `children`: capas extra dibujadas sobre la carrocería (p. ej. el logo del cliente).
 */
const VanGraphic = ({ wrapped = false, bodyFill = '#f4f4f1', children }) => {
  const clipId = `van-clip-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <g>
      <ellipse cx={420} cy={438} rx={320} ry={12} fill="#000" opacity={0.08} />
      <clipPath id={clipId}>
        <path d={VAN_BODY_PATH} />
      </clipPath>

      <path d={VAN_BODY_PATH} fill={bodyFill} stroke="#0000001f" strokeWidth={2} />

      {wrapped && (
        <g clipPath={`url(#${clipId})`}>
          <path d="M150,300 C320,250 470,330 700,210 L700,400 L150,400 Z" fill="#161616" />
          <path d="M150,330 C330,280 480,350 700,245 L700,262 C480,368 330,300 150,348 Z" fill="var(--color-accent)" />
          <text
            x={200}
            y={215}
            fontFamily="Archivo, sans-serif"
            fontWeight={900}
            fontSize={54}
            fill="#161616"
            letterSpacing={-1}
          >
            TU MARCA
          </text>
          <text x={202} y={252} fontFamily="Instrument Sans, sans-serif" fontSize={20} fill="#5c5c57">
            Rotulación integral · Vinil impreso
          </text>
        </g>
      )}

      {children}

      {/* Cabina */}
      <path d="M578,146 L600,146 L648,232 L578,232 Z" fill="#2a2a2a" opacity={0.88} />
      <line x1={568} y1={138} x2={568} y2={386} stroke="#00000024" strokeWidth={2} />
      <rect x={662} y={352} width={34} height={20} rx={6} fill="#2a2a2a" />
      <rect x={672} y={268} width={16} height={12} rx={3} fill="#e7e2c8" />

      <Wheel cx={258} />
      <Wheel cx={592} />
    </g>
  );
};

export default VanGraphic;
