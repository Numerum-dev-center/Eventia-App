import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UtilisateurService } from 'src/utilisateur/utilisateur.service';
import { JwtPayload } from './interfaces/jwt-payload.interface'; // Ton interface
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UtilisateurService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'default_secret',
    });
  }

  // TypeScript sait maintenant exactement ce qu'il y a dans le payload
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // Utilise le bon champ selon ton interface (ex: payload.email)
    const user = await this.userService.findByEmail(payload.email);
    
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }
    
    // Retourner l'utilisateur permet de le retrouver dans req.user
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}