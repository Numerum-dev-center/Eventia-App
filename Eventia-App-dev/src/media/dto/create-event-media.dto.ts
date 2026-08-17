import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber } from 'class-validator';
import { MediaType } from '../entities/event-media.entity';

export class CreateEventMediaDto {
  @IsUUID()
  @IsNotEmpty()
  eventId!: string;

  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
