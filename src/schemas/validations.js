import { z } from 'zod';

// ─── Consentimientos y facturación (CFDI) ─────────────────────

/** Aceptación obligatoria del aviso de privacidad */
const acceptPrivacy = z.literal(true, { message: 'Debes aceptar el aviso de privacidad' });

// RFC de persona moral (12) o física (13): letras, fecha AAMMDD y homoclave
const RFC_RE = /^([A-ZÑ&]{3,4})(\d{6})([A-Z\d]{3})$/;

/** Datos fiscales para emitir CFDI 4.0 */
export const billingSchema = z.object({
  rfc: z.string().trim().toUpperCase().regex(RFC_RE, { message: 'RFC inválido' }),
  legalName: z.string().trim().min(3, { message: 'Razón social tal como aparece en tu constancia' }),
  taxRegime: z.string().min(3, { message: 'Elige tu régimen fiscal' }),
  cfdiUse: z.string().min(3, { message: 'Elige el uso de CFDI' }),
  zipCode: z.string().regex(/^\d{5}$/, { message: 'Código postal de 5 dígitos' }),
});

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
    acceptPrivacy,
    marketingOptIn: z.boolean().optional(),
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
  wantsInvoice: z.boolean().optional(),
  billing: z.any().optional(),
  acceptPrivacy,
  marketingOptIn: z.boolean().optional(),
}).superRefine((data, ctx) => {
  // Los datos fiscales solo se validan si el cliente pide factura
  if (!data.wantsInvoice) return;
  const result = billingSchema.safeParse(data.billing ?? {});
  if (!result.success) {
    for (const issue of result.error.issues) ctx.addIssue({ ...issue, path: ['billing', ...issue.path] });
  }
});

/** Validación de la tarjeta para agendar cita técnica */
export const appointmentSchema = z.object({
  slot: z.string().min(1, { message: 'Elige un horario' }),
  address: z.string().min(10, { message: 'Dirección demasiado corta' }),
  contact: contactSchema,
});

/** Validación del perfil del cliente (campos editables según firestore.rules) */
export const profileSchema = z
  .object({
    displayName: z.string().min(2, { message: 'Nombre muy corto' }),
    phone: phoneField.or(z.literal('')),
    address: z.string().max(200, { message: 'Máximo 200 caracteres' }).optional(),
    marketingOptIn: z.boolean().optional(),
    hasBilling: z.boolean().optional(),
    billing: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.hasBilling) return;
    const result = billingSchema.safeParse(data.billing ?? {});
    if (!result.success) {
      for (const issue of result.error.issues) ctx.addIssue({ ...issue, path: ['billing', ...issue.path] });
    }
  });

/** Producto del catálogo (panel admin). El precio es "desde" y es opcional: el precio final se cotiza. */
export const adminProductSchema = z.object({
  name: z.string().min(3, { message: 'Nombre requerido' }),
  description: z.string().min(10, { message: 'Descripción muy corta' }).max(1500, { message: 'Máximo 1500 caracteres' }),
  category: z.string().min(1, { message: 'Elige una categoría' }),
  subcategory: z.string().min(1, { message: 'Elige una subcategoría' }),
  price: z.preprocess((v) => (v === '' || v == null ? undefined : v), z.coerce.number().nonnegative({ message: 'Precio inválido' }).optional()),
  featured: z.boolean().optional(),
});

/** Entrega (logística) */
export const deliverySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Fecha inválida' }),
  timeWindow: z.string().optional(),
  customer: z.string().min(2, { message: 'Cliente requerido' }),
  phone: z.string().optional(),
  address: z.string().min(8, { message: 'Dirección requerida' }),
  zone: z.string().min(1, { message: 'Elige una zona' }),
  notes: z.string().max(300).optional(),
});

/** Proveedor (lista de precios de terceros) */
export const supplierSchema = z.object({
  name: z.string().min(2, { message: 'Nombre requerido' }),
  contact: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: 'Email no válido' }).or(z.literal('')).optional(),
});

const nonNegative = (message) => z.coerce.number({ message }).nonnegative({ message });

/** Insumo o servicio de un proveedor (lista de precios; la existencia vive en Inventario) */
export const supplierItemSchema = z.object({
  name: z.string().min(2, { message: 'Nombre requerido' }),
  unit: z.string().min(1, { message: 'Unidad requerida' }),
  cost: nonNegative('Costo inválido'),
  salePrice: nonNegative('Precio inválido'),
});

/** Cita creada desde el panel */
export const adminAppointmentSchema = z.object({
  reason: z.string().min(3, { message: 'Motivo requerido' }),
  slot: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, { message: 'Fecha y hora requeridas' }),
  address: z.string().min(8, { message: 'Dirección requerida' }),
  technicianId: z.string().optional(),
  notes: z.string().max(500).optional(),
  contact: z.object({
    name: z.string().min(2, { message: 'Nombre requerido' }),
    phone: z.string().min(8, { message: 'Teléfono requerido' }),
    email: z.string().email({ message: 'Email no válido' }).or(z.literal('')).optional(),
  }),
});

/** Insumo de inventario propio */
export const inventoryItemSchema = z.object({
  name: z.string().min(2, { message: 'Nombre requerido' }),
  category: z.string().optional(),
  unit: z.string().min(1, { message: 'Unidad requerida' }),
  stock: z.coerce.number({ message: 'Existencia inválida' }).nonnegative({ message: 'Existencia inválida' }),
  minStock: z.coerce.number({ message: 'Mínimo inválido' }).nonnegative({ message: 'Mínimo inválido' }),
  location: z.string().optional(),
  supplierId: z.string().optional(),
});

/** Proyecto del portafolio */
export const projectSchema = z.object({
  title: z.string().min(3, { message: 'Título requerido' }),
  category: z.string().min(1, { message: 'Elige una categoría' }),
  subcategory: z.string().optional(),
  client: z.string().optional(),
  description: z.string().max(800, { message: 'Máximo 800 caracteres' }).optional(),
  featured: z.boolean().optional(),
});

/** Testimonio de cliente (solo testimonios reales, con autorización del cliente) */
export const testimonialSchema = z.object({
  name: z.string().min(2, { message: 'Nombre requerido' }),
  company: z.string().optional(),
  text: z.string().min(10, { message: 'Muy corto' }).max(400, { message: 'Máximo 400 caracteres' }),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
});
