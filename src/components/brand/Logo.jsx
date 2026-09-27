import { Link } from 'react-router-dom';

const sizes = {
  sm: 'text-lg',
  md: 'text-xl sm:text-2xl',
  lg: 'text-4xl sm:text-5xl',
};

/**
 * Logotipo tipográfico: "IMPRIME con SHIR".
 * SHIR siempre en mayúsculas y "con" subrayado en naranja. Sin iconos.
 */
const Logo = ({ className = '', size = 'md' }) => (
  <Link
    to="/"
    aria-label="IMPRIME con SHIR, ir al inicio"
    className={`font-display inline-flex items-baseline gap-[0.28em] leading-none whitespace-nowrap ${sizes[size]} ${className}`}
  >
    <span className="font-extrabold tracking-tight">IMPRIME</span>
    <span className="font-medium lowercase underline decoration-accent decoration-[0.14em] underline-offset-[0.22em]">
      con
    </span>
    <span className="font-extrabold tracking-tight">SHIR</span>
  </Link>
);

export default Logo;
