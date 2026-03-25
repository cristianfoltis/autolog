import { describe, it, expect } from 'vitest';
import { AxiosError } from 'axios';
import { getApiErrorMessage } from './api-error';

function makeAxiosError(message?: string): AxiosError {
  const error = new AxiosError('Request failed');
  if (message) {
    error.response = { data: { error: message } } as AxiosError['response'];
  }
  return error;
}

describe('getApiErrorMessage', () => {
  it('returns the error message from an AxiosError response', () => {
    const error = makeAxiosError('Email already in use');
    expect(getApiErrorMessage(error, 'fallback')).toBe('Email already in use');
  });

  it('returns the fallback when AxiosError has no response data', () => {
    const error = makeAxiosError();
    expect(getApiErrorMessage(error, 'fallback')).toBe('fallback');
  });

  it('returns the fallback when error is not an AxiosError', () => {
    expect(getApiErrorMessage(new Error('generic'), 'fallback')).toBe('fallback');
    expect(getApiErrorMessage(null, 'fallback')).toBe('fallback');
  });
});
