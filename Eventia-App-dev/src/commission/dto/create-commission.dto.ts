import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  Max,
} from 'class-validator';

export class CreateCommissionDto {
  @IsUUID()
  @IsNotEmpty()
  eventId!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  rate!: number;

  @IsNumber()
  @Min(0)
  amount!: number;
}

export class UpdateCommissionRateDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  rate!: number;
}
