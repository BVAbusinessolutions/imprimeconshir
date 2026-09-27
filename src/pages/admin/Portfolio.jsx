import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDropzone } from 'react-dropzone';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AdminHeader, Badge, ConfirmButton, EmptyState, ErrorNote, LoadingBlock, Panel } from '../../components/admin/AdminUI';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import ProjectImage from '../../components/media/ProjectImage';
import { createItem, deleteItem, listAll, updateItem } from '../../services/adminService';
import { uploadFile } from '../../firebase/storageService';
import { CATEGORIES, getCategory } from '../../data/categories';
import { projectSchema, testimonialSchema } from '../../schemas/validations';

const MAX_MB = 8; // igual que storage.rules (projects/)

/** Zona para subir una o varias fotos al portafolio. */
const ImageDrop = ({ label, multiple = true, onUploaded }) => {
  const [busy, setBusy] = useState(false);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple,
    maxSize: MAX_MB * 1024 * 1024,
    onDropRejected: () => toast.error(`Solo imágenes de hasta ${MAX_MB} MB.`),
    onDropAccepted: async (files) => {
      setBusy(true);
      try {
        const urls = [];
        for (const f of files) urls.push(await uploadFile(f, 'projects'));
        onUploaded(urls);
      } catch {
        toast.error('No se pudo subir la imagen.');
      } finally {
        setBusy(false);
      }
    },
  });
  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer rounded-2xl border border-dashed px-4 py-5 text-center text-sm ${
        isDragActive ? 'border-accent bg-accent/5' : 'border-line hover:border-ink/40'
      }`}
    >
      <input {...getInputProps()} aria-label={label} />
      {busy ? 'Subiendo…' : label}
    </div>
  );
};

const ProjectForm = ({ project, onDone }) => {
  const [images, setImages] = useState(project?.images ?? []);
  const [beforeImage, setBefore] = useState(project?.beforeImage ?? null);
  const [afterImage, setAfter] = useState(project?.afterImage ?? null);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: { title: '', category: '', subcategory: '', client: '', description: '', featured: false, ...project },
  });
  const category = getCategory(useWatch({ control, name: 'category' }));

  const onSubmit = async (values) => {
    if (!images.length && !(beforeImage && afterImage)) return toast.info('Agrega al menos una foto.');
    const data = { ...values, images, beforeImage, afterImage, featured: !!values.featured };
    try {
      if (project) await updateItem('projects', project.id, data);
      else await createItem('projects', data);
      toast.success('Proyecto guardado.');
      onDone();
    } catch {
      toast.error('No se pudo guardar el proyecto.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Field label="Título" placeholder="Rotulación de flotilla" error={errors.title?.message} {...register('title')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field as="select" label="Categoría" error={errors.category?.message} {...register('category', { onChange: () => setValue('subcategory', '') })}>
          <option value="">Elige</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.fullName}
            </option>
          ))}
        </Field>
        <Field as="select" label="Subcategoría" disabled={!category} {...register('subcategory')}>
          <option value="">Opcional</option>
          {category?.subcategories.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </Field>
      </div>
      <Field label="Cliente" hint="Solo si el cliente autorizó mencionarlo" {...register('client')} />
      <Field as="textarea" label="Descripción" error={errors.description?.message} {...register('description')} />
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" className="h-4 w-4 accent-accent" {...register('featured')} />
        Destacado (aparece primero)
      </label>

      <div className="space-y-2">
        <p className="text-sm font-medium">Fotos</p>
        <ImageDrop label="Arrastra fotos o haz clic" onUploaded={(urls) => setImages((p) => [...p, ...urls])} />
        {images.length > 0 && (
          <ul className="grid grid-cols-4 gap-2">
            {images.map((src) => (
              <li key={src} className="group relative overflow-hidden rounded-xl">
                <ProjectImage src={src} className="aspect-square w-full" />
                <button
                  type="button"
                  onClick={() => setImages((p) => p.filter((s) => s !== src))}
                  className="absolute inset-x-1 bottom-1 rounded-lg bg-ink/80 py-1 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Antes y después (opcional)</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            ['Antes', beforeImage, setBefore],
            ['Después', afterImage, setAfter],
          ].map(([label, src, set]) =>
            src ? (
              <div key={label} className="relative overflow-hidden rounded-xl">
                <ProjectImage src={src} className="aspect-[4/3] w-full" />
                <button type="button" onClick={() => set(null)} className="absolute top-1 right-1 rounded-lg bg-ink/80 px-2 py-1 text-xs font-semibold text-white">
                  Quitar {label.toLowerCase()}
                </button>
              </div>
            ) : (
              <ImageDrop key={label} label={`Foto "${label}"`} multiple={false} onUploaded={([url]) => set(url)} />
            )
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          Guardar proyecto
        </Button>
        <Button variant="ghost" size="sm" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

const TestimonialForm = ({ testimonial, onDone }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(testimonialSchema),
    defaultValues: { name: '', company: '', text: '', published: true, featured: false, ...testimonial },
  });

  const onSubmit = async (values) => {
    const data = { ...values, published: !!values.published, featured: !!values.featured };
    try {
      if (testimonial) await updateItem('testimonials', testimonial.id, data);
      else await createItem('testimonials', data);
      toast.success('Testimonio guardado.');
      onDone();
    } catch {
      toast.error('No se pudo guardar.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <p className="rounded-2xl bg-paper p-3 text-xs text-muted">
        Publica solo testimonios reales, con el permiso del cliente para mostrar su nombre y comentario.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" error={errors.name?.message} {...register('name')} />
        <Field label="Empresa" {...register('company')} />
      </div>
      <Field as="textarea" label="Comentario" error={errors.text?.message} {...register('text')} />
      <div className="flex gap-6 text-sm font-medium">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 accent-accent" {...register('published')} />
          Publicado
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 accent-accent" {...register('featured')} />
          Destacado
        </label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          Guardar testimonio
        </Button>
        <Button variant="ghost" size="sm" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

const Portfolio = () => {
  const qc = useQueryClient();
  const [tab, setTab] = useState('projects');
  const [editing, setEditing] = useState(null); // null | 'new' | item
  const list = useQuery({ queryKey: ['admin', tab], queryFn: () => listAll(tab) });

  const done = () => {
    setEditing(null);
    qc.invalidateQueries({ queryKey: ['admin', tab] });
    qc.invalidateQueries({ queryKey: [tab === 'projects' ? 'projects' : 'testimonials'] });
  };
  const switchTab = (t) => {
    setTab(t);
    setEditing(null);
  };

  return (
    <>
      <AdminHeader
        title="Portafolio"
        description="Los proyectos se muestran en la página Proyectos; los testimonios publicados, en el inicio."
        actions={
          !editing && (
            <Button size="sm" onClick={() => setEditing('new')}>
              {tab === 'projects' ? 'Nuevo proyecto' : 'Nuevo testimonio'}
            </Button>
          )
        }
      />

      <div role="tablist" className="mb-6 flex gap-2">
        {[
          ['projects', 'Proyectos'],
          ['testimonials', 'Testimonios'],
        ].map(([key, label]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={tab === key}
            onClick={() => switchTab(key)}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${tab === key ? 'border-ink bg-ink text-white' : 'border-line bg-surface hover:border-ink/40'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={`grid gap-6 ${editing ? 'xl:grid-cols-[1fr_440px]' : ''}`}>
        <div className="space-y-2">
          {list.isLoading && <LoadingBlock />}
          {list.isError && <ErrorNote />}
          {list.data?.length === 0 && (
            <EmptyState>{tab === 'projects' ? 'Aún no hay proyectos: la página muestra fotos de ejemplo.' : 'Aún no hay testimonios.'}</EmptyState>
          )}
          {list.data?.map((item) => (
            <article key={item.id} className="flex items-center gap-4 rounded-2xl bg-surface p-3 pr-5">
              {tab === 'projects' && (
                <ProjectImage src={item.images?.[0] ?? item.afterImage} alt={item.title} className="h-16 w-16 shrink-0 rounded-xl" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {tab === 'projects' ? item.title : item.name} {item.featured && <Badge tone="dark">Destacado</Badge>}{' '}
                  {tab === 'testimonials' && !item.published && <Badge>Oculto</Badge>}
                </p>
                <p className="truncate text-sm text-muted">
                  {tab === 'projects' ? getCategory(item.category)?.name : item.text}
                </p>
              </div>
              <button type="button" onClick={() => setEditing(item)} className="text-sm font-semibold">
                Editar
              </button>
              <ConfirmButton onConfirm={() => deleteItem(tab, item.id).then(done)} />
            </article>
          ))}
        </div>

        {editing && (
          <Panel title={editing === 'new' ? 'Nuevo' : 'Editar'} className="xl:sticky xl:top-36 xl:self-start">
            {tab === 'projects' ? (
              <ProjectForm key={editing.id ?? 'new'} project={editing === 'new' ? null : editing} onDone={done} />
            ) : (
              <TestimonialForm key={editing.id ?? 'new'} testimonial={editing === 'new' ? null : editing} onDone={done} />
            )}
          </Panel>
        )}
      </div>
    </>
  );
};

export default Portfolio;
