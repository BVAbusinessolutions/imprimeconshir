import { Link } from 'react-router-dom';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[background-color,color,border-color,box-shadow,transform] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

const variants = {
  // Naranja: exclusivo para llamadas a la acción
  cta: 'bg-accent text-white shadow-[0_8px_24px_-10px_rgb(217_72_15/0.7)] hover:bg-accent-hover',
  outline: 'border border-ink/15 bg-surface text-ink hover:border-ink/40',
  ghost: 'text-ink hover:bg-ink/5',
};

const sizes = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[15px]',
  lg: 'h-14 px-8 text-base',
};

/**
 * Botón reutilizable. Con `to` se renderiza como Link de React Router.
 */
const Button = ({ to, variant = 'cta', size = 'md', className = '', children, ...props }) => {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
