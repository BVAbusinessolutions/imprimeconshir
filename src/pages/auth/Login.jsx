import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { loginUser, loginWithGoogle, resetPassword } from '../../firebase/authService';
import { loginSchema } from '../../schemas/validations';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import AuthCard, { Divider, GoogleButton } from '../../components/auth/AuthCard';
import { authErrorMessage } from '../../components/auth/authErrors';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  // Volver a la página protegida desde la que se llegó (ver ProtectedRoute)
  const redirectTo = location.state?.from?.pathname ?? '/perfil';

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  if (currentUser) return <Navigate to={redirectTo} replace />;

  const run = async (action, successMessage) => {
    try {
      setLoading(true);
      await action();
      toast.success(successMessage);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(authErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data) => run(() => loginUser(data.email, data.password), '¡Bienvenido de vuelta!');

  const handleReset = async () => {
    const email = getValues('email');
    if (!email) {
      toast.info('Escribe tu correo arriba y vuelve a tocar "Olvidé mi contraseña".');
      return;
    }
    try {
      await resetPassword(email);
      toast.success('Si el correo está registrado, te enviamos un enlace para restablecerla.');
    } catch (error) {
      toast.error(authErrorMessage(error));
    }
  };

  return (
    <AuthCard
      title="Iniciar sesión"
      heading="Ingresa a tu cuenta"
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" state={location.state} className="font-semibold text-ink underline underline-offset-4">
            Regístrate
          </Link>
        </>
      }
    >
      <GoogleButton onClick={() => run(loginWithGoogle, '¡Bienvenido!')} disabled={loading} />
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field label="Correo electrónico" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Field label="Contraseña" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <button type="button" onClick={handleReset} className="text-sm font-medium text-muted hover:text-ink">
          Olvidé mi contraseña
        </button>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Entrando…' : 'Iniciar sesión'}
        </Button>
      </form>
    </AuthCard>
  );
};

export default Login;
