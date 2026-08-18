import { IsEnum, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsString, IsUUID, Min, Max } from 'class-validator';
import { PromoCodeType } from '../entities/promo-code.entity';

export class CreatePromoCodeDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsEnum(PromoCodeType)
  type!: PromoCodeType;

  @IsNumber()
  @Min(0)
  value!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsUUID()
  eventId?: string;
}

export class ValidatePromoCodeDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsUUID()
  eventId!: string;
}
