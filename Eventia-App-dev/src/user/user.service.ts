import { AuthProvider } from '../common/auth-provider.enum';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { MailService } from 'src/mail/mail.service';
import { VerifyResetCodeDto } from 'src/user/dto/verify-reset-code.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from 'src/common/role.enum';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';
import { OrganizerProfile } from 'src/organizer-profile/entities/organizer-profile.entity';
import { BaseUpdateProfileDto } from './dto/base-update-profile.dto';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(OrganizerProfile)
    private profilOrgRepository: Repository<OrganizerProfile>,
  ) {}

  // --- INSCRIPTION ---
  async register(dto: RegisterDto, role: Role): Promise<User> {
    // 1. Vérifier si l'email est déjà utilisé
    const emailExists = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (emailExists) {
      throw new ConflictException('This email is already registered. Please use a different email or log in.');
    }

    try {
    // 2. Hasher le mot de passe avant création
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // 3. Créer l'entité avec les valeurs par défaut
    // Ici, on initialise uniquement ce qu'on a. 
    // Les autres champs (nom, prenoms, etc.) seront remplis via le PATCH plus tard.
    const user = this.userRepository.create({
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      isActive: false, // Inactif par défaut
      role: role, // Role par défaut
      // Initialise les champs qui sont obligatoires dans ta DB avec des valeurs vides
      // Si ton entité les accepte en 'nullable', tu peux les laisser à null ou ommettre ces lignes.
      firstName: '', 
      lastName: '',
    });

    return await this.userRepository.save(user);
  }catch (error) {
      this.logger.error('Registration error:', error);
      throw new InternalServerErrorException(
        'Failed to create account. Please try again later.',
      );
    }
  }

  async createGoogleUser(userData: { 
  email: string; 
  lastName: string; 
  firstName: string; 
  role: Role; 
  isActive: boolean; 
  AuthProvider: string;
}) {
  // 1. Générer un mot de passe aléatoire très fort (on ne l'utilisera jamais)
  const randomPassword = crypto.randomBytes(32).toString('hex');
  
  // 2. Hasher ce mot de passe
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(randomPassword, salt);

  // 3. Créer l'entité
  const newUser = this.userRepository.create({
    ...userData,
    password: hashedPassword, // Obligatoire pour la base de données
    // Si tu as un champ pour suivre la méthode d'inscription, c'est le moment :
    // authProvider: 'google', 
  });

  // 4. Sauvegarder
  return await this.userRepository.save(newUser);
}

// --- GÉNÉRATION DU TOKEN ET DU LIEN ---
async requestActivationToken(userId: string) {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) return;

  // Générer un token unique sécurisé
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date();
  expires.setHours(expires.getHours() + 24); // Le lien expire dans 24 heures

  // Sauvegarder le token en base
  await this.userRepository.update(userId, {
    activationToken: token,
    activationTokenExpires: expires,
  });

  const backendUrl = this.configService.get<string>('BACKEND_URL');
  const activationLink = `${backendUrl}/auth/activate?token=${token}`;

  // Envoyer l'e-mail avec le lien (non bloquant si Brevo non configuré)
  try {
    await this.mailService.sendActivationEmail(user.email, activationLink);
  } catch (error) {
    this.logger.warn(`Could not send activation email to ${user.email}: ${error.message}. Token: ${token}`);
  }
}

