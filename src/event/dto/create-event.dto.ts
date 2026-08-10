import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumberString,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  placeName!: string;

  @IsString()
  @IsNotEmpty()
  adress!: string;

  @IsOptional()
  @IsNumberString()
  longitude?: string;

  @IsOptional()
  @IsNumberString()
  latitude?: string;

  @IsDateString()
  startDate!: Date;

  @IsDateString()
  endDate!: Date;

  @IsOptional()
  @IsString()
  bannerImage?: string;
}
