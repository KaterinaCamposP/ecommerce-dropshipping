import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { Profile } from 'passport-google-oauth20';
import { AuthUser } from '../common/interfaces/request-user.interface';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { TokensService } from './tokens.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createWithPassword({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    return this.tokensService.issueTokens(user as AuthUser);
  }

  async validateLocal(email: string, password: string): Promise<AuthUser> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user as AuthUser;
  }

  async findOrCreateGoogleUser(profile: Profile): Promise<AuthUser> {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName || 'Google User';

    if (!email) {
      throw new UnauthorizedException('Google profile has no email');
    }

    // 1) Si ya existe cuenta vinculada a ese googleId, la usa
    const byGoogleId = await this.usersService.findByGoogleId(googleId);
    if (byGoogleId) {
      return byGoogleId as AuthUser;
    }

    // 2) Si existe cuenta local con ese email, la vincula
    const byEmail = await this.usersService.findByEmail(email);
    if (byEmail) {
      const linked = await this.usersService.linkGoogleId(byEmail.id, googleId);
      return linked as AuthUser;
    }

    // 3) Si no existe, crea cuenta nueva sin contraseña
    const created = await this.usersService.createWithGoogle({
      name,
      email,
      googleId,
    });
    return created as AuthUser;
  }

  async login(user: AuthUser) {
    return this.tokensService.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    return this.tokensService.rotate(refreshToken);
  }
}
