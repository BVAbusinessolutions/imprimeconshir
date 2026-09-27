import DOMPurify from 'dompurify';

/**
 * Sanitiza una cadena de texto HTML para prevenir ataques XSS (Cross-Site Scripting).
 * @param {string} dirtyHtml - El HTML potencialmente inseguro.
 * @returns {string} - HTML limpio y seguro para inyectar en el DOM.
 */
export const sanitizeHtml = (dirtyHtml) => {
  if (!dirtyHtml) return '';
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
};
