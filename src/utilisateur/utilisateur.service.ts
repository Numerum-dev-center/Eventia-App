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
import { Utilisateur } from './entities/utilisateur.entity';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import { MailService } from 'src/mail/mail.service';
import { VerifyResetCodeDto } from 'src/utilisateur/dto/verify-reset-code.dto';

@Injectable()
export class UtilisateurService {
  private readonly logger = new Logger(UtilisateurService.name);

  constructor(
    @InjectRepository(Utilisateur)
    private utilisateurRepository: Repository<Utilisateur>,
    private readonly mailService: MailService,
  ) {}

  // --- INSCRIPTION ---
  async inscription(dto: CreateUtilisateurDto): Promise<Utilisateur> {
    // 1. Vérifier si l'email est déjà utilisé
    const emailExiste = await this.utilisateurRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (emailExiste) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    try {
      // 2. Créer l'entité
      const utilisateur = this.utilisateurRepository.create({
        ...dto,
        email: dto.email.toLowerCase(),
      });

      // 3. Hasher le mot de passe avant de sauvegarder
      const salt = await bcrypt.genSalt();
      utilisateur.motDePasse = await bcrypt.hash(dto.motDePasse, salt);

      // 4. Par défaut, utilisateur inactif (à activer plus tard)
      utilisateur.estActif = false;

      return await this.utilisateurRepository.save(utilisateur);
    } catch (error) {
      this.logger.error('Erreur inscription:', error);
      throw new InternalServerErrorException(
        'Erreur lors de la création du compte',
      );
    }
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

  async update(
    id: string,
    updateUtilisateurDto: UpdateUtilisateurDto,
  ): Promise<Utilisateur> {
    const utilisateur = await this.findOne(id);

    // Si un nouveau mot de passe est fourni, on le re-hache
    if (updateUtilisateurDto.motDePasse) {
      const salt = await bcrypt.genSalt();
      updateUtilisateurDto.motDePasse = await bcrypt.hash(
        updateUtilisateurDto.motDePasse,
        salt,
      );
    }

    Object.assign(utilisateur, updateUtilisateurDto);
    return await this.utilisateurRepository.save(utilisateur);
  }

  async delete(id: string): Promise<void> {
    const utilisateur = await this.findOne(id);
    await this.utilisateurRepository.remove(utilisateur);
  }
}
