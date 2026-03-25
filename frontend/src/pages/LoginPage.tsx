import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../schemas/auth.schema';
import type { LoginFormData } from '../schemas/auth.schema';
import { getApiErrorMessage } from '../utils/api-error';
import { API_ROUTES } from '../constants/api';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { mutate, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  function onSubmit(data: LoginFormData) {
    mutate(data, {
      onSuccess: (response) => {
        login(response);
        navigate('/');
      },
    });
  }

  /* c8 ignore next */
  const googleAuthUrl = `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}${API_ROUTES.AUTH.GOOGLE}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-text-muted">Sign in to your AutoLog account</p>
        </div>

        <div className="bg-surface rounded-2xl p-8 shadow-xl shadow-black/20">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <FormField
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <FormField
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {error && (
              <p className="text-sm text-error">{getApiErrorMessage(error, 'Login failed. Please try again.')}</p>
            )}

            <Button type="submit" disabled={isPending}>
              {isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface px-3 text-xs text-text-muted">or</span>
            </div>
          </div>

          <a href={googleAuthUrl}>
            <Button variant="outline">Continue with Google</Button>
          </a>
        </div>

        <p className="mt-6 text-center text-sm text-text-muted">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-brand hover:text-brand-hover font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
