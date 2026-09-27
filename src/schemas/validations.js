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
