import { ConflictException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../database/prisma.service.js';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  const prisma = { user: { findUnique: jest.fn(), create: jest.fn() } };
  const jwt = { sign: jest.fn(() => 'token') };
  let service: AuthService;
  beforeEach(async () => {
    service = (
      await Test.createTestingModule({
        providers: [
          AuthService,
          { provide: PrismaService, useValue: prisma },
          { provide: JwtService, useValue: jwt },
        ],
      }).compile()
    ).get(AuthService);
    jest.clearAllMocks();
  });
  it('recusa cadastro com e-mail existente', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
    await expect(
      service.register({
        name: 'Ana',
        email: 'ana@example.com',
        password: 'segredo123',
      }),
    ).rejects.toThrow(ConflictException);
  });
  it('cria token sem expor a senha', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      name: 'Ana',
      email: 'ana@example.com',
      role: 'USER',
    });
    const result = await service.register({
      name: 'Ana',
      email: 'ANA@example.com',
      password: 'segredo123',
    });
    expect(result).toEqual(expect.objectContaining({ accessToken: 'token' }));
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: 'ana@example.com' }),
      }),
    );
  });
});
