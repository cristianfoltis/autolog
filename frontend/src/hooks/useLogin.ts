import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';
import { API_ROUTES } from '../constants/api';
import type { AuthResponse } from '../types/auth.types';
import type { LoginFormData } from '../schemas/auth.schema';

async function loginRequest(data: LoginFormData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, data);
  return response.data;
}

export function useLogin() {
  return useMutation({ mutationFn: loginRequest });
}
