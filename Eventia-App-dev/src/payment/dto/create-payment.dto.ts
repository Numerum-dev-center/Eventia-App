import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  orderId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod!: string;

  @IsOptional()
  @IsString()
  externalTransactionReference?: string;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsString()
  statut?: string;

  @IsOptional()
  @IsString()
  externalTransactionReference?: string;
}
