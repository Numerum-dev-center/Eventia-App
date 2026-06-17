// evenement/dto/create-evenement.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumberString,
} from 'class-validator';

export class CreateEvenementDto {
  @IsString()
  @IsNotEmpty()
  titre!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  categorie!: string;

  @IsString()
  @IsNotEmpty()
  lieuNom!: string;

  @IsString()
  @IsNotEmpty()
  adresse!: string;

  @IsOptional()
  @IsNumberString()
  longitude?: string;

  @IsOptional()
  @IsNumberString()
  latitude?: string;

  @IsDateString()
  dateDebut!: Date;

  @IsDateString()
  dateFin!: Date;

  @IsOptional()
  @IsString()
  imageBanniere?: string;
}
