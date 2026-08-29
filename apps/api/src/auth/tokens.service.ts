import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import { AuthUser } from '../common/interfaces/request-user.interface';
import { sanitizeUser } from '../common/utils/sanitize-user';
import { PrismaService } from '../prisma/prisma.service';

function expiresInToMs(value: string, fallback: number): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) return fallback;
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return parseInt(match[1], 10) * multipliers[match[2]];
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

@Injectable()
export class TokensService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async issueTokens(user: AuthUser) {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: sanitizeUser(user),
    };
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const rawToken = randomBytes(64).toString('hex');
    const tokenHash = sha256(rawToken);

    const ttl = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const expiresAt = new Date(Date.now() + expiresInToMs(ttl, 7 * 86_400_000));

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return rawToken;
  }

  async rotate(rawToken: string) {
    const tokenHash = sha256(rawToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!stored || stored.revokedAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Rotación: el token usado se revoca y se emite uno nuevo
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: stored.userId },
    });

    return this.issueTokens(user as AuthUser);
  }
}
