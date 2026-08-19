import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsStrongPassword } from 'src/auth/decorators/password-strength.decorator';

export class RegisterDto {
  @ApiProperty({ 
    example: 'john@example.com', 
    description: 'User email for login'
  })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: "Email is required." })
  email!: string;

  @ApiProperty({ 
    example: 'MySecurePass123!', 
    description: 'Password (min 8 chars, uppercase, lowercase, digit, special char)'
  })
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password must contain at least 8 characters.' })
  @IsStrongPassword({ message: 'Password must contain at least 1 lowercase, 1 uppercase, 1 digit, and 1 special character.'})
  @ApiProperty({ example: 'Password123!' })
  password!: string;


  @IsString()
  @IsStrongPassword()
  @ApiProperty({ example: 'Password123!' })
  confirmPassword!: string; // For client-side validation
}