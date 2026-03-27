import type { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  getUserVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../services/vehicle.service';

export async function listVehicles(req: Request, res: Response) {
  const vehicles = await getUserVehicles(req.user!.id);
  res.json(vehicles);
}

export async function getVehicle(req: Request<{ id: string }>, res: Response) {
  const vehicle = await getVehicleById(req.params.id, req.user!.id);

  if (!vehicle) {
    res.status(404).json({ error: 'Vehicle not found' });
    return;
  }

  res.json(vehicle);
}

export async function createVehicleHandler(req: Request, res: Response) {
  const { plate, year, vin, mileage, mileageUnit, makeId, modelId } = req.body;

  if (!plate || !year || mileage === undefined || !makeId || !modelId) {
    res.status(400).json({ error: 'plate, year, mileage, makeId and modelId are required' });
    return;
  }

  try {
    const vehicle = await createVehicle(req.user!.id, {
      plate,
      year: Number.parseInt(year),
      vin,
      mileage: Number.parseInt(mileage),
      mileageUnit,
      makeId: Number.parseInt(makeId),
      modelId: Number.parseInt(modelId),
    });
    res.status(201).json(vehicle);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      res.status(409).json({ error: 'A vehicle with this plate already exists' });
      return;
    }
    throw err;
  }
}

export async function updateVehicleHandler(req: Request<{ id: string }>, res: Response) {
  const { plate, year, vin, mileage, mileageUnit, makeId, modelId } = req.body;

  try {
    const vehicle = await updateVehicle(req.params.id, req.user!.id, {
      ...(plate !== undefined && { plate }),
      ...(year !== undefined && { year: Number.parseInt(year) }),
      ...(vin !== undefined && { vin }),
      ...(mileage !== undefined && { mileage: Number.parseInt(mileage) }),
      ...(mileageUnit !== undefined && { mileageUnit }),
      ...(makeId !== undefined && { makeId: Number.parseInt(makeId) }),
      ...(modelId !== undefined && { modelId: Number.parseInt(modelId) }),
    });

    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    res.json(vehicle);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      res.status(409).json({ error: 'A vehicle with this plate already exists' });
      return;
    }
    throw err;
  }
}

export async function deleteVehicleHandler(req: Request<{ id: string }>, res: Response) {
  const deleted = await deleteVehicle(req.params.id, req.user!.id);

  if (!deleted) {
    res.status(404).json({ error: 'Vehicle not found' });
    return;
  }

  res.status(204).send();
}
