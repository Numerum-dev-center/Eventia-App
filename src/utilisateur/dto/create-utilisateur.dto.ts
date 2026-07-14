import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsPhoneNumber,
  IsOptional,
} from 'class-validator';
import { IsStrongPassword } from 'src/auth/decorators/password-strength.decorator';
import { Sexe } from 'src/common/sexe.enum';

export class CreateUtilisateurDto {
  @IsEmail({}, { message: "Format d'email invalide" })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @IsStrongPassword({ message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial' })
  motDePasse!: string; // Sera hashé avant enregistrement

  // Autres champs optionnels selon ton besoin d'inscription
  @IsNotEmpty()
  @IsString()
  nom?: string;

  @IsNotEmpty()
  @IsString()
  prenoms?: string;

  @IsNotEmpty()
  @IsPhoneNumber(undefined, { message: 'Numéro de téléphone invalide' })
  telephone?: string;

  @IsNotEmpty()
  @IsString()
  adresse?: string;

  @IsNotEmpty()
  sexe!: Sexe;
  
  @IsNotEmpty()
  dateDeNaissance!: Date;
}
