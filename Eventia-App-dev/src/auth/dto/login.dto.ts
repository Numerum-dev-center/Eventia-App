import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @ApiProperty({ example: 'Password123!' })
  password!: string;
}