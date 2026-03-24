import { Router, Request, Response } from 'express';
import passport from '../config/passport';
import { register, login, getMe } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getMe);

/* c8 ignore start */
router.get(
  '/google',
  passport.authenticate('google', { scope: ['email', 'profile'], session: false }),
);
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/google/failure' }),
  (req: Request, res: Response) => {
    const { token } = req.user as { token: string };
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  },
);
router.get('/google/failure', (_req: Request, res: Response) => {
  res.status(401).json({ error: 'Google authentication failed' });
});
/* c8 ignore stop */

export default router;
