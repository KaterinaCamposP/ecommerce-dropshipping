import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { createHash } from 'node:crypto';
import type { AuthUser } from '../common/interfaces/request-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import {
  mockPrismaService,
  resetPrismaMock,
} from '../../test/helpers/mock-prisma';
import { TokensService } from './tokens.service';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('TokensService', () => {
  let service: TokensService;
  let jwtService: JwtService;

  const configService = {
    get: jest.fn((_key: string, fallback?: string) => fallback),
  };

  const user: AuthUser = {
    id: 'user-1',
    email: 'kate@test.com',
    name: 'K',
    role: 'CLIENTE',
    passwordHash: 'hash',
  };

  beforeEach(async () => {
    resetPrismaMock();
    configService.get.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-access-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [
        TokensService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(TokensService);
    jwtService = module.get(JwtService);
  });

  describe('issueTokens', () => {
    it('should return a verifiable access token, a raw refresh token and a sanitized user', async () => {
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.issueTokens(user);

      // Access token verificable con el secreto de test
      const payload = await jwtService.verifyAsync<{
        sub: string;
        email: string;
        role: string;
      }>(result.accessToken);
      expect(payload.sub).toBe(user.id);
      expect(payload.email).toBe(user.email);
      expect(payload.role).toBe(user.role);

      // Refresh token crudo: 128 caracteres hex
      expect(result.refreshToken).toMatch(/^[a-f0-9]{128}$/);

      // Usuario sin passwordHash
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user.email).toBe(user.email);
    });

    it('should store the refresh token hashed with SHA-256', async () => {
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.issueTokens(user);

      const createArg = mockPrismaService.refreshToken.create.mock.calls[0][0];
      expect(createArg.data.tokenHash).toBe(sha256(result.refreshToken));
      expect(createArg.data.userId).toBe(user.id);
      expect(createArg.data.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('rotate', () => {
    it('should revoke the old token and issue new tokens', async () => {
      const raw = 'a'.repeat(128);
      const stored = {
        id: 'rt-1',
        userId: user.id,
        tokenHash: sha256(raw),
        expiresAt: new Date(Date.now() + 86_400_000),
        revokedAt: null,
      };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(stored);
      mockPrismaService.refreshToken.update.mockResolvedValue({
        ...stored,
        revokedAt: new Date(),
      });
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(user);
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.rotate(raw);

      expect(mockPrismaService.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'rt-1' },
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
      });
      expect(result.refreshToken).not.toBe(raw);
      expect(result.accessToken).toBeDefined();
    });

    it('should reject an unknown refresh token', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.rotate('unknown-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject a revoked refresh token', async () => {
      const raw = 'b'.repeat(128);
      mockPrismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-2',
        userId: user.id,
        tokenHash: sha256(raw),
        expiresAt: new Date(Date.now() + 86_400_000),
        revokedAt: new Date(),
      });

      await expect(service.rotate(raw)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject an expired refresh token', async () => {
      const raw = 'c'.repeat(128);
      mockPrismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-3',
        userId: user.id,
        tokenHash: sha256(raw),
        expiresAt: new Date(Date.now() - 1000),
        revokedAt: null,
      });

      await expect(service.rotate(raw)).rejects.toThrow(UnauthorizedException);
    });
  });
});
