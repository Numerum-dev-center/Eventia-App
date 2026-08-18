import { ApiProperty } from "@nestjs/swagger";

export class VerifyActivationDto {
  @ApiProperty({ 
      example: '152364', 
      description: 'The code contains 6 digits'
    })
  code!: string;
}