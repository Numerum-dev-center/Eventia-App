import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsPhoneNumber, IsOptional, IsDateString, IsEnum, IsEmail } from 'class-validator';
import { Sex } from 'src/common/sex.enum';

export class BaseUpdateProfileDto {
  @IsOptional() 
  @IsString() 
  @ApiProperty({ 
    example: 'John', 
    description: 'User last name'
  })
  lastName?: string;

  @IsOptional() 
  @IsString() 
  @ApiProperty({ 
    example: 'Doe Who', 
    description: 'User first name(s)'
  })
  firstName?: string;

  @IsOptional()
  @IsPhoneNumber() 
  @ApiProperty({ 
    example: '+22890542125', 
    description: 'Phone number, always include country code'
  })
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({ example: 'newemail@test.com', description: 'User email address' })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ 
    example: '123 Main Street, Lome', 
    description: 'User home address'
  })
  homeAdress?: string;

  @IsOptional()
  @IsEnum(Sex)
  @ApiProperty({ 
    example: 'Male', 
    description: 'User gender. Enter Male or Female. Please follow this exact format.'
  })
  sex?: Sex;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ 
    example: '2000-05-22', 
    description: 'Birth date in YYYY-MM-DD format'
  })
  birthDate?: Date;
}