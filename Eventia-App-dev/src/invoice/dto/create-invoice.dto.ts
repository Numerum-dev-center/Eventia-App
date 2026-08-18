import { IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsNotEmpty()
  orderId!: string;

  @IsOptional()
  @IsString()
  pdfUrl?: string;
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsString()
  statut?: string;

  @IsOptional()
  @IsString()
  pdfUrl?: string;
}
