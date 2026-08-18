import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseUpdateProfileDto } from './base-update-profile.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';


class OrganizerProfileDetailsDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: "Company name", example: 'Eventia Corp' })
  societyName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: "Logo file URL or name", example: 'logo.png' })
  brand?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: "Organization description", example: 'We organize tech events.' })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: "Document URL or path", example: 'justificatif_kbis.pdf' })
  officialFiles?: string;
}

export class UpdateOrganizerDto extends BaseUpdateProfileDto {
  @IsOptional()
  @ApiPropertyOptional({ type: OrganizerProfileDetailsDto, description: "Organizer profile specific details" })
  @ValidateNested()
  @Type(() => OrganizerProfileDetailsDto)
  organizerProfile?: OrganizerProfileDetailsDto;
}