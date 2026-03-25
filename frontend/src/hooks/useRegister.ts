import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';
import { API_ROUTES } from '../constants/api';
import type { AuthResponse } from '../types/auth.types';
import type { RegisterFormData } from '../schemas/auth.schema';

async function registerRequest(data: RegisterFormData): Promise<AuthResponse> {
  const { confirmPassword: _omit, ...payload } = data;
  const response = await api.post<AuthResponse>(API_ROUTES.AUTH.REGISTER, payload);
  return response.data;
}

export function useRegister() {
  return useMutation({ mutationFn: registerRequest });
}
