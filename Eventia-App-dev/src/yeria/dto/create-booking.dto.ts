import { IsInt, IsNotEmpty, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'Identifiant de l\u2019événement' })
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @ApiProperty({ description: 'Identifiant de la catégorie de billet' })
  @IsString()
  @IsNotEmpty()
  ticketCategoryId!: string;

  @ApiProperty({
    description: 'Nombre de billets demandés',
    example: 2,
  })
  @IsInt()
  @Min(1)
  @Max(50)
  quantity!: number;

  @ApiPropertyOptional({
    description: 'Identifiant Eventia de l\u2019utilisateur (sinon via jeton Yeria)',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
