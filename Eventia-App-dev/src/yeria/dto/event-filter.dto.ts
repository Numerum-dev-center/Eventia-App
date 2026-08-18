import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class EventFilterDto {
  @ApiPropertyOptional({
    description: 'Event category to display (empty = all)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}
