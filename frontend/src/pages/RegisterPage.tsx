import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';
import { useAuth } from '../context/AuthContext';
import { registerSchema } from '../schemas/auth.schema';
import type { RegisterFormData } from '../schemas/auth.schema';
import { getApiErrorMessage } from '../utils/api-error';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { Panel } from '../components/ui/Panel';
import { PageLayout } from '../components/ui/PageLayout';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { mutate, isPending, error } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  function onSubmit(data: RegisterFormData) {
    mutate(data, {
      onSuccess: (response) => {
        login(response);
        navigate('/');
      },
    });
  }

  return (
    <PageLayout>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Create an account</h1>
          <p className="mt-1.5 text-sm text-text-muted">Start tracking your vehicle history</p>
        </div>

        <Panel>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <FormField
              id="name"
              label="Full name"
              type="text"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name')}
            />

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
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <FormField
              id="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {error && (
              <p className="text-sm text-error">
                {getApiErrorMessage(error, 'Registration failed. Please try again.')}
              </p>
            )}

            <Button type="submit" loading={isPending}>
              Create account
            </Button>
          </form>
        </Panel>

        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-brand hover:text-brand-hover font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </PageLayout>
  );
}
