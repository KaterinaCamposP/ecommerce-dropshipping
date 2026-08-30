import type { ExecutionContext } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from '../strategies/jwt.strategy';

describe('JwtAuthGuard', () => {
  it('should delegate to the passport jwt base guard', () => {
    const guard = new JwtAuthGuard();
    const spy = jest
      .spyOn(Object.getPrototypeOf(guard), 'canActivate')
      .mockReturnValue(true);

    const context = {} as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
    expect(spy).toHaveBeenCalledWith(context);
  });
});

describe('JwtStrategy', () => {
  it('should map the JWT payload to the request user', () => {
    const configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;

    const strategy = new JwtStrategy(configService);

    const result = strategy.validate({
      sub: 'user-1',
      email: 'kate@test.com',
      role: 'CLIENTE',
    });

    expect(result).toEqual({
      id: 'user-1',
      email: 'kate@test.com',
      role: 'CLIENTE',
    });
  });
});
