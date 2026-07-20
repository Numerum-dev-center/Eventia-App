// dto/base-update-profil.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsPhoneNumber, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { Sexe } from 'src/common/sexe.enum';

export class BaseUpdateProfilDto {
  @IsOptional() 
  @IsString() 
  @ApiProperty({ 
    example: 'John', 
    description: 'Le nom de l \'utilisateur' 
  })
  nom?: string;

  @IsOptional() 
  @IsString() 
  @ApiProperty({ 
    example: 'Doe Who', 
    description: 'Le/les prénoms de l\'utilisateur' 
  })
  prenoms?: string;

  @IsOptional()
  @IsPhoneNumber() 
  @ApiProperty({ 
    example: '+22890542125', 
    description: 'Le numéro de téléphone, toujours mettre l\'indicatif' 
  })
  telephone?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ 
    example: 'Rue des évalas, 456', 
    description: 'L\'adresse de l\'utilisateur' 
  })
  adresse?: string;

  @IsOptional()
  @IsEnum(Sexe)
  @ApiProperty({ 
    example: 'Masculin', 
    description: 'Le sexe de l\'utilisateur. Mettre Masculin ou Féminin. Respectez cette syntaxe' 
  })
  sexe?: Sexe;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ 
    example: '2000-05-22', 
    description: 'La date de naissace est sous format AAAA-MM-DD' 
  })
  dateDeNaissance?: Date;
}