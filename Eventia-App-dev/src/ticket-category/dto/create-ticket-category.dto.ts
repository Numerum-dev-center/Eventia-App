import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateTicketCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(1)
  totalQuantity!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limitByPerson?: number;

  @IsOptional()
  @IsString()
  eventId?: string;
}
