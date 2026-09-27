import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { loginWithGoogle, registerUser } from '../../firebase/authService';
import { registerSchema } from '../../schemas/validations';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import AuthCard, { Divider, GoogleButton, GoogleConsent } from '../../components/auth/AuthCard';
import { authErrorMessage } from '../../components/auth/authErrors';
import { ConsentFields } from '../../components/billing/BillingFields';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const redirectTo = location.state?.from?.pathname ?? '/perfil';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  if (currentUser) return <Navigate to={redirectTo} replace />;

  const run = async (action) => {
    try {
      setLoading(true);
      await action();
      toast.success('¡Cuenta creada! Bienvenido a IMPRIME con SHIR.');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(authErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data) =>
    run(() => registerUser(data.email, data.password, data.displayName, { marketingOptIn: !!data.marketingOptIn }));

  return (
    <AuthCard
      title="Crear cuenta"
      heading="Crea tu cuenta"
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" state={location.state} className="font-semibold text-ink underline underline-offset-4">
            Inicia sesión
          </Link>
        </>
      }
    >
      <GoogleButton onClick={() => run(loginWithGoogle)} disabled={loading} label="Registrarme con Google" />
      <GoogleConsent />
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field label="Nombre" autoComplete="name" error={errors.displayName?.message} {...register('displayName')} />
        <Field label="Correo electrónico" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Field
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          hint="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />
        <Field
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <ConsentFields register={register} errors={errors} />
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
      <p className="mt-6 text-center text-xs text-muted">
        Con tu cuenta puedes adjuntar tus diseños, ver tus cotizaciones y dar seguimiento a tus pedidos.
      </p>
    </AuthCard>
  );
};

export default Register;
