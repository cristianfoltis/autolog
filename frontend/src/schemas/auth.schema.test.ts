import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from './auth.schema';

describe('loginSchema', () => {
  it('passes with valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: 'secret' });
    expect(result.success).toBe(true);
  });

  it('fails when email is invalid', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' });
    expect(result.success).toBe(false);
  });

  it('fails when password is empty', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const valid = {
    name: 'Test User',
    email: 'user@test.com',
    password: 'password123',
    confirmPassword: 'password123',
  };

  it('passes with valid data', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('fails when name is too short', () => {
    const result = registerSchema.safeParse({ ...valid, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('fails when password is too short', () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: 'short',
      confirmPassword: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('fails when passwords do not match', () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: 'different' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain('confirmPassword');
    }
  });
});
