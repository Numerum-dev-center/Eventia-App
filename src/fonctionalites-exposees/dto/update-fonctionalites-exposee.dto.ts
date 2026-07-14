import { PartialType } from '@nestjs/mapped-types';
import { CreateFonctionalitesExposeeDto } from './create-fonctionalites-exposee.dto';

export class UpdateFonctionalitesExposeeDto extends PartialType(CreateFonctionalitesExposeeDto) {}
