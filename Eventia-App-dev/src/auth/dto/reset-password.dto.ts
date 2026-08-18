import { IsEmail, IsNotEmpty, MinLength, IsString, Length, Equals } from 'class-validator' ;

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Code is required' })
  @Length(6, 6, { message: 'Code must contain exactly 6 digits' })
  code!: string;

  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(8, { message: 'Password must contain at least 8 characters' })
  newPassword!: string;

  @IsString()
  @Equals('newPassword', { message: 'Passwords do not match' })
  confirmPassword!: string;
}