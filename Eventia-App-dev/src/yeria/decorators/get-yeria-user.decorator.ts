import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { YeriaTokenClaims } from '@numerum-tech/yeriasdk';

export const GetYeriaUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): YeriaTokenClaims | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.yeriaUser;
  },
);
