import prisma from '../prisma/client';

export interface CreateVehicleInput {
  plate: string;
  year: number;
  vin?: string;
  mileage: number;
  mileageUnit?: string;
  makeId: number;
  modelId: number;
}

export interface UpdateVehicleInput {
  plate?: string;
  year?: number;
  vin?: string;
  mileage?: number;
  mileageUnit?: string;
  makeId?: number;
  modelId?: number;
}

const vehicleSelect = {
  id: true,
  plate: true,
  year: true,
  vin: true,
  mileage: true,
  mileageUnit: true,
  createdAt: true,
  updatedAt: true,
  make: { select: { id: true, name: true } },
  model: { select: { id: true, name: true } },
};

export async function getUserVehicles(userId: string) {
  return prisma.vehicle.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: vehicleSelect,
  });
}

export async function getVehicleById(id: string, userId: string) {
  return prisma.vehicle.findFirst({
    where: { id, userId },
    select: vehicleSelect,
  });
}

export async function createVehicle(userId: string, data: CreateVehicleInput) {
  return prisma.vehicle.create({
    data: { ...data, userId },
    select: vehicleSelect,
  });
}

export async function updateVehicle(id: string, userId: string, data: UpdateVehicleInput) {
  const vehicle = await prisma.vehicle.findFirst({ where: { id, userId }, select: { id: true } });

  if (!vehicle) return null;

  return prisma.vehicle.update({
    where: { id },
    data,
    select: vehicleSelect,
  });
}

export async function deleteVehicle(id: string, userId: string) {
  const vehicle = await prisma.vehicle.findFirst({ where: { id, userId }, select: { id: true } });

  if (!vehicle) return false;

  await prisma.vehicle.delete({ where: { id } });
  return true;
}
