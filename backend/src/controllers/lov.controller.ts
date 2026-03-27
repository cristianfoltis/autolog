import type { Request, Response } from 'express';
import { getMakes, getModelsByMake } from '../services/lov.service';

export async function makesHandler(req: Request, res: Response) {
  const makes = await getMakes();
  res.json(makes);
}

export async function modelsHandler(req: Request, res: Response) {
  const makeId = Number.parseInt(req.query.makeId as string, 10);

  if (Number.isNaN(makeId)) {
    res.status(400).json({ error: 'makeId query parameter is required and must be a number' });
    return;
  }

  const models = await getModelsByMake(makeId);
  res.json(models);
}
