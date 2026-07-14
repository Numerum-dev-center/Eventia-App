import { PartialType } from '@nestjs/mapped-types';
import { CreateUtilisateurDto } from './create-utilisateur.dto';
import {
  IsOptional,
  IsString,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsEnum,
  MinLength,
} from 'class-validator';
import { Role } from 'src/common/role.enum';

export class UpdateUtilisateurDto extends PartialType(CreateUtilisateurDto) {
  // PartialType rend tous les champs de CreateUtilisateurDto optionnels.
  // Tu peux ajouter ici des champs exclusifs à la mise à jour si nécessaire,
  // ou redéfinir certaines validations.

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  motDePasse?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  prenoms?: string;

  @IsNotEmpty()
  @IsPhoneNumber(undefined, { message: 'Numéro de téléphone invalide' })
  telephone?: string;

  @IsNotEmpty()
  @IsString()
  adresse?: string;
}
