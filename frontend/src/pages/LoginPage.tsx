import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../schemas/auth.schema';
import type { LoginFormData } from '../schemas/auth.schema';
import { getApiErrorMessage } from '../utils/api-error';
import { API_ROUTES } from '../constants/api';

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Sign in to AutoLog</h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {getApiErrorMessage(error, 'Login failed. Please try again.')}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <a
          /* c8 ignore next */
          href={`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}${API_ROUTES.AUTH.GOOGLE}`}
          className="mt-3 w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Continue with Google
        </a>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
