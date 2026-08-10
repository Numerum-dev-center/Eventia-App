import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsStrongPassword } from 'src/auth/decorators/password-strength.decorator';

export class RegisterDto {
  @ApiProperty({ 
    example: 'jean@exemple.com', 
    description: 'L\'email de l\'utilisateur pour se connecter' 
  })
  @IsEmail({}, { message: 'Veuillez fournir un e-mail valide.' })
  @IsNotEmpty({ message: "L'e-mail est requis." })
  email!: string;

  @ApiProperty({ 
    example: 'monSuperMotDePasse123', 
    description: 'Le mot de passe (min 8 caractères, avec une majuscule, une minuscule, un chiffre, et un caractère spécial )' 
  })
  @IsNotEmpty({ message: 'Le mot de passe est requis.' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
  @IsStrongPassword({ message: 'Le mot de passe doit contenir au moins 1 minuscule, 1 majuscule, 1 chiffre et un caractère spécial.'})
  @ApiProperty({ example: 'Password123!' })
  password!: string;


  @IsString()
  @IsStrongPassword()
  @ApiProperty({ example: 'Password123!' })
  confirmPassword!: string; // Pour valider côté client
}