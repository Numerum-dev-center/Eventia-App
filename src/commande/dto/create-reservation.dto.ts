import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateReservationDto {
  @IsUUID()
  categorieTicketId!: string;

  @IsInt()
  @Min(1)
  quantite!: number;

  @IsString()
  @IsNotEmpty()
  buyerName!: string;

  @IsEmail()
  buyerEmail!: string;

  @IsOptional()
  @IsString()
  buyerTelephone?: string;
}
