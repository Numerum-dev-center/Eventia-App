import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class ScanTicketDto {
  @IsString()
  @IsNotEmpty()
  codeUniqueCrypto!: string;

  @IsOptional()
  @IsString()
  localisation?: string;

  @IsUUID()
  evenementId!: string;
}
