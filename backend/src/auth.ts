import { prismaAdapter } from '@better-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const auth = betterAuth({
  appName: 'MeLivrei',
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: '/api/auth',
  trustedOrigins: [process.env.FRONTEND_URL ?? 'http://localhost:3001'],
  database: prismaAdapter(prisma, { provider: 'postgresql', transaction: true }),
  emailAndPassword: {
    enabled: true,
    password: {
      hash: (password) => bcrypt.hash(password, 12),
      verify: ({ hash, password }) => bcrypt.compare(password, hash),
    },
  },
  user: {
    modelName: 'User',
    additionalFields: {
      role: { type: 'string', input: false },
      status: { type: 'string', input: false },
    },
  },
  session: { modelName: 'Session' },
  account: { modelName: 'Account' },
  verification: { modelName: 'Verification' },
  advanced: {
    database: { generateId: 'uuid' },
  },
});
