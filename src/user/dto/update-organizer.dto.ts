import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseUpdateProfileDto } from './base-update-profile.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';


class OrganizerProfileDetailsDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: "Nom de l'entreprise", example: 'Eventia Corp' })
  societyName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: "URL ou nom du fichier logo", example: 'logo.png' })
  brand?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: "Description de l'organisation", example: 'Nous organisons des événements tech.' })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: "URL ou chemin des documents", example: 'justificatif_kbis.pdf' })
  officialFiles?: string;
}

export class UpdateOrganizerDto extends BaseUpdateProfileDto {
  @IsOptional()
  @ApiPropertyOptional({ type: OrganizerProfileDetailsDto, description: "Détails spécifiques du profil organisateur" })
  @ValidateNested()
  @Type(() => OrganizerProfileDetailsDto)
  organizerProfile?: OrganizerProfileDetailsDto;
}