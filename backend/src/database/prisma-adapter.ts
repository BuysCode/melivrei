import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Cria o adaptador PostgreSQL utilizado pelo Prisma.
 *
 * @throws {Error} Quando a variável `DATABASE_URL` não foi configurada.
 */
export function createPrismaAdapter(): PrismaPg {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is required to connect Prisma to PostgreSQL.',
    );
  }

  return new PrismaPg({ connectionString });
}
