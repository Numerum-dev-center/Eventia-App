import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsPhoneNumber, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { Sex } from 'src/common/sex.enum';

export class BaseUpdateProfileDto {
  @IsOptional() 
  @IsString() 
  @ApiProperty({ 
    example: 'John', 
    description: 'Le nom de l \'utilisateur' 
  })
  lastName?: string;

  @IsOptional() 
  @IsString() 
  @ApiProperty({ 
    example: 'Doe Who', 
    description: 'Le/les prénoms de l\'utilisateur' 
  })
  firstName?: string;

  @IsOptional()
  @IsPhoneNumber() 
  @ApiProperty({ 
    example: '+22890542125', 
    description: 'Le numéro de téléphone, toujours mettre l\'indicatif' 
  })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ 
    example: 'Rue des évalas, 456', 
    description: 'L\'adresse de l\'utilisateur' 
  })
  homeAdress?: string;

  @IsOptional()
  @IsEnum(Sex)
  @ApiProperty({ 
    example: 'Masculin', 
    description: 'Le sexe de l\'utilisateur. Mettre Masculin ou Féminin. Respectez cette syntaxe' 
  })
  sex?: Sex;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ 
    example: '2000-05-22', 
    description: 'La date de naissace est sous format AAAA-MM-DD' 
  })
  birthDate?: Date;
}