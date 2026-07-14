import { PartialType } from '@nestjs/mapped-types';
import { CreateAdministrateurDto } from './create-administrateur.dto';

export class UpdateAdministrateurDto extends PartialType(CreateAdministrateurDto) {}
