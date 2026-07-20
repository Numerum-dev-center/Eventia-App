// dto/update-organisateur.dto.ts
import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseUpdateProfilDto } from './base-update-profil.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';


class ProfilOrgDetailsDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: "Nom de l'entreprise", example: 'Eventia Corp' })
  nomEntreprise?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: "URL ou nom du fichier logo", example: 'logo.png' })
  logo?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: "Description de l'organisation", example: 'Nous organisons des événements tech.' })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: "URL ou chemin des documents", example: 'justificatif_kbis.pdf' })
  documentsJustificatifs?: string;
}

export class UpdateOrganisateurDto extends BaseUpdateProfilDto {
  @IsOptional()
  @ApiPropertyOptional({ type: ProfilOrgDetailsDto, description: "Détails spécifiques du profil organisateur" })
  @ValidateNested()
  @Type(() => ProfilOrgDetailsDto)
  profilOrganisateur?: ProfilOrgDetailsDto;
}