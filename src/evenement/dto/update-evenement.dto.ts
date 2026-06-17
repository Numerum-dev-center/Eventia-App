import { PartialType } from '@nestjs/mapped-types';
import { CreateEvenementDto } from './create-evenement.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { StatutEvenement } from 'src/common/statut-evenement.enum';

export class UpdateEvenementDto extends PartialType(CreateEvenementDto) {
  @IsOptional()
  @IsEnum(StatutEvenement)
  statut?: StatutEvenement;
}
