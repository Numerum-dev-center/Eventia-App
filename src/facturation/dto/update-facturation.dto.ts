import { PartialType } from '@nestjs/mapped-types';
import { CreateFacturationDto } from './create-facturation.dto';

export class UpdateFacturationDto extends PartialType(CreateFacturationDto) {}
