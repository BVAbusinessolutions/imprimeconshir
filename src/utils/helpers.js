import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/** Formatea un precio en pesos mexicanos */
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

/** Formatea una fecha a 'dd MMM yyyy' en español */
export const formatDate = (date) =>
  format(date instanceof Date ? date : date.toDate(), 'dd MMM yyyy', { locale: es });

/** Retorna tiempo relativo (ej. "hace 3 minutos") */
export const timeAgo = (date) =>
  formatDistanceToNow(date instanceof Date ? date : date.toDate(), {
    addSuffix: true,
    locale: es,
  });

/** Trunca un texto al número de caracteres dado */
export const truncate = (text, maxLength = 100) =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

/** Genera el link de WhatsApp con mensaje pre-armado */
export const whatsappLink = (phone, message) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

/** Genera un slug URL-friendly de un string */
export const slugify = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
