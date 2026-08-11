import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizerProfileDto } from './create-organizer-profile.dto';
import { BaseUpdateProfileDto } from 'src/user/dto/base-update-profile.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateOrganizerProfileDto extends PartialType(CreateOrganizerProfileDto) {

    @IsOptional()
  @ApiPropertyOptional({ type: CreateOrganizerProfileDto, description: "Détails spécifiques du profil organisateur" })
  @ValidateNested()
  @Type(() => CreateOrganizerProfileDto)
  organizerProfile?: CreateOrganizerProfileDto;
}

