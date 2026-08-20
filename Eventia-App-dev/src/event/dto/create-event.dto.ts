import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventCategory } from 'src/common/event-category.enum';

export class CreateEventDto {
  @ApiProperty({ example: 'Festival Afrobeat Lome 2026', description: 'Event title' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required.' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters.' })
  title!: string;

  @ApiProperty({ example: 'The biggest afrobeat music festival in West Africa', description: 'Event description' })
  @IsString()
  @IsNotEmpty({ message: 'Description is required.' })
  description!: string;

  @ApiProperty({ example: '2026-12-20', description: 'Event date (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty({ message: 'Date is required.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format.' })
  date!: string;

  @ApiProperty({ example: '20:00', description: 'Start time (HH:mm)' })
  @IsString()
  @IsNotEmpty({ message: 'Start time is required.' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'Start time must be in HH:mm format.' })
  startTime!: string;

  @ApiProperty({ example: '04:00', description: 'End time (HH:mm)' })
  @IsString()
  @IsNotEmpty({ message: 'End time is required.' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'End time must be in HH:mm format.' })
  endTime!: string;

  @ApiProperty({ example: 'Stade de Keque, Lome', description: 'Event location' })
  @IsString()
  @IsNotEmpty({ message: 'Location is required.' })
  location!: string;

  @ApiProperty({ enum: EventCategory, example: EventCategory.CONCERT, description: 'Event category' })
  @IsEnum(EventCategory, { message: 'Category must be one of: Concert, Conference, Spectacle, Marche, Sport, Autre.' })
  category!: EventCategory;

  @ApiProperty({ example: 5000, description: 'Number of available seats' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Capacity must be a number.' })
  @Min(1, { message: 'Capacity must be at least 1.' })
  capacity!: number;

  @ApiProperty({ example: 5000, description: 'Ticket price in FCFA/XOF (0 for free events)' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Ticket price must be a number.' })
  @Min(0, { message: 'Ticket price cannot be negative.' })
  ticketPrice!: number;

  @ApiPropertyOptional({ description: 'Cover image file (JPG, JPEG, PNG)' })
  @IsOptional()
  coverImage?: any;
}
