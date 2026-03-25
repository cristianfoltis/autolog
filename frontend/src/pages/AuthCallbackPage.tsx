import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { API_ROUTES } from '../constants/api';
import type { User } from '../types/auth.types';

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      navigate('/login');
      return;
    }

    api
      .get<User>(API_ROUTES.AUTH.ME, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        login({ token, user: res.data });
        navigate('/');
      })
      .catch(() => navigate('/login'));
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-sm">Signing you in...</p>
    </div>
  );
}
