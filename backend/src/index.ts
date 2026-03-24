import 'dotenv/config';
import express from 'express';
import cors from 'cors';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  const PORT = process.env.PORT ?? 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
