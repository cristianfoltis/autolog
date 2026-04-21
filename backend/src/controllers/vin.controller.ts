import type { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

interface AutoDevVinResponse {
  vinValid: boolean;
  make?: string;
  model?: string;
  years?: number[];
}

export async function lookupVinHandler(
  req: Request<{ vin: string }>,
  res: Response,
  next: NextFunction,
) {
  const { vin } = req.params;

  if (vin.length !== 17) {
    res.status(400).json({ error: 'VIN must be exactly 17 characters' });
    return;
  }

  try {
    const apiRes = await fetch(`https://api.auto.dev/vin/${vin}`, {
      headers: { Authorization: `Bearer ${process.env.AUTO_DEV_API_KEY}` },
    });

    if (!apiRes.ok) {
      res.status(404).json({ error: 'VIN not found' });
      return;
    }

    const data = (await apiRes.json()) as AutoDevVinResponse;

    if (!data.vinValid || !data.make || !data.model || !data.years?.length) {
      res.status(404).json({ error: 'VIN not found' });
      return;
    }

    const year = Math.max(...data.years);

    const make = await prisma.make.findFirst({
      where: { name: { equals: data.make, mode: 'insensitive' } },
    });

    if (!make) {
      res.status(404).json({ error: 'Make not found in database' });
      return;
    }

    const model = await prisma.model.findFirst({
      where: {
        name: { equals: data.model, mode: 'insensitive' },
        makeId: make.id,
      },
    });

    res.json({
      year,
      makeId: make.id,
      makeName: make.name,
      modelId: model?.id ?? null,
      modelName: model?.name ?? null,
    });
  } catch (err) {
    next(err);
  }
}
