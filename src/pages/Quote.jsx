import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDropzone } from 'react-dropzone';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import Reveal from '../components/motion/Reveal';
import QuoteCard from '../components/chat/QuoteCard';
import AppointmentCard, { AppointmentConfirmed } from '../components/chat/AppointmentCard';
import { CATEGORIES, getCategory } from '../data/categories';
import { quoteSchema } from '../schemas/validations';
import { n8nErrorMessage, requestQuote } from '../services/n8n';
import { uploadFile } from '../firebase/storageService';
import { useAuth } from '../context/AuthContext';
import { useProduct } from '../hooks/useProducts';
import useChatStore from '../store/chatStore';

// Formatos del previsualizador de logo → categoría/subcategoría del catálogo
const FORMAT_PRESETS = {
  valla: ['gran-formato', 'lonas'],
  vehiculo: ['gran-formato', 'rotulacion-vehicular'],
  stand: ['publicidad-eventos', 'stands'],
  rollup: ['publicidad-eventos', 'material-pop'],
};

const MAX_FILES = 5;
const MAX_FILE_MB = 25; // igual que storage.rules

const STEPS = [
  ['Pre-cotización', 'Al instante, con tus medidas.'],
  ['Confirmación', 'Precio final en minutos.'],
  ['Producción', 'Imprimimos y entregamos.'],
];

