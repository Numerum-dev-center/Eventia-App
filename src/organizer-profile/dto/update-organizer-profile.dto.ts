import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizerProfileDto } from './create-organizer-profile.dto';

export class UpdateOrganizerProfileDto extends PartialType(CreateOrganizerProfileDto) {}
