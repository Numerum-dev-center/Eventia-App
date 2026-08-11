import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express'; // Import crucial
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { SessionsTokenService } from './sessions-token/sessions-token.service';
import { comparePassword } from './auth.utils';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Role } from 'src/common/role.enum';
import { RegisterDto } from 'src/user/dto/register.dto';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsTokenService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    
  ) {}

  private readonly ADMIN_EMAILS = ['admin1@tonsite.com', 'admin2@tonsite.com'];

  async register(dto: RegisterDto, role: Role) {
    // 1. Vérification basique de sécurité
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    // 2. Appel à ton service User
    // Note : UserService doit maintenant accepter cet objet (email + mdp)
    const newUser = await this.userService.register(dto, role);

    // 3. Demande de code d'activation
    await this.userService.requestActivationToken(newUser.id);
    
    return { 
      message: 'Compte créé avec succès. Veuillez vérifier votre email pour le code de validation.' 
    };
  }

  async validateGoogleUser(googleUser: any) {
  let user = await this.userService.findByEmail(googleUser.email);
  
  if (user) {
    // SCÉNARIO : L'User existe déjà.
    // S'il est un User 'google' pur, on continue.
    // S'il est un User 'local', on le laisse se connecter via Google.
    // Tu peux mettre à jour son authProvider en 'both' si tu veux être précis.
    return user;
  }

  // SCÉNARIO : Nouvel User (Inconnu de la base)
  const role = this.determineRole(googleUser.email);
  
  return await this.userService.createGoogleUser({
    email: googleUser.email,
    firstName: googleUser.lastName,
    lastName: googleUser.firstName,
    role: role,
    isActive: true,
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

    const isPasswordValid = await comparePassword(loginDto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Identifiants incorrects');

    // 2. Typage explicite du payload
    const payload: JwtPayload = { email: user.email, sub: user.id };

    // Access Token (court)
    const accessToken = this.jwtService.sign(payload, { expiresIn: '24h' });

    // Refresh Token (long) - On le signe avec une clé différente ou un flag 'refresh'
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

   

    await this.sessionsService.create({
      userId: user.id,
      refreshTokenHash: refreshToken,
      deviceInfo: req.headers['user-agent'] ?? 'inconnu',
      ipAdress: req.ip ?? '0.0.0.0',
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { 
      message: 'Connexion réussie',
      email: user.email,
      role: user.role,
      accessToken, 
      refreshToken 
    };
  }

  async loginAdmin(dto: LoginDto, req: Request, res: Response) {
  // 1. Chercher l'utilisateur par email
  const user = await this.userRepository.findOne({ where: { email: dto.email } });

  if (!user) {
    throw new UnauthorizedException('Identifiants invalides.');
  }

  // 2. Vérifier si c'est bien un ADMIN
  if (user.role !== Role.ADMIN) {
    throw new ForbiddenException("Accès refusé. Vous n'êtes pas administrateur.");
  }

  // 3. Vérifier le mot de passe avec bcrypt
  const isPasswordValid = await bcrypt.compare(dto.password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedException('Identifiants invalides.');
  }

  // 4. Générer les tokens (en incluant le rôle dans le payload du JWT)
  const payload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
  const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

  // 5. Sauvegarder la session et envoyer les cookies (comme pour l'user classique)
  await this.sessionsService.create({
    userId: user.id,
    refreshTokenHash: refreshToken,
    deviceInfo: req.headers['user-agent'] ?? 'inconnu',
    ipAdress: req.ip ?? '0.0.0.0',
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'none' });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'none' });

  return { 
    message: 'Connexion admin réussie', 
    accessToken,
    refreshToken,
    email: user.email,
    role: user.role,
   };
}

  async activateUser(token: string, req: Request) {
  // 1. Chercher l'User avec le token
  const user = await this.userRepository.findOne({ where: { activationToken: token } });

  if (!user) {
    throw new BadRequestException("Jeton d'activation invalide ou expiré.");
  }

  // 2. Activer le compte et vider le token
  user.isActive = true;
  user.activationToken = null; 
  await this.userRepository.save(user);

  // 3. Utiliser ta fonction existante pour générer les tokens et créer la session
  return this.generateTokens(user, req);
}

  async generateTokens(user: any, req: Request) {
  const payload = { sub: user.id, email: user.email };

  // 1. Génération des tokens
  const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
  const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

  // 2. Enregistrer le Refresh Token en base de données
  await this.sessionsService.create({
    userId: user.id,
    refreshTokenHash: refreshToken,
    deviceInfo: req.headers['user-agent'] ?? 'inconnu',
    ipAdress: req.ip ?? '0.0.0.0',
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
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
      if (new Date() > session.expirationDate) {
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
    if (!user) throw new NotFoundException('User introuvable');
    await this.sessionsService.removeAllByUser(userId);
  }
}
