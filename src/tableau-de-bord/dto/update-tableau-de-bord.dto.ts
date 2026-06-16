import { PartialType } from '@nestjs/mapped-types';
import { CreateTableauDeBordDto } from './create-tableau-de-bord.dto';

export class UpdateTableauDeBordDto extends PartialType(CreateTableauDeBordDto) {}
