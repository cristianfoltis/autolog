import prisma from '../prisma/client';

export async function getMakes() {
  return prisma.make.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
}

export async function getModelsByMake(makeId: number) {
  return prisma.model.findMany({
    where: { makeId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
}
