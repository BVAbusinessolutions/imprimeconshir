import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { loginUser, loginWithGoogle } from '../../firebase/authService';
import { loginSchema } from '../../schemas/validations';
import Button from '../../components/ui/Button';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await loginUser(data.email, data.password);
      toast.success('¡Bienvenido de vuelta!');
      navigate('/perfil');
    } catch (error) {
      console.error(error);
      toast.error('Credenciales incorrectas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      toast.success('¡Bienvenido con Google!');
      navigate('/perfil');
    } catch (error) {
      console.error(error);
      toast.error('Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Helmet>
        <title>Iniciar Sesión | IMPRIME con SHIR</title>
      </Helmet>

      <div className="w-full max-w-md rounded-3xl bg-surface p-8 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-extrabold text-ink">
          Ingresa a tu cuenta
        </h1>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mb-6 flex w-full items-center justify-center gap-3 rounded-full border border-line bg-white py-3 font-semibold text-ink transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
          Continuar con Google
        </button>

        <div className="relative mb-6 flex items-center py-2">
          <div className="flex-grow border-t border-line"></div>
          <span className="mx-4 text-sm text-muted">O con tu correo</span>
          <div className="flex-grow border-t border-line"></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-ink">Correo electrónico</label>
            <input
              {...register('email')}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="tu@correo.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-ink">Contraseña</label>
            <input
              type="password"
              {...register('password')}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-semibold text-accent hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
