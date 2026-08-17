import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumberString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationType } from 'src/common/location-type.enum';

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

  @IsOptional()
  @IsString()
  placeName?: string;

  @IsOptional()
  @IsString()
  adress?: string;

  @IsOptional()
  @IsNumberString()
  longitude?: string;

  @IsOptional()
  @IsNumberString()
  latitude?: string;

  @IsOptional()
  @IsEnum(LocationType)
  locationType?: LocationType;

  @IsOptional()
  @IsString()
  onlineUrl?: string;

  @IsOptional()
  @IsNumber()
  maxCapacity?: number;

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
