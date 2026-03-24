import request from 'supertest';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { app, getAllowedOrigins } from './index';

describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('getAllowedOrigins', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns default origin when ALLOWED_ORIGINS is not set', () => {
    vi.stubEnv('ALLOWED_ORIGINS', undefined as unknown as string);
    expect(getAllowedOrigins()).toEqual(['http://localhost:5173']);
  });

  it('returns parsed origins when ALLOWED_ORIGINS is set', () => {
    vi.stubEnv('ALLOWED_ORIGINS', 'https://app.com,https://admin.app.com');
    expect(getAllowedOrigins()).toEqual(['https://app.com', 'https://admin.app.com']);
  });
});
