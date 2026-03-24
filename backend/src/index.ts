import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import passport from './config/passport';
import authRoutes from './routes/auth.routes';

export const app = express();

app.disable('x-powered-by');

export function getAllowedOrigins(): string[] {
  return process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:5173'];
}

app.use(cors({ origin: getAllowedOrigins() }));
app.use(express.json());
app.use(passport.initialize());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);

/* c8 ignore start */
if (require.main === module) {
  const PORT = process.env.PORT ?? 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
/* c8 ignore stop */
