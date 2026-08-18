import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  orderId!: string;

  @IsNotEmpty()
  ticketCategoryId!: string;

  @IsNumber()
  quantity!: number;
}

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  validationStatut?: string;
}
