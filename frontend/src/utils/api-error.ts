import { AxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    return (error.response?.data as { error?: string })?.error ?? fallback;
  }
  return fallback;
}
