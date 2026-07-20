import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfilOrganisateurDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nomEntreprise!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsString()
  @IsNotEmpty()
  logo?: string;

  @IsString()
  @IsNotEmpty()
  documentsJustificatifs?: string;
}
