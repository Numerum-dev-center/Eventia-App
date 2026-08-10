import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizerProfileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  societyName!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsString()
  @IsNotEmpty()
  brand?: string;

  @IsString()
  @IsNotEmpty()
  officialFiles?: string;
}
