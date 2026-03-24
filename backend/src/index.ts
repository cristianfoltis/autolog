import 'dotenv/config';
import express from 'express';
import cors from 'cors';

export const app = express();

app.disable('x-powered-by');

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:5173'];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

/* c8 ignore start */
if (require.main === module) {
  const PORT = process.env.PORT ?? 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
/* c8 ignore stop */
