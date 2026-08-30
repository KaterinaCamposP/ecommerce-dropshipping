import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { createTestApp } from '../../test/helpers/create-test-app';
import {
  mockPrismaService,
  resetPrismaMock,
} from '../../test/helpers/mock-prisma';

describe('Auth (integration)', () => {
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

  // ── Register ──────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    it('201 — registers a new user and returns tokens', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockImplementation(({ data }) => ({
        id: 'u1',
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        googleId: null,
        role: 'CLIENTE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Kate',
          email: 'kate@test.com',
          password: 'StrongPass123',
        })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.email).toBe('kate@test.com');
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('400 — rejects weak password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ name: 'Kate', email: 'kate@test.com', password: 'weak' })
        .expect(400);
    });

    it('400 — rejects missing fields', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'kate@test.com' })
        .expect(400);
    });

    it('409 — rejects duplicate email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing' });

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Kate',
          email: 'kate@test.com',
          password: 'StrongPass123',
        })
        .expect(409);
    });
  });

  // ── Login ─────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    it('201 — logs in with valid credentials', async () => {
      const hash = await bcrypt.hash('StrongPass123', 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'kate@test.com',
        name: 'Kate',
        passwordHash: hash,
        googleId: null,
        role: 'CLIENTE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'kate@test.com', password: 'StrongPass123' })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('401 — rejects wrong password', async () => {
      const hash = await bcrypt.hash('StrongPass123', 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'kate@test.com',
        passwordHash: hash,
      });

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'kate@test.com', password: 'WrongPass123' })
        .expect(401);
    });

    it('401 — rejects non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nope@test.com', password: 'StrongPass123' })
        .expect(401);
    });
  });

  // ── Protected route ───────────────────────────────────

  describe('GET /api/users/me', () => {
    it('401 — rejects request without token', async () => {
      await request(app.getHttpServer()).get('/api/users/me').expect(401);
    });

    it('200 — returns user profile with valid token', async () => {
      // Register to get a valid token
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockImplementation(({ data }) => ({
        id: 'u1',
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        googleId: null,
        role: 'CLIENTE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const registerRes = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Kate',
          email: 'kate@test.com',
          password: 'StrongPass123',
        });

      // Use the token to access protected route
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'kate@test.com',
        name: 'Kate',
        passwordHash: 'hash',
        googleId: null,
        role: 'CLIENTE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${registerRes.body.accessToken}`)
        .expect(200);

      expect(res.body.email).toBe('kate@test.com');
      expect(res.body).not.toHaveProperty('passwordHash');
    });
  });

  // ── Google fallback ───────────────────────────────────

  describe('GET /api/auth/google', () => {
    it('501 — returns not implemented when google is not configured', async () => {
      await request(app.getHttpServer()).get('/api/auth/google').expect(501);
    });
  });
});
