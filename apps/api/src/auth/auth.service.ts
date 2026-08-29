import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
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

  async login(user: AuthUser) {
    return this.tokensService.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    return this.tokensService.rotate(refreshToken);
  }
}
