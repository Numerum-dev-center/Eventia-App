import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsStrongPassword } from '../decorators/password-strength.decorator';

export class LoginDto {
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  @IsNotEmpty({ message: 'L\'email est obligatoire' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  motDePasse!: string;
}