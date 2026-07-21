import { AuthProvider } from './../common/auth-provider.enum';
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
import { Utilisateur } from './entities/utilisateur.entity';
import { MailService } from 'src/mail/mail.service';
import { VerifyResetCodeDto } from 'src/utilisateur/dto/verify-reset-code.dto';
import { InscriptionDto } from './dto/inscription.dto';
import { Role } from 'src/common/role.enum';
import { UpdateOrganisateurDto } from './dto/update-organisateur.dto';
import { ProfilOrganisateur } from 'src/profil-organisateur/entities/profil-organisateur.entity';
import { BaseUpdateProfilDto } from './dto/base-update-profil.dto';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UtilisateurService {
  private readonly logger = new Logger(UtilisateurService.name);

  constructor(
    @InjectRepository(Utilisateur)
    private utilisateurRepository: Repository<Utilisateur>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(ProfilOrganisateur)
    private profilOrgRepository: Repository<ProfilOrganisateur>,
  ) {}

  // --- INSCRIPTION ---
  async inscription(dto: InscriptionDto, role: Role): Promise<Utilisateur> {
    // 1. Vérifier si l'email est déjà utilisé
    const emailExiste = await this.utilisateurRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (emailExiste) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    try {
    // 2. Hasher le mot de passe avant création
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // 3. Créer l'entité avec les valeurs par défaut
    // Ici, on initialise uniquement ce qu'on a. 
    // Les autres champs (nom, prenoms, etc.) seront remplis via le PATCH plus tard.
    const utilisateur = this.utilisateurRepository.create({
      email: dto.email.toLowerCase(),
      motDePasse: hashedPassword,
      estActif: false, // Inactif par défaut
      role: role, // Role par défaut
      // Initialise les champs qui sont obligatoires dans ta DB avec des valeurs vides
      // Si ton entité les accepte en 'nullable', tu peux les laisser à null ou ommettre ces lignes.
      nom: '', 
      prenoms: '',
    });

    return await this.utilisateurRepository.save(utilisateur);
  }catch (error) {
      this.logger.error('Erreur inscription:', error);
      throw new InternalServerErrorException(
        'Erreur lors de la création du compte',
      );
    }
  }

  async createGoogleUser(userData: { 
  email: string; 
  nom: string; 
  prenoms: string; 
  role: Role; 
  estActif: boolean; 
  AuthProvider: string;
}) {
  // 1. Générer un mot de passe aléatoire très fort (on ne l'utilisera jamais)
  const randomPassword = crypto.randomBytes(32).toString('hex');
  
  // 2. Hasher ce mot de passe
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(randomPassword, salt);

  // 3. Créer l'entité
  const newUser = this.utilisateurRepository.create({
    ...userData,
    motDePasse: hashedPassword, // Obligatoire pour la base de données
    // Si tu as un champ pour suivre la méthode d'inscription, c'est le moment :
    // authProvider: 'google', 
  });

  // 4. Sauvegarder
  return await this.utilisateurRepository.save(newUser);
}

// --- GÉNÉRATION DU TOKEN ET DU LIEN ---
async requestActivationToken(userId: string) {
  const user = await this.utilisateurRepository.findOne({ where: { id: userId } });
  if (!user) return;

  // Générer un token unique sécurisé
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date();
  expires.setHours(expires.getHours() + 24); // Le lien expire dans 24 heures

  // Sauvegarder le token en base
  await this.utilisateurRepository.update(userId, {
    activationToken: token,
    activationTokenExpires: expires,
  });

  const frontendUrl = this.configService.get<string>('FRONTEND_URL');
  const activationLink = `${frontendUrl}/auth/activate?token=${token}`;

  // Envoyer l'e-mail avec le lien
  await this.mailService.sendActivationEmail(user.email, activationLink);
}

// --- VALIDATION DU COMPTE VIA LE TOKEN ---
async activateByToken(token: string) {
  const user = await this.utilisateurRepository.findOne({
    where: { activationToken: token },
  });

  if (!user) {
    throw new BadRequestException('Lien d’activation invalide');
  }

  if (user.activationTokenExpires && new Date() > user.activationTokenExpires) {
    throw new BadRequestException('Le lien d’activation a expiré');
  }

  // 1. Activer le compte et nettoyer le token
  user.estActif = true;
  user.activationToken = null;
  user.activationTokenExpires = null;
  await this.utilisateurRepository.save(user);

  // 2. Générer le JWT pour connecter l'utilisateur immédiatement
  const payload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = this.jwtService.sign(payload); // Assure-toi d'injecter JwtService

  // 3. Retourner le token et les infos au Front-end
  return {
    message: 'Compte activé avec succès !',
    access_token: accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

  async requestActivationCode(id: string) {
    const utilisateur = await this.findOne(id);

    // 1. Génération
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Durée de validité
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 15);

    // 2. Sauvegarde en base
    utilisateur.code2faSecret = code;
    await this.utilisateurRepository.save(utilisateur);

    await this.utilisateurRepository.update(id, {
    code2faSecret: code,
    dateExpirationCode: expiration,
  });

    // 3. Appel du service mail
    await this.mailService.sendActivationCode(utilisateur.email, utilisateur.nom, code);
  }

  // --- ACTIVATION ---
  async verifyActivation(userId: string, submittedCode: string) {
  const user = await this.utilisateurRepository.findOne({ where: { id: userId } });

  if (!user || user.code2faSecret !== submittedCode) {
    throw new BadRequestException('Code invalide');
  }

  if (user.dateExpirationCode && new Date() > user.dateExpirationCode) {
    throw new BadRequestException('Le code a expiré');
  }

  // Tout est bon, on active le compte
  await this.utilisateurRepository.update(userId, { estActif: true });
}

// MOT DE PASSE OUBLIÉ 
// ÉTAPE 1 : Demande de réinitialisation (envoi du code)
  async forgotPassword(email: string) {
    const user = await this.utilisateurRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 15); // Code valide 15 min

    await this.utilisateurRepository.update(user.id, { resetPasswordCode: code, resetPasswordExpires: expiration });
    await this.mailService.sendCodeResetEmail(user.email, code);
  }

  // ÉTAPE 2 : Vérification du code
  async verifyCode(email: string, code: string) {
    const user = await this.utilisateurRepository.findOne({ where: { email } });
    if (
        !user || 
        user.code2faSecret !== code || 
        !user.dateExpirationCode || // 1. Vérifie si le champ est null ou undefined
        new Date() > user.dateExpirationCode // 2. Maintenant TypeScript sait que c'est une Date
        ) {
      throw new BadRequestException('Code invalide ou expiré');
    }
    return true;
  }

  async verifyPasswordResetCode(dto: VerifyResetCodeDto) {
  const user = await this.utilisateurRepository.findOne({ 
    where: { email: dto.email } 
  });

  console.log('Code en base:', user?.resetPasswordCode);
  console.log('Code reçu:', dto.code);
  console.log('Types:', typeof user?.resetPasswordCode, typeof dto.code);

  if (!user || user.resetPasswordCode !== dto.code) {
    throw new UnauthorizedException('Code invalide');
  }

  console.log('Heure actuelle (serveur) :', new Date().toISOString());
  console.log('Heure expiration en base :', user.resetPasswordExpires?.toISOString());

  if (new Date() > user.resetPasswordExpires!) {
    throw new UnauthorizedException('Le code a expiré');
  }

  // Si tout est bon, on peut retourner un jeton temporaire ou valider l'étape
  return { message: 'Code valide', email: user.email };
}

  async requestPasswordReset(email: string) {
  const user = await this.utilisateurRepository.findOne({ where: { email } });
  if (!user) throw new NotFoundException('Utilisateur non trouvé');

  // Générer un code aléatoire (ex: 6 chiffres)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Stocker le code et une date d'expiration en base (ajoute ces colonnes dans ton entité User)
  user.resetPasswordCode = code;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  await this.utilisateurRepository.save(user);

  // Envoyer le mail
  await this.mailService.sendCodeResetEmail(user.email, code);
}

  // ÉTAPE 3 : Création du nouveau mot de passe
  async resetPassword(email: string, code: string, nouveauMotDePasse: string) {
    const user = await this.utilisateurRepository.findOne({ where: { email } });

  if (!user || user.resetPasswordCode !== code || (user.resetPasswordExpires && new Date() > user.resetPasswordExpires)) {
    throw new UnauthorizedException('Code invalide ou expiré');
  } // Double vérification

    const hashedPassword = await bcrypt.hash(nouveauMotDePasse, 10);
    
    await this.utilisateurRepository.update({ email }, { 
        motDePasse: hashedPassword, 
        code2faSecret: null , 
        dateExpirationCode: null,
        resetPasswordCode: null,
        resetPasswordExpires: null
    });
  }

  async resendCode(email: string) {
  // 1. On cherche l'utilisateur
  const user = await this.utilisateurRepository.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundException('Utilisateur non trouvé');
  }

  // 2. On génère un nouveau code
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 3. On calcule une nouvelle expiration 
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 15);

  // 4. On met à jour l'utilisateur avec les nouvelles infos
  await this.utilisateurRepository.update(user.id, {
    code2faSecret: newCode, 
    dateExpirationCode: expiration,
  });

  // 5. On renvoie le mail
  await this.mailService.sendActivationCode(user.email, user.nom, newCode);
  
  return { message: 'Nouveau code envoyé avec succès' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
  // 1. Récupérer l'utilisateur en incluant explicitement le mot de passe
  // (Si ton entité a { select: false } sur le champ motDePasse, il faut le forcer ici)
  const utilisateur = await this.utilisateurRepository.findOne({
    where: { id: userId },
    select: { 
      id: true, 
      motDePasse: true 
    }, // On force la sélection du mot de passe pour la vérification
  });

  if (!utilisateur) {
    throw new NotFoundException('Utilisateur introuvable');
  }

  // 2. Vérifier si l'ancien mot de passe est correct
  const isMatch = await bcrypt.compare(
    changePasswordDto.ancienMotDePasse,
    utilisateur.motDePasse,
  );

  if (!isMatch) {
    throw new BadRequestException('Mot de passe actuel incorrect');
  }

  // 3. Hasher le nouveau mot de passe
  const salt = await bcrypt.genSalt();
  const newHashedPassword = await bcrypt.hash(changePasswordDto.nouveauMotDePasse, salt);

  // 4. Mettre à jour
  utilisateur.motDePasse = newHashedPassword;
  await this.utilisateurRepository.save(utilisateur);

  return { message: 'Mot de passe mis à jour avec succès.' };
  }

  // --- CRUD BASIQUE ---
  async findAll(): Promise<Utilisateur[]> {
    return await this.utilisateurRepository.find();
  }

  async findOne(id: string): Promise<Utilisateur> {
    const utilisateur = await this.utilisateurRepository.findOne({
      where: { id },
    });
    if (!utilisateur) {
      throw new NotFoundException(`Utilisateur #${id} introuvable`);
    }
    return utilisateur;
  }

  // --- FIND BY EMAIL ---
  async findByEmail(email: string): Promise<Utilisateur | null> {
    if (!email) {
      return null;
    }

    // On utilise findOne avec l'option where
    // On met en minuscule pour éviter les problèmes de casse (email@test.com vs EMAIL@test.com)
    const utilisateur = await this.utilisateurRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    return utilisateur;
  }

  // --- LOAD USER BY USERNAME ---
  // On utilise l'email comme "username" pour la connexion
  async loadByUsername(username: string): Promise<Utilisateur> {
    const utilisateur = await this.findByEmail(username);

    if (!utilisateur) {
      throw new NotFoundException(
        `Aucun utilisateur trouvé avec l'identifiant : ${username}`,
      );
    }

    return utilisateur;
  }

  async updateOrganisateur(userId: string, dto: UpdateOrganisateurDto) {
  const { profilOrganisateur, ...userInfos } = dto;
  
  // 1. Update les infos utilisateur (nom, tel...)
  await this.utilisateurRepository.update(userId, userInfos);
  
  // 2. Update les infos profilOrganisateur
  if (profilOrganisateur) {
     await this.profilOrgRepository
      .createQueryBuilder()
      .update(ProfilOrganisateur)
      .set(profilOrganisateur) // Tes nouvelles données
      .where("utilisateur_id = :id", { id: userId }) // Ici on cible la colonne SQL
      .execute();
  }
}

  async update(
    id: string,
    updateUtilisateurDto: BaseUpdateProfilDto,
  ): Promise<Utilisateur> {
    const utilisateur = await this.findOne(id);
    
    Object.assign(utilisateur, updateUtilisateurDto);
    return await this.utilisateurRepository.save(utilisateur);
  }

  async delete(id: string): Promise<void> {
    const utilisateur = await this.findOne(id);
    await this.utilisateurRepository.remove(utilisateur);
  }
}
