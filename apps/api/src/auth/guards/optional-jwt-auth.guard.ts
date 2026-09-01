import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Si no hay token (o es inválido), no lanza error:
  // la request continúa como anónima (user = null).
  handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    return user ?? (null as unknown as TUser);
  }
}
