import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../decorators/password-strength.decorator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Ancien mot de passe requis pour la sécurité' })
  @IsNotEmpty()
  @IsString()
  ancienMotDePasse!: string;

  @ApiProperty({ description: 'Nouveau mot de passe' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @IsStrongPassword()
  nouveauMotDePasse!: string;
}