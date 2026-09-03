import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { YeriaApp, YeriaTokenClaims } from '@numerum-tech/yeriasdk';
import { YERIA_APP } from './yeria.constants';

/**
 * Garde les routes accessibles depuis l'application Yeria :
 * vérifie le jeton Yeria du porteur (Bearer) si présent. Sans jeton,
 * l'accès reste ouvert (phase de développement) mais l'utilisateur est inconnu.
 *
 * Convention doc Yeria : chaque jeton reçu doit être vérifié. L'audience est
 * épinglée sur YERIA_SERVICE_ID (parfois nommé "service ID" / "expected
 * audience") lorsqu'il est configuré, ce qui rejette les jetons émis pour un
 * autre service.
 */
@Injectable()
export class YeriaAuthGuard implements CanActivate {
  constructor(
    @Inject(YERIA_APP) private readonly app: YeriaApp,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Mode strict : le jeton Yeria est obligatoire (recommandé en production,
      // conforme à la doc « chaque jeton reçu doit être vérifié »).
      if (this.config.get<string>('YERIA_REQUIRE_TOKEN') === 'true') {
        throw new UnauthorizedException('Jeton Yeria manquant');
      }
      return true;
    }

    const token = authHeader.slice('Bearer '.length).trim();

    const audience = this.config.get<string>('YERIA_SERVICE_ID') ?? undefined;

    try {
      request.yeriaUser = (await this.app.verifyUserToken(
        token,
        audience,
      )) as YeriaTokenClaims;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Jeton Yeria invalide ou expiré');
    }
  }
}
