// dto/update-organisateur.dto.ts
import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseUpdateProfilDto } from './base-update-profil.dto';

// Si tu as besoin de valider les infos spécifiques à l'organisation
class ProfilOrgDetailsDto {
  @IsOptional()
  @IsString()
  nomEntreprise?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  documentsJustificatifs?: string;
}

export class UpdateOrganisateurDto extends BaseUpdateProfilDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ProfilOrgDetailsDto)
  profilOrganisateur?: ProfilOrgDetailsDto;
}