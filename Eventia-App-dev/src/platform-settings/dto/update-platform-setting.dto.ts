import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePlatformSettingDto {
  @ApiProperty({ description: 'Setting key', example: 'ticketing' })
  @IsNotEmpty()
  @IsString()
  key!: string;

  @ApiProperty({ description: 'Setting value (JSON object)', example: { maxTicketsPerOrder: 10, allowTransfers: true } })
  @IsNotEmpty()
  @IsObject()
  value!: Record<string, any>;

  @ApiPropertyOptional({ description: 'Setting description' })
  @IsOptional()
  @IsString()
  description?: string;
}
