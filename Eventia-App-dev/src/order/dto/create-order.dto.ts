import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsNotEmpty()
  clientId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsString()
  transactionGatewayId?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  transactionGatewayId?: string;

  @IsOptional()
  @IsString()
  paymentStatut?: string;
}
