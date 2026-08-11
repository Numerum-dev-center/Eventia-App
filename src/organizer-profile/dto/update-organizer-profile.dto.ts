import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizerProfileDto } from './create-organizer-profile.dto';

export class UpdateOrganizerProfileDto extends PartialType(CreateOrganizerProfileDto) {}

/*export class UpdateOrganizerDto extends BaseUpdateProfileDto {
  @IsOptional()
  @ApiPropertyOptional({ type: OrganizerProfileDetailsDto, description: "Détails spécifiques du profil organisateur" })
  @ValidateNested()
  @Type(() => OrganizerProfileDetailsDto)
  organizerProfile?: OrganizerProfileDetailsDto;
}*/