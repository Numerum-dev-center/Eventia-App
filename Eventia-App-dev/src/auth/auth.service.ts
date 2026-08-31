import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express'; // Import crucial
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { SessionsTokenService } from './sessions-jetons/sessions-token.service';
import { comparePassword } from './auth.utils';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Role } from 'src/common/role.enum';
import { RegisterDto } from 'src/user/dto/register.dto';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
      throw new BadRequestException('Passwords do not match. Please ensure "password" and "confirmPassword" are identical.');
    }

    // 2. Appel à ton service User
    // Note : UserService doit maintenant accepter cet objet (email + mdp)
    const newUser = await this.userService.register(dto, role);

    // 3. Demande de code d'activation
    await this.userService.requestActivationToken(newUser.id);
    
    return { 
      message: 'Account created successfully. Please check your email for the verification code.' 
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
    if (!user) throw new UnauthorizedException('Invalid email or password. No account found with this email.');

    if (user.authProvider === 'google') {
    throw new UnauthorizedException('This account is linked to Google. Please use "Login with Google" instead.');
    }

    const isPasswordValid = await comparePassword(loginDto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid email or password. The password is incorrect.');

    // Bloquer les comptes actifs. Un compte inactif = inscription non activée via email
    if (!user.isActive) {
      throw new UnauthorizedException('Account not activated. Please check your email for the activation link.');
    }

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
      message: 'Login successful',
      email: user.email,
      role: user.role,
      accessToken, 
      refreshToken 
    };
  }

  async activateUser(token: string, req: Request) {
  // 1. Chercher l'User avec le token
  const user = await this.userRepository.findOne({ where: { activationToken: token } });

  if (!user) {
    throw new BadRequestException('Invalid or expired activation token. Please request a new one.');
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
        throw new UnauthorizedException('Invalid or revoked session. Please log in again.');
      }

      // 3. Vérifier si la session n'est pas expirée
      if (new Date() > session.expirationDate) {
        throw new UnauthorizedException('Session expired. Please log in again.');
      }

      // 4. Générer un nouveau Access Token (et optionnellement un nouveau Refresh Token)
      const newAccessToken = await this.jwtService.signAsync({ 
        email: payload.email, 
        sub: payload.sub 
      }, { expiresIn: '15m' });

      return { accessToken: newAccessToken };
      
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token. The token is malformed or expired.');
    }
 }

  async logout(userId: string): Promise<void> {
    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException('User not found. Unable to logout.');
    await this.sessionsService.removeAllByUser(userId);
  }
}
