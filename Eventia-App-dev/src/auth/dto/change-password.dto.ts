import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../decorators/password-strength.decorator';

export class ChangePasswordDto {
  ancienMotDePasse(oldPassword: any, newPassword: any) {
    throw new Error('Method not implemented.');
  }
  @ApiProperty({ description: 'Current password required for security' })
  @IsNotEmpty()
  @IsString()
  oldPassword!: string;

  @ApiProperty({ description: 'New password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @IsStrongPassword()
  newPassword!: string;
}