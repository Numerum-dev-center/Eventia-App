import { IsInt, IsNotEmpty, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'Event identifier' })
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @ApiProperty({ description: 'Ticket category identifier' })
  @IsString()
  @IsNotEmpty()
  ticketCategoryId!: string;

  @ApiProperty({
    description: 'Number of tickets requested',
    example: 2,
  })
  @IsInt()
  @Min(1)
  @Max(50)
  quantity!: number;

  @ApiPropertyOptional({
    description: 'Eventia user identifier (otherwise via Yeria token)',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
