import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from './products.service';
import {
  mockPrismaService,
  resetPrismaMock,
} from '../../test/helpers/mock-prisma';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    resetPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  describe('create', () => {
    it('should create a product with active=true by default', async () => {
      const dto = { title: 'Polera', price: 19990, stock: 50 };
      mockPrismaService.product.create.mockResolvedValue({
        id: 'p1',
        ...dto,
        active: true,
      });

      const result = await service.create(dto);

      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ ...dto, active: true }),
      });
      expect(result.id).toBe('p1');
    });

    it('should respect active=false when provided', async () => {
      const dto = { title: 'Polera', price: 19990, stock: 50, active: false };
      mockPrismaService.product.create.mockResolvedValue({ id: 'p1', ...dto });

      await service.create(dto);

      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ active: false }),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated results with default page and limit', async () => {
      const products = [{ id: 'p1', title: 'Polera', active: true }];
      mockPrismaService.product.findMany.mockResolvedValue(products);
      mockPrismaService.product.count.mockResolvedValue(1);

      const result = await service.findAll({}, false);

      expect(result.data).toEqual(products);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should apply pagination correctly', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(25);

      const result = await service.findAll({ page: 2, limit: 10 }, false);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
      expect(result.meta.page).toBe(2);
      expect(result.meta.totalPages).toBe(3);
    });

    it('should filter by category', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({ category: 'Ropa' }, false);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'Ropa' }),
        }),
      );
    });

    it('should filter by price range', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({ minPrice: 10000, maxPrice: 50000 }, false);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: { gte: 10000, lte: 50000 },
          }),
        }),
      );
    });

    it('should search in title and description', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({ search: 'polera' }, false);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'polera', mode: 'insensitive' } },
              { description: { contains: 'polera', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });

    it('should only show active products for non-admin users', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({}, false);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ active: true }),
        }),
      );
    });

    it('should show all products for admin users', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({}, true);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({ active: true }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return the product when found', async () => {
      const product = { id: 'p1', title: 'Polera', active: true };
      mockPrismaService.product.findUnique.mockResolvedValue(product);

      const result = await service.findOne('p1', false);

      expect(result).toEqual(product);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid', false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for inactive products when user is not admin', async () => {
      const product = { id: 'p1', title: 'Polera', active: false };
      mockPrismaService.product.findUnique.mockResolvedValue(product);

      await expect(service.findOne('p1', false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return inactive products when user is admin', async () => {
      const product = { id: 'p1', title: 'Polera', active: false };
      mockPrismaService.product.findUnique.mockResolvedValue(product);

      const result = await service.findOne('p1', true);

      expect(result).toEqual(product);
    });
  });

  describe('update', () => {
    it('should update and return the product', async () => {
      const existing = { id: 'p1', title: 'Polera', active: true };
      const updated = { ...existing, title: 'Polera nueva' };
      mockPrismaService.product.findUnique.mockResolvedValue(existing);
      mockPrismaService.product.update.mockResolvedValue(updated);

      const result = await service.update('p1', { title: 'Polera nueva' });

      expect(result).toEqual(updated);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { title: 'Polera nueva' },
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.update('invalid', { title: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete the product', async () => {
      const existing = { id: 'p1', title: 'Polera', active: true };
      mockPrismaService.product.findUnique.mockResolvedValue(existing);
      mockPrismaService.product.delete.mockResolvedValue(existing);

      await service.remove('p1');

      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: 'p1' },
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.remove('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
