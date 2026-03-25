import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';

export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body;

  try {
    const result = await registerUser(email, password, name);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'EMAIL_TAKEN') {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function getMe(req: Request, res: Response) {
  res.json(req.user);
}
