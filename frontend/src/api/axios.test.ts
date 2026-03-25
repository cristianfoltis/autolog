import { describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { applyAuthHeader } from './axios';
import { STORAGE_KEYS } from '../constants/storage';

function makeConfig(): InternalAxiosRequestConfig {
  return { headers: new axios.AxiosHeaders() } as InternalAxiosRequestConfig;
}

beforeEach(() => {
  localStorage.clear();
});

describe('applyAuthHeader', () => {
  it('adds Authorization header when token is in localStorage', () => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'my-token');

    const result = applyAuthHeader(makeConfig());

    expect(result.headers.Authorization).toBe('Bearer my-token');
  });

  it('does not add Authorization header when no token in localStorage', () => {
    const result = applyAuthHeader(makeConfig());

    expect(result.headers.Authorization).toBeUndefined();
  });
});
