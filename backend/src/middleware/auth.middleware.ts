import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { passwordHash: _removed, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
