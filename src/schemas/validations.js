import { z } from 'zod';

/** Validación de login */
export const loginSchema = z.object({
  email: z.string().email({ message: 'Email no válido' }),
  password: z.string().min(6, { message: 'Mínimo 6 caracteres' }),
});

/** Validación de registro */
export const registerSchema = z
  .object({
    displayName: z.string().min(2, { message: 'Nombre muy corto' }),
    email: z.string().email({ message: 'Email no válido' }),
    password: z.string().min(8, { message: 'Mínimo 8 caracteres' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

/** Validación de producto (admin) */
export const productSchema = z.object({
  name: z.string().min(3, { message: 'Nombre requerido' }),
  description: z.string().min(10, { message: 'Descripción muy corta' }),
  price: z.coerce.number().positive({ message: 'Precio inválido' }),
  stock: z.coerce.number().int().nonnegative({ message: 'Stock inválido' }),
  category: z.string().min(1, { message: 'Selecciona una categoría' }),
});

/** Validación de checkout */
export const checkoutSchema = z.object({
  fullName: z.string().min(3, { message: 'Nombre completo requerido' }),
  phone: z.string().regex(/^\+?\d{10,15}$/, { message: 'Teléfono inválido' }),
  address: z.string().min(10, { message: 'Dirección demasiado corta' }),
  city: z.string().min(2, { message: 'Ciudad requerida' }),
  notes: z.string().optional(),
});

// Medida opcional: un campo vacío se trata como "sin medida"
const optionalMeasure = (message) =>
  z.preprocess((v) => (v === '' || v == null ? undefined : v), z.coerce.number().positive({ message }).optional());

const phoneField = z.string().regex(/^\+?\d{10,15}$/, { message: 'Teléfono de 10 a 15 dígitos' });

/** Datos de contacto compartidos por cotización y cita */
export const contactSchema = z.object({
  name: z.string().min(2, { message: 'Tu nombre' }),
  email: z.string().email({ message: 'Email no válido' }),
  phone: phoneField,
});

/** Validación del formulario de pre-cotización (se envía a n8n) */
export const quoteSchema = z.object({
  category: z.string().min(1, { message: 'Elige una categoría' }),
  subcategory: z.string().min(1, { message: 'Elige un tipo de trabajo' }),
  width: optionalMeasure('Ancho inválido'),
  height: optionalMeasure('Alto inválido'),
  unit: z.enum(['cm', 'm']),
  quantity: z.coerce.number().int().min(1, { message: 'Mínimo 1' }),
  deadline: z.string().optional(),
  notes: z.string().max(1000, { message: 'Máximo 1000 caracteres' }).optional(),
  contact: contactSchema,
});

/** Validación de la tarjeta para agendar cita técnica */
export const appointmentSchema = z.object({
  slot: z.string().min(1, { message: 'Elige un horario' }),
  address: z.string().min(10, { message: 'Dirección demasiado corta' }),
  contact: contactSchema,
});
