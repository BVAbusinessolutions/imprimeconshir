import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from '../brand/Logo';
import Button from '../ui/Button';
import { CATEGORIES } from '../../data/categories';
import { useAuth } from '../../context/AuthContext';
import useCartStore from '../../store/cartStore';

const utilityLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-ink' : 'text-muted hover:text-ink'}`;

const categoryLinkClass = ({ isActive }) =>
  `relative shrink-0 py-3 text-sm font-medium transition-colors ${
    isActive
      ? 'text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent'
      : 'text-muted hover:text-ink'
  }`;

const Navbar = () => {
  const { currentUser, isAdmin } = useAuth();
  const cartCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  // El menú móvil guarda la ruta en la que se abrió; al navegar queda cerrado solo
  const [menuOpenAt, setMenuOpenAt] = useState(null);
  const menuOpen = menuOpenAt === pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const accountLink = currentUser
    ? { to: isAdmin ? '/admin' : '/perfil', label: isAdmin ? 'Panel' : 'Mi cuenta' }
    : { to: '/login', label: 'Entrar' };

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || menuOpen
          ? 'border-line bg-paper/85 backdrop-blur-xl'
          : 'border-transparent bg-paper'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Utilidades" className="hidden items-center gap-7 md:flex">
          <NavLink to="/previsualizar" className={utilityLinkClass}>
            Prueba tu logo
          </NavLink>
          <NavLink to={accountLink.to} className={utilityLinkClass}>
            {accountLink.label}
          </NavLink>
          <NavLink to="/carrito" className={utilityLinkClass}>
            Carrito{cartCount > 0 && <span className="ml-1 tabular-nums text-ink">({cartCount})</span>}
          </NavLink>
          <Button to="/cotizar" size="sm">
            Cotizar
          </Button>
        </nav>

        <button
          type="button"
          className="text-sm font-semibold md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpenAt(menuOpen ? null : pathname)}
        >
          {menuOpen ? 'Cerrar' : 'Menú'}
        </button>
      </div>

      {/* Categorías principales del catálogo */}
      <nav aria-label="Categorías" className="hidden border-t border-line/70 md:block">
        <div className="mx-auto flex max-w-7xl gap-8 overflow-x-auto px-4 sm:px-6 lg:px-8">
          <NavLink to="/catalogo" end className={categoryLinkClass}>
            Todo
          </NavLink>
          {CATEGORIES.map((c) => (
            <NavLink key={c.slug} to={`/catalogo/${c.slug}`} className={categoryLinkClass}>
              {c.fullName}
            </NavLink>
          ))}
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label="Menú principal"
            className="overflow-hidden border-t border-line md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              <p className="pb-2 text-xs font-semibold tracking-[0.18em] text-muted uppercase">
                Catálogo
              </p>
              {CATEGORIES.map((c) => (
                <NavLink
                  key={c.slug}
                  to={`/catalogo/${c.slug}`}
                  className="font-display py-2 text-xl font-bold"
                >
                  {c.fullName}
                </NavLink>
              ))}
              <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
                <NavLink to="/previsualizar" className={utilityLinkClass}>
                  Prueba tu logo
                </NavLink>
                <NavLink to={accountLink.to} className={utilityLinkClass}>
                  {accountLink.label}
                </NavLink>
                <NavLink to="/carrito" className={utilityLinkClass}>
                  Carrito{cartCount > 0 && ` (${cartCount})`}
                </NavLink>
                <Button to="/cotizar" className="mt-2">
                  Cotizar
                </Button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
