import { PrismaPg } from '@prisma/adapter-pg';

export function createPrismaAdapter(): PrismaPg {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is required to connect Prisma to PostgreSQL.',
    );
  }

  return new PrismaPg({ connectionString });
}
