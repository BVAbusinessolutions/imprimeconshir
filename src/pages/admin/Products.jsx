import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { AdminHeader, Badge, ConfirmButton, EmptyState, ErrorNote, LoadingBlock, Panel } from '../../components/admin/AdminUI';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import ProjectImage from '../../components/media/ProjectImage';
import { useCreateProduct, useDeleteProduct, useProducts, useUpdateProduct } from '../../hooks/useProducts';
import { uploadFile } from '../../firebase/storageService';
import { CATEGORIES, fallbackImageFor, getCategory } from '../../data/categories';
import { adminProductSchema } from '../../schemas/validations';
import { formatCurrency } from '../../utils/helpers';

const EMPTY = { name: '', description: '', category: '', subcategory: '', price: '', featured: false };
const MAX_IMAGE_MB = 5; // igual que storage.rules

const ProductForm = ({ product, onDone }) => {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [images, setImages] = useState(product?.images ?? []);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminProductSchema),
    defaultValues: product ? { ...EMPTY, ...product, price: product.price ?? '' } : EMPTY,
  });
  const category = getCategory(useWatch({ control, name: 'category' }));

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxSize: MAX_IMAGE_MB * 1024 * 1024,
    onDropRejected: () => toast.error(`Solo imágenes de hasta ${MAX_IMAGE_MB} MB.`),
    onDropAccepted: async (files) => {
      setUploading(true);
      try {
        const urls = [];
        for (const f of files) urls.push(await uploadFile(f, 'products'));
        setImages((prev) => [...prev, ...urls]);
      } catch (error) {
        console.error(error);
        toast.error('No se pudo subir la imagen.');
      } finally {
        setUploading(false);
      }
    },
  });

  const onSubmit = async (values) => {
    const data = { ...values, price: values.price ?? null, featured: !!values.featured, images };
    try {
      if (product) await updateProduct.mutateAsync({ id: product.id, data });
      else await createProduct.mutateAsync(data);
      toast.success(product ? 'Producto actualizado.' : 'Producto creado.');
      onDone();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo guardar el producto.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Field label="Nombre" error={errors.name?.message} {...register('name')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          as="select"
          label="Categoría"
          error={errors.category?.message}
          {...register('category', { onChange: () => setValue('subcategory', '') })}
        >
          <option value="">Elige</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.fullName}
            </option>
          ))}
        </Field>
        <Field as="select" label="Subcategoría" disabled={!category} error={errors.subcategory?.message} {...register('subcategory')}>
          <option value="">Elige</option>
          {category?.subcategories.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </Field>
      </div>
      <Field as="textarea" label="Descripción" error={errors.description?.message} {...register('description')} />
      <Field label="Precio desde (MXN)" type="number" min="0" step="any" hint="Opcional" error={errors.price?.message} {...register('price')} />
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" className="h-4 w-4 accent-accent" {...register('featured')} />
        Destacado
      </label>

      <div>
        <p className="mb-1.5 text-sm font-medium">Fotos</p>
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-2xl border border-dashed px-4 py-6 text-center text-sm transition-colors ${
            isDragActive ? 'border-accent bg-accent/5' : 'border-line hover:border-ink/40'
          }`}
        >
          <input {...getInputProps()} aria-label="Subir fotos" />
          {uploading ? 'Subiendo…' : 'Arrastra fotos o haz clic (hasta 5 MB c/u)'}
        </div>
        {images.length > 0 && (
          <ul className="mt-3 grid grid-cols-4 gap-2">
            {images.map((src, i) => (
              <li key={src} className="group relative overflow-hidden rounded-xl">
                <ProjectImage src={src} alt={`Foto ${i + 1}`} className="aspect-square w-full" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((s) => s !== src))}
                  className="absolute inset-x-1 bottom-1 rounded-lg bg-ink/80 py-1 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting || uploading}>
          {isSubmitting ? 'Guardando…' : product ? 'Guardar cambios' : 'Crear producto'}
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

const AdminProducts = () => {
  const { data: products = [], isLoading, isError } = useProducts();
  const deleteProduct = useDeleteProduct();
  const [editing, setEditing] = useState(null); // null | 'new' | producto

  const handleDelete = async (id) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Producto eliminado.');
    } catch {
      toast.error('No se pudo eliminar.');
    }
  };

  return (
    <>
      <AdminHeader
        title="Productos"
        description="Lo que aparece en el catálogo. Los productos sin foto usan la imagen de su subcategoría."
        actions={
          !editing && (
            <Button size="sm" onClick={() => setEditing('new')}>
              Nuevo producto
            </Button>
          )
        }
      />

      <div className={`grid gap-6 ${editing ? 'xl:grid-cols-[1fr_420px]' : ''}`}>
        <div className="space-y-3">
          {isLoading && <LoadingBlock />}
          {isError && <ErrorNote />}
          {!isLoading && products.length === 0 && <EmptyState>Aún no hay productos. Crea el primero.</EmptyState>}
          {products.map((p) => {
            const cat = getCategory(p.category);
            return (
              <article key={p.id} className="flex items-center gap-4 rounded-2xl bg-surface p-3 pr-5">
                <ProjectImage src={p.images?.[0] ?? fallbackImageFor(p)} alt={p.name} className="h-16 w-16 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {p.name} {p.featured && <Badge tone="dark">Destacado</Badge>}
                  </p>
                  <p className="truncate text-sm text-muted">
                    {cat?.name ?? p.category}
                    {p.price > 0 && ` · desde ${formatCurrency(p.price)}`}
                  </p>
                </div>
                <button type="button" onClick={() => setEditing(p)} className="text-sm font-semibold">
                  Editar
                </button>
                <ConfirmButton onConfirm={() => handleDelete(p.id)} disabled={deleteProduct.isPending} />
              </article>
            );
          })}
        </div>

        {editing && (
          <Panel title={editing === 'new' ? 'Nuevo producto' : 'Editar producto'} className="xl:sticky xl:top-36 xl:self-start">
            <ProductForm key={editing === 'new' ? 'new' : editing.id} product={editing === 'new' ? null : editing} onDone={() => setEditing(null)} />
          </Panel>
        )}
      </div>
    </>
  );
};

export default AdminProducts;
