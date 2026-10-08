import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const sessionId = request.headers['x-session-id'];
    return typeof sessionId === 'string' && sessionId.length > 0
      ? sessionId
      : undefined;
  },
);
