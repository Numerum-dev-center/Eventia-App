import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSessionsJetonDto {
  @IsNotEmpty()
  @IsString()
  utilisateur_id!: string;

  @IsNotEmpty()
  @IsString()
  refresh_token_hash!: string;

  @IsString()
  appareilInfo!: string;

  @IsString()
  adresseIp!: string;

  @IsNotEmpty()
  dateExpiration!: Date;
}