const FileDrop = ({ files, setFiles, disabled }) => {
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: { 'image/*': [], 'application/pdf': ['.pdf'] },
    maxSize: MAX_FILE_MB * 1024 * 1024,
    disabled,
    onDropAccepted: (accepted) => setFiles((prev) => [...prev, ...accepted].slice(0, MAX_FILES)),
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`rounded-2xl border border-dashed px-5 py-8 text-center transition-colors ${
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-ink/40'
        } ${isDragActive ? 'border-accent bg-accent/5' : 'border-line bg-surface'}`}
      >
        <input {...getInputProps()} aria-label="Adjuntar archivos" />
        <p className="text-sm font-medium">{isDragActive ? 'Suelta los archivos aquí' : 'Arrastra tu diseño o logo, o haz clic'}</p>
        <p className="mt-1 text-xs text-muted">
          Imagen o PDF, hasta {MAX_FILE_MB} MB · máximo {MAX_FILES} archivos
        </p>
      </div>
      {fileRejections.length > 0 && (
        <p className="mt-2 text-xs text-accent">Algunos archivos no se aceptaron (formato o tamaño).</p>
      )}
      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3.5 py-2 text-sm">
              <span className="truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                className="shrink-0 text-xs font-semibold text-muted hover:text-ink"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Quote = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('producto');
  const [presetCategory, presetSub] = FORMAT_PRESETS[searchParams.get('formato')] ?? [];

  const { currentUser, userProfile } = useAuth();
  const { data: product } = useProduct(productId);
  const sessionId = useChatStore((s) => s.sessionId);
  const openChat = useChatStore((s) => s.open);

  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [serverError, setServerError] = useState('');
  const [result, setResult] = useState(null);
  const [scheduled, setScheduled] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      category: presetCategory ?? '',
      subcategory: presetSub ?? '',
      width: '',
      height: '',
      unit: 'm',
      quantity: 1,
      deadline: '',
      notes: '',
      contact: {
        name: userProfile?.displayName ?? currentUser?.displayName ?? '',
        email: currentUser?.email ?? '',
        phone: userProfile?.phone ?? '',
      },
    },
  });

  // Si viene de un producto, preseleccionar su categoría
  useEffect(() => {
    if (!product) return;
    setValue('category', product.category ?? '');
    setValue('subcategory', product.subcategory ?? '');
  }, [product, setValue]);

  const category = getCategory(useWatch({ control, name: 'category' }));

  const onSubmit = async (values) => {
    setServerError('');
    try {
      // Los archivos se suben primero a Storage (carpeta privada del usuario) y a n8n solo van las URLs
      const uploaded = [];
      if (currentUser && files.length) {
        for (const [i, file] of files.entries()) {
          const url = await uploadFile(file, `designs/${currentUser.uid}`, (p) =>
            setUploadProgress(Math.round(((i + p / 100) / files.length) * 100))
          );
          uploaded.push({ name: file.name, type: file.type, url });
        }
        setUploadProgress(null);
      }

      const res = await requestQuote({
        ...values,
        productId: productId ?? null,
        productName: product?.name ?? null,
        files: uploaded,
        uid: currentUser?.uid ?? null,
        sessionId,
        source: 'web-form',
      });
      setResult(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error al solicitar la cotización:', error);
      setUploadProgress(null);
      setServerError(error?.code?.startsWith?.('storage/') ? 'No pudimos subir tus archivos. Intenta de nuevo.' : n8nErrorMessage(error));
    }
  };

  const submitLabel = uploadProgress != null ? `Subiendo archivos ${uploadProgress}%` : isSubmitting ? 'Calculando…' : 'Obtener pre-cotización';

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
      <Helmet>
        <title>Cotiza al instante | IMPRIME con SHIR</title>
        <meta name="description" content="Pre-cotización al instante y precio final en minutos." />
      </Helmet>

      <Reveal className="mb-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Cotización</p>
        <h1 className="mt-3 text-[clamp(2.25rem,5vw,4rem)] leading-none font-black">Cotiza al instante.</h1>
        {product && <p className="mt-4 text-muted">Para: {product.name}</p>}
      </Reveal>

      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {result.message && <p className="text-lg">{result.message}</p>}
              {result.status === 'requires_visit' ? (
                scheduled ? (
                  <AppointmentConfirmed result={scheduled} />
                ) : (
                  <AppointmentCard
                    appointment={result.appointment}
                    sessionId={sessionId}
                    quoteId={result.quoteId}
                    onScheduled={setScheduled}
                  />
                )
              ) : (
                <QuoteCard quote={result} />
              )}
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => { setResult(null); setScheduled(null); setFiles([]); }}>
                  Nueva cotización
                </Button>
                <Button variant="ghost" to="/catalogo">
                  Seguir viendo el catálogo
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.form key="form" exit={{ opacity: 0 }} onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10">
              <fieldset className="space-y-4">
                <legend className="mb-4 font-display text-xl font-bold">¿Qué necesitas?</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    as="select"
                    label="Categoría"
                    error={errors.category?.message}
                    {...register('category', { onChange: () => setValue('subcategory', '') })}
                  >
                    <option value="">Elige una categoría</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.fullName}
                      </option>
                    ))}
                  </Field>
                  <Field as="select" label="Tipo de trabajo" disabled={!category} error={errors.subcategory?.message} {...register('subcategory')}>
                    <option value="">{category ? 'Elige un tipo' : 'Primero elige categoría'}</option>
                    {category?.subcategories.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Field label="Ancho" type="number" inputMode="decimal" min="0" step="any" error={errors.width?.message} {...register('width')} />
                  <Field label="Alto" type="number" inputMode="decimal" min="0" step="any" error={errors.height?.message} {...register('height')} />
                  <Field as="select" label="Unidad" {...register('unit')}>
                    <option value="m">metros</option>
                    <option value="cm">centímetros</option>
                  </Field>
                  <Field label="Cantidad" type="number" inputMode="numeric" min="1" error={errors.quantity?.message} {...register('quantity')} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="¿Para cuándo?" type="date" hint="Opcional" {...register('deadline')} />
                </div>
                <Field as="textarea" label="Detalles" placeholder="Material, acabados, lugar de instalación…" error={errors.notes?.message} {...register('notes')} />
              </fieldset>

              <fieldset>
                <legend className="mb-4 font-display text-xl font-bold">Tus archivos</legend>
                <FileDrop files={files} setFiles={setFiles} disabled={!currentUser} />
                {!currentUser && (
                  <p className="mt-2 text-xs text-muted">
                    <Link to="/login" className="font-semibold text-ink underline underline-offset-4">
                      Inicia sesión
                    </Link>{' '}
                    para adjuntar archivos. Puedes cotizar sin ellos.
                  </p>
                )}
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="mb-4 font-display text-xl font-bold">Contacto</legend>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Nombre" autoComplete="name" error={errors.contact?.name?.message} {...register('contact.name')} />
                  <Field label="Email" type="email" autoComplete="email" error={errors.contact?.email?.message} {...register('contact.email')} />
                  <Field label="Teléfono" type="tel" autoComplete="tel" error={errors.contact?.phone?.message} {...register('contact.phone')} />
                </div>
              </fieldset>

              {serverError && (
                <p role="alert" className="text-sm text-accent">
                  {serverError}
                </p>
              )}

              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
                {submitLabel}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        <aside className="lg:sticky lg:top-36 lg:self-start">
          <ol className="space-y-6 rounded-3xl bg-surface p-8">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="flex gap-4">
                <span className="font-display text-2xl font-black text-line tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-6 px-2">
            <p className="text-sm text-muted">¿Prefieres contarnos por chat?</p>
            <button type="button" onClick={openChat} className="mt-1 text-sm font-semibold underline underline-offset-4">
              Abrir chat
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Quote;
