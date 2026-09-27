import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfile } from 'firebase/auth';
import { toast } from 'react-toastify';
import AccountLayout from '../../components/account/AccountLayout';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../firebase/authService';
import { updateUserProfile } from '../../services/firestoreService';
import { profileSchema } from '../../schemas/validations';

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, isAdmin } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      displayName: userProfile?.displayName ?? currentUser?.displayName ?? '',
      phone: userProfile?.phone ?? '',
      address: userProfile?.address ?? '',
    },
  });

  const onSubmit = async (values) => {
    try {
      await updateUserProfile(currentUser.uid, values);
      if (values.displayName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: values.displayName });
      }
      reset(values);
      toast.success('Perfil actualizado.');
    } catch (error) {
      console.error(error);
      toast.error('No pudimos guardar tus datos. Intenta de nuevo.');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/', { replace: true });
  };

  return (
    <AccountLayout title="Mi perfil">
      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 rounded-3xl bg-surface p-6 sm:p-8">
          <Field label="Nombre" autoComplete="name" error={errors.displayName?.message} {...register('displayName')} />
          <Field label="Correo electrónico" value={currentUser?.email ?? ''} disabled readOnly hint="El correo no se puede cambiar aquí." />
          <Field
            label="Teléfono"
            type="tel"
            autoComplete="tel"
            hint="Lo usamos para confirmar cotizaciones y citas."
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Field
            as="textarea"
            label="Dirección de entrega"
            autoComplete="street-address"
            error={errors.address?.message}
            {...register('address')}
          />
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </form>

        <aside className="space-y-4">
          {isAdmin && (
            <div className="rounded-3xl bg-ink p-6 text-white">
              <p className="font-semibold">Eres administradora</p>
              <p className="mt-1 text-sm text-white/70">Gestiona productos, logística, proveedores y finanzas.</p>
              <Button to="/admin" size="sm" className="mt-4">
                Ir al panel
              </Button>
            </div>
          )}
          <div className="rounded-3xl bg-surface p-6">
            <p className="font-semibold">Sesión</p>
            <p className="mt-1 text-sm text-muted">Conectado como {currentUser?.email}</p>
            <Button variant="outline" size="sm" onClick={handleLogout} className="mt-4">
              Cerrar sesión
            </Button>
          </div>
        </aside>
      </div>
    </AccountLayout>
  );
};

export default Profile;
