import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumberString,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventTicketCategoryDto)
  ticketsCategories?: CreateEventTicketCategoryDto[];
}

export class CreateEventTicketCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumberString()
  price!: string;

  @IsNotEmpty()
  totalQuantity!: number;

  @IsOptional()
  limitByPerson?: number;
}
