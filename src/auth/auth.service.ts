import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express'; // Import crucial
import { UtilisateurService } from 'src/utilisateur/utilisateur.service';
import { JwtService } from '@nestjs/jwt';
import { SessionsJetonsService } from './sessions-jetons/sessions-jetons.service';
import { comparePassword } from './auth.utils';
import { CreateUtilisateurDto } from '../utilisateur/dto/create-utilisateur.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UtilisateurService,
    private readonly sessionsService: SessionsJetonsService,
    
  ) {}

  async register(dto: CreateUtilisateurDto) {
    const newUser = await this.userService.inscription(dto);
    await this.userService.requestActivationCode(newUser.id);
    return { message: 'Utilisateur créé, veuillez vérifier votre mail pour le code.' };
  }

  // 1. Typage strict de 'req' avec l'interface Request d'Express
  async login(loginDto: LoginDto, req: Request) {
    const user = await this.userService.loadByUsername(loginDto.email.toLowerCase());
    if (!user) throw new UnauthorizedException('Identifiants incorrects');

    const isPasswordValid = await comparePassword(loginDto.motDePasse, user.motDePasse);
    if (!isPasswordValid) throw new UnauthorizedException('Identifiants incorrects');

    // 2. Typage explicite du payload
    const payload: JwtPayload = { email: user.email, sub: user.id };

    // Access Token (court)
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    // Refresh Token (long) - On le signe avec une clé différente ou un flag 'refresh'
  const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

   

    await this.sessionsService.create({
      utilisateur_id: user.id,
      refresh_token_hash: refreshToken,
      appareilInfo: req.headers['user-agent'] ?? 'inconnu',
      adresseIp: req.ip ?? '0.0.0.0',
      dateExpiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken };
  }

async refreshTokens(refreshToken: string) {
  try {
    // 1. Vérifier si le token est valide (signature et expiration)
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_SECRET,
    });

    // 2. Vérifier si ce refresh token existe dans la base de données
    const session = await this.sessionsService.findByToken(refreshToken);
    
    if (!session) {
      throw new UnauthorizedException('Session invalide ou déjà révoquée');
    }

    // 3. Vérifier si la session n'est pas expirée
    if (new Date() > session.dateExpiration) {
      throw new UnauthorizedException('Session expirée, veuillez vous reconnecter');
    }

    // 4. Générer un nouveau Access Token (et optionnellement un nouveau Refresh Token)
    const newAccessToken = await this.jwtService.signAsync({ 
      email: payload.email, 
      sub: payload.sub 
    }, { expiresIn: '15m' });

    return { accessToken: newAccessToken };
    
  } catch (err) {
    throw new UnauthorizedException('Token de rafraîchissement invalide');
  }
}

  async logout(userId: string): Promise<void> {
    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    await this.sessionsService.removeAllByUser(userId);
  }
}
