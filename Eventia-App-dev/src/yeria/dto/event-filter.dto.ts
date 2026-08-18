import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class EventFilterDto {
  @ApiPropertyOptional({
    description: 'Catégorie d\u2019événement à afficher (vide = toutes)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}
