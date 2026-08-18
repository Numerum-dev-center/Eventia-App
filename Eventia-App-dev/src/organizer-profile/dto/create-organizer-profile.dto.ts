import {
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateOrganizerProfileDto {
  @IsString()
  @IsNotEmpty()
  societyName!: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  paymentDetails?: any;

  @IsOptional()
  @IsString()
  officialFiles?: string;
}
