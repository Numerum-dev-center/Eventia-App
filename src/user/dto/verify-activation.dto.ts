import { ApiProperty } from "@nestjs/swagger";

export class VerifyActivationDto {
  @ApiProperty({ 
      example: '152364', 
      description: 'Le code contient 6 chiffres' 
    })
  code!: string;
}