// --- VALIDATION DU COMPTE VIA LE TOKEN ---
async activateByToken(token: string) {
  const user = await this.userRepository.findOne({
    where: { activationToken: token },
  });

  if (!user) {
    throw new BadRequestException('Invalid activation link. No account found.');
  }

  if (user.activationTokenExpires && new Date() > user.activationTokenExpires) {
    throw new BadRequestException('Activation link has expired. Please request a new one.');
  }

  // 1. Activer le compte et nettoyer le token
  user.isActive = true;
  user.activationToken = null;
  user.activationTokenExpires = null;
  await this.userRepository.save(user);

  // 2. Générer le JWT pour connecter l'user immédiatement
  const payload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = this.jwtService.sign(payload); // Assure-toi d'injecter JwtService

  // 3. Retourner le token et les infos au Front-end
  return {
    message: 'Account activated successfully!',
    access_token: accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

  async requestActivationCode(id: string) {
    const user = await this.findOne(id);

    // 1. Génération
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Durée de validité
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 15);

    // 2. Sauvegarde en base
    user.twoFASecretCode = code;
    await this.userRepository.save(user);

    await this.userRepository.update(id, {
    twoFASecretCode: code,
    dateExpirationCode: expiration,
  });

    // 3. Appel du service mail (non bloquant)
    try {
      await this.mailService.sendActivationCode(user.email, user.lastName, code);
    } catch (error) {
      this.logger.warn(`Could not send activation code to ${user.email}: ${error.message}`);
    }
  }

  // --- ACTIVATION ---
  async verifyActivation(userId: string, submittedCode: string) {
  const user = await this.userRepository.findOne({ where: { id: userId } });

  if (!user || user.twoFASecretCode !== submittedCode) {
    throw new BadRequestException('Invalid activation code. Please check the code sent to your email.');
  }

  if (user.dateExpirationCode && new Date() > user.dateExpirationCode) {
    throw new BadRequestException('Activation code has expired. Please request a new one.');
  }

  // Tout est bon, on active le compte
  await this.userRepository.update(userId, { isActive: true });
}

// MOT DE PASSE OUBLIÉ 
// ÉTAPE 1 : Demande de réinitialisation (envoi du code)
  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
  if (!user) throw new NotFoundException('No account found with this email address.');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 15); // Code valide 15 min

    await this.userRepository.update(user.id, { resetPasswordCode: code, resetPasswordExpires: expiration });
    try {
      await this.mailService.sendCodeResetEmail(user.email, code);
    } catch (error) {
      this.logger.warn(`Could not send reset code to ${user.email}: ${error.message}`);
    }
  }

  // ÉTAPE 2 : Vérification du code
  async verifyCode(email: string, code: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (
        !user || 
        user.twoFASecretCode !== code || 
        !user.dateExpirationCode || // 1. Vérifie si le champ est null ou undefined
        new Date() > user.dateExpirationCode // 2. Maintenant TypeScript sait que c'est une Date
        ) {
      throw new BadRequestException('Invalid or expired verification code. Please check the code or request a new one.');
    }
    return true;
  }

  async verifyPasswordResetCode(dto: VerifyResetCodeDto) {
  const user = await this.userRepository.findOne({ 
    where: { email: dto.email } 
  });

  console.log('Code en base:', user?.resetPasswordCode);
  console.log('Code reçu:', dto.code);
  console.log('Types:', typeof user?.resetPasswordCode, typeof dto.code);

  if (!user || user.resetPasswordCode !== dto.code) {
    throw new UnauthorizedException('Invalid reset code. Please check the code sent to your email.');
  }

  console.log('Current time (server):', new Date().toISOString());
  console.log('Expiration time in DB:', user.resetPasswordExpires?.toISOString());

  if (new Date() > user.resetPasswordExpires!) {
    throw new UnauthorizedException('Reset code has expired. Please request a new one.');
  }

  // Si tout est bon, on peut retourner un jeton temporaire ou valider l'étape
  return { message: 'Code is valid', email: user.email };
}

  async requestPasswordReset(email: string) {
  const user = await this.userRepository.findOne({ where: { email } });
  if (!user) throw new NotFoundException('No account found with this email address.');

  // Générer un code aléatoire (ex: 6 chiffres)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Stocker le code et une date d'expiration en base (ajoute ces colonnes dans ton entité User)
  user.resetPasswordCode = code;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  await this.userRepository.save(user);

  // Envoyer le mail (non bloquant)
  try {
    await this.mailService.sendCodeResetEmail(user.email, code);
  } catch (error) {
    this.logger.warn(`Could not send reset email to ${user.email}: ${error.message}`);
  }
}

  // ÉTAPE 3 : Création du nouveau mot de passe
  async resetPassword(email: string, code: string, nouveauMotDePasse: string) {
    const user = await this.userRepository.findOne({ where: { email } });

  if (!user || user.resetPasswordCode !== code || (user.resetPasswordExpires && new Date() > user.resetPasswordExpires)) {
    throw new UnauthorizedException('Invalid or expired reset code. Cannot reset password.');
  } // Double vérification

    const hashedPassword = await bcrypt.hash(nouveauMotDePasse, 10);
    
    await this.userRepository.update({ email }, { 
        password: hashedPassword, 
        twoFASecretCode: null , 
        dateExpirationCode: null,
        resetPasswordCode: null,
        resetPasswordExpires: null
    });
  }

  async resendCode(email: string) {
  // 1. On cherche l'user
  const user = await this.userRepository.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundException('No account found with this email address.');
  }

  // 2. On génère un nouveau code
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 3. On calcule une nouvelle expiration 
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 15);

  // 4. On met à jour l'user avec les nouvelles infos
  await this.userRepository.update(user.id, {
    twoFASecretCode: newCode, 
    dateExpirationCode: expiration,
  });

  // 5. On renvoie le mail (non bloquant)
  try {
    await this.mailService.sendActivationCode(user.email, user.firstName, newCode);
  } catch (error) {
    this.logger.warn(`Could not resend activation code to ${user.email}: ${error.message}`);
  }
  
  return { message: 'New verification code sent successfully to your email.' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
  // 1. Récupérer l'user en incluant explicitement le mot de passe
  // (Si ton entité a { select: false } sur le champ motDePasse, il faut le forcer ici)
  const user = await this.userRepository.findOne({
    where: { id: userId },
    select: { 
      id: true, 
      password: true 
    }, // On force la sélection du mot de passe pour la vérification
  });

  if (!user) {
    throw new NotFoundException('User account not found.');
  }

  // 2. Vérifier si l'ancien mot de passe est correct
  const isMatch = await bcrypt.compare(
    changePasswordDto.oldPassword,
    user.password,
  );

  if (!isMatch) {
    throw new BadRequestException('Current password is incorrect. Please provide the correct password.')
  }

  // 3. Hasher le nouveau mot de passe
  const salt = await bcrypt.genSalt();
  const newHashedPassword = await bcrypt.hash(changePasswordDto.newPassword, salt);

  // 4. Mettre à jour
  user.password = newHashedPassword;
  await this.userRepository.save(user);

  return { message: 'Password updated successfully.' };
  }

  // --- CRUD BASIQUE ---
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User #${id} not found.`);
    }
    return user;
  }

  // --- FIND BY EMAIL ---
  async findByEmail(email: string): Promise<User | null> {
    if (!email) {
      return null;
    }

    // On utilise findOne avec l'option where
    // On met en minuscule pour éviter les problèmes de casse (email@test.com vs EMAIL@test.com)
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    return user;
  }

  // --- LOAD USER BY USERNAME ---
  // On utilise l'email comme "username" pour la connexion
  async loadByUsername(username: string): Promise<User> {
    const user = await this.findByEmail(username);

    if (!user) {
      throw new NotFoundException(
        `No user found with the identifier: ${username}`,
      );
    }

    return user;
  }

  async updateOrganizer(userId: string, dto: UpdateOrganizerDto) {
    const { organizerProfile, ...userInfos } = dto;

    if (Object.keys(userInfos).length > 0) {
      await this.userRepository.update(userId, userInfos);
    }

    if (organizerProfile) {
      await this.profilOrgRepository
        .createQueryBuilder()
        .update(OrganizerProfile)
        .set(organizerProfile)
        .where("user_id = :id", { id: userId })
        .execute();
    }

    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: { organizerProfile: true },
    });
    return updatedUser;
  }

  async update(
    id: string,
    updateuserDto: BaseUpdateProfileDto,
  ): Promise<User> {
    const user = await this.findOne(id);
    
    Object.assign(user, updateuserDto);
    return await this.userRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async findOrganizerProfileId(userId: string): Promise<string> {
    const profile = await this.profilOrgRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!profile) {
      throw new NotFoundException('No organizer profile found for this user.');
    }
    return profile.id;
  }
}
