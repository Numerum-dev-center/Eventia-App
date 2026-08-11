import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSessionsTokenDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsString()
  refreshTokenHash!: string;

  @IsString()
  deviceInfo!: string;

  @IsString()
  ipAdress!: string;

  @IsNotEmpty()
  expirationDate!: Date;
}
