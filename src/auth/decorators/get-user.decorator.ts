import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Utilisateur } from '../../utilisateur/entities/utilisateur.entity';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Utilisateur => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);