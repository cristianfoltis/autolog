import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import prisma from '../prisma/client';

export function sanitizeUser(user: User): Omit<User, 'passwordHash'> {
  const { passwordHash: _removed, ...safe } = user;
  return safe;
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
}

export async function registerUser(email: string, password: string, name?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  return { token: signToken(user.id), user: sanitizeUser(user) };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user?.passwordHash) throw new Error('INVALID_CREDENTIALS');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('INVALID_CREDENTIALS');

  return { token: signToken(user.id), user: sanitizeUser(user) };
}

export async function findOrCreateGoogleUser(googleId: string, email: string, name: string) {
  let user = await prisma.user.findUnique({ where: { googleId } });

  if (!user) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      user = await prisma.user.update({ where: { id: existing.id }, data: { googleId } });
    } else {
      user = await prisma.user.create({ data: { email, googleId, name } });
    }
  }

  return { token: signToken(user.id), user: sanitizeUser(user) };
}
