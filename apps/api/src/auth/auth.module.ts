import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { TokensService } from './tokens.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_ACCESS_SECRET');
        if (!secret) {
          throw new Error(
            'JWT_ACCESS_SECRET is not defined in environment variables',
          );
        }
        return {
          secret,
          signOptions: {
            expiresIn: configService.get('JWT_ACCESS_EXPIRES_IN', '1h'),
          },
        };
      },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokensService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
