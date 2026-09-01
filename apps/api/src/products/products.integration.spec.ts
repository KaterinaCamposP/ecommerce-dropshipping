import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../../test/helpers/create-test-app';
import {
  mockPrismaService,
  resetPrismaMock,
} from '../../test/helpers/mock-prisma';

describe('Products (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
  });

  beforeEach(() => {
    resetPrismaMock();
  });

  afterAll(async () => {
    await app.close();
  });

  const now = new Date();
  const baseProduct = {
    id: 'p1',
    dropiProductId: null,
    title: 'Polera',
    description: 'Algodón',
    price: 19990,
    stock: 10,
    imageUrl: null,
    category: 'Ropa',
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  async function registerUser(role: 'ADMIN' | 'CLIENTE'): Promise<string> {
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    mockPrismaService.user.create.mockImplementation(({ data }) => ({
      id: `u-${role}`,
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
      googleId: null,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    mockPrismaService.refreshToken.create.mockResolvedValue({});

    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: `${role} user`,
        email: `${role.toLowerCase()}@test.com`,
        password: 'StrongPass123',
      });

    return res.body.accessToken;
  }

  describe('public access', () => {
    it('GET /api/products — 200 with pagination meta', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/api/products')
        .expect(200);

      expect(res.body.meta).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });

    it('GET /api/products/:id — 404 when not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer()).get('/api/products/nope').expect(404);
    });
  });

  describe('role protection', () => {
    it('POST /api/products — 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/products')
        .send({ title: 'X', price: 100, stock: 1 })
        .expect(401);
    });

    it('POST /api/products — 403 with CLIENTE token', async () => {
      const token = await registerUser('CLIENTE');

      await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'X', price: 100, stock: 1 })
        .expect(403);
    });

    it('POST /api/products — 400 with invalid body (ADMIN)', async () => {
      const token = await registerUser('ADMIN');

      await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ price: -5 })
        .expect(400);
    });

    it('POST /api/products — 201 with ADMIN token', async () => {
      const token = await registerUser('ADMIN');
      mockPrismaService.product.create.mockImplementation(({ data }) => ({
        ...baseProduct,
        ...data,
      }));

      const res = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Polera', price: 19990, stock: 10, category: 'Ropa' })
        .expect(201);

      expect(res.body.title).toBe('Polera');
      expect(res.body.active).toBe(true);
    });
  });

  describe('admin CRUD flow', () => {
    let adminToken: string;

    beforeEach(async () => {
      adminToken = await registerUser('ADMIN');
    });

    it('PATCH /api/products/:id — 200 updates the product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(baseProduct);
      mockPrismaService.product.update.mockImplementation(({ data }) => ({
        ...baseProduct,
        ...data,
      }));

      const res = await request(app.getHttpServer())
        .patch('/api/products/p1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stock: 5 })
        .expect(200);

      expect(res.body.stock).toBe(5);
    });

    it('DELETE /api/products/:id — 403 with CLIENTE token', async () => {
      const clienteToken = await registerUser('CLIENTE');

      await request(app.getHttpServer())
        .delete('/api/products/p1')
        .set('Authorization', `Bearer ${clienteToken}`)
        .expect(403);
    });

    it('DELETE /api/products/:id — 204 with ADMIN token', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(baseProduct);
      mockPrismaService.product.delete.mockResolvedValue(baseProduct);

      await request(app.getHttpServer())
        .delete('/api/products/p1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });
  });

  describe('inactive products visibility', () => {
    const inactive = { ...baseProduct, active: false };

    it('GET /api/products/:id — 404 for inactive product without token', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(inactive);

      await request(app.getHttpServer()).get('/api/products/p1').expect(404);
    });

    it('GET /api/products/:id — 200 for inactive product with ADMIN token', async () => {
      const token = await registerUser('ADMIN');
      mockPrismaService.product.findUnique.mockResolvedValue(inactive);

      const res = await request(app.getHttpServer())
        .get('/api/products/p1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.active).toBe(false);
    });
  });
});
