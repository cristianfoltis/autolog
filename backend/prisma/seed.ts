import { PrismaClient } from '@prisma/client';
import seedData from './makes-models-seed.json';

const prisma = new PrismaClient();

console.log('Seeding makes and models...');

const total = seedData.length;
let done = 0;

for (const entry of seedData) {
  const make = await prisma.make.upsert({
    where: { name: entry.make },
    update: {},
    create: { name: entry.make },
  });

  for (const modelName of entry.models) {
    await prisma.model.upsert({
      where: { name_makeId: { name: modelName, makeId: make.id } },
      update: {},
      create: { name: modelName, makeId: make.id },
    });
  }

  done++;
  const pct = Math.round((done / total) * 100);
  process.stdout.write(`\r  ${pct}% (${done}/${total} makes)`);
}

process.stdout.write('\n');
console.log('Seeding complete.');
await prisma.$disconnect();
