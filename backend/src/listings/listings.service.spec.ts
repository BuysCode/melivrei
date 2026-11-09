import { BadRequestException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../database/prisma.service.js';
import { ListingsService } from './listings.service.js';

describe('ListingsService', () => {
  const prisma = {
    listing: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  let service: ListingsService;
  beforeEach(async () => {
    service = (
      await Test.createTestingModule({
        providers: [
          ListingsService,
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile()
    ).get(ListingsService);
    jest.clearAllMocks();
  });
  it('exige preço para anúncio de venda', async () => {
    await expect(
      service.create('u1', {
        title: 'Livro',
        author: 'Autor',
        description: 'Descrição válida',
        condition: 'GOOD',
        mode: 'SALE',
      }),
    ).rejects.toThrow(BadRequestException);
  });
  it('consulta apenas anúncios disponíveis', async () => {
    prisma.listing.findMany.mockResolvedValue([]);
    await service.findAvailable({ search: 'Clean' });
    expect(prisma.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'AVAILABLE' }),
      }),
    );
  });
});
