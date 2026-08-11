import { IsEmail, IsNotEmpty, MinLength, IsString, Length, Equals } from 'class-validator' ;

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @IsNotEmpty({ message: 'L\'email est obligatoire' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le code est obligatoire' })
  @Length(6, 6, { message: 'Le code doit contenir exactement 6 chiffres' })
  code!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nouveau mot de passe est obligatoire' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  newPassword!: string;

  @IsString()
  @Equals('nouveauMotDePasse', { message: 'Les mots de passe ne correspondent pas' })
  confirmPassword!: string;
}