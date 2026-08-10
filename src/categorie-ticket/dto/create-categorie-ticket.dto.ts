import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCategorieTicketDto {
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsNumber()
  @Min(0)
  prix!: number;

  @IsInt()
  @Min(1)
  quantiteTotale!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limiteParPersonne?: number;
}
