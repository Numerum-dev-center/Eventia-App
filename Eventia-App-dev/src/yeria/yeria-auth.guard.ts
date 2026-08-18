import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { YeriaApp, YeriaTokenClaims } from '@numerum-tech/yeriasdk';
import { YERIA_APP } from './yeria.constants';

/**
 * Garde les routes accessibles depuis l'application Yeria :
 * vérifie le jeton Yeria du porteur (Bearer) si présent. Sans jeton,
 * l'accès reste ouvert (phase de développement) mais l'utilisateur est inconnu.
 */
@Injectable()
export class YeriaAuthGuard implements CanActivate {
  constructor(@Inject(YERIA_APP) private readonly app: YeriaApp) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return true;
    }

    const token = authHeader.slice('Bearer '.length).trim();
    try {
      request.yeriaUser = (await this.app.verifyUserToken(
        token,
      )) as YeriaTokenClaims;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired Yeria token.');
    }
  }
}
