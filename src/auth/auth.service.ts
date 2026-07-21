import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express'; // Import crucial
import { UtilisateurService } from 'src/utilisateur/utilisateur.service';
import { JwtService } from '@nestjs/jwt';
import { SessionsJetonsService } from './sessions-jetons/sessions-jetons.service';
import { comparePassword } from './auth.utils';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Role } from 'src/common/role.enum';
import { InscriptionDto } from 'src/utilisateur/dto/inscription.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UtilisateurService,
    private readonly sessionsService: SessionsJetonsService,
    
  ) {}

  private readonly ADMIN_EMAILS = ['admin1@tonsite.com', 'admin2@tonsite.com'];

  async register(dto: InscriptionDto, role: Role) {
    // 1. Vérification basique de sécurité
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    // 2. Appel à ton service utilisateur
    // Note : UserService doit maintenant accepter cet objet (email + mdp)
    const newUser = await this.userService.inscription(dto, role);

    // 3. Demande de code d'activation
    await this.userService.requestActivationToken(newUser.id);
    
    return { 
      message: 'Compte créé avec succès. Veuillez vérifier votre email pour le code de validation.' 
    };
  }

  async validateGoogleUser(googleUser: any) {
  let user = await this.userService.findByEmail(googleUser.email);
  
  if (user) {
    // SCÉNARIO : L'utilisateur existe déjà.
    // S'il est un utilisateur 'google' pur, on continue.
    // S'il est un utilisateur 'local', on le laisse se connecter via Google.
    // Tu peux mettre à jour son authProvider en 'both' si tu veux être précis.
    return user;
  }

  // SCÉNARIO : Nouvel utilisateur (Inconnu de la base)
  const role = this.determineRole(googleUser.email);
  
  return await this.userService.createGoogleUser({
    email: googleUser.email,
    nom: googleUser.lastName,
    prenoms: googleUser.firstName,
    role: role,
    estActif: true,
    AuthProvider: 'google', // Il est créé spécifiquement comme un compte Google
  });
}

// Fonction utilitaire pour décider du rôle
private determineRole(email: string): Role {
  if (this.ADMIN_EMAILS.includes(email)) {
    return Role.ADMIN;
  }
  
  return Role.CLIENT; // Par défaut
}


  // 1. Typage strict de 'req' avec l'interface Request d'Express
  async login(loginDto: LoginDto, req: Request) {
    const user = await this.userService.loadByUsername(loginDto.email.toLowerCase());
    if (!user) throw new UnauthorizedException('Identifiants incorrects');

    if (user.authProvider === 'google') {
    throw new UnauthorizedException('Ce compte est lié à Google. Utilisez le bouton "Connexion avec Google".');
    }

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

  async generateTokens(user: any, req: Request) {
  const payload = { sub: user.id, email: user.email };

  // 1. Génération des tokens
  const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
  const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

  // 2. Enregistrer le Refresh Token en base de données
  await this.sessionsService.create({
    utilisateur_id: user.id,
    refresh_token_hash: refreshToken,
    appareilInfo: req.headers['user-agent'] ?? 'inconnu',
      adresseIp: req.ip ?? '0.0.0.0',
    dateExpiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
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
