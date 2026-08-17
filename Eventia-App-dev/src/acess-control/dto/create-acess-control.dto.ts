import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateAcessControlDto {
  @IsNotEmpty()
  ticketId!: string;

  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsOptional()
  @IsBoolean()
  isSuccess?: boolean;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}

export class UpdateAcessControlDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  isSuccess?: boolean;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}
