import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScanTicketDto {
  @ApiProperty({
    description:
      'Scanned value (the unique ticket code, e.g., uniqueCodeCrypto)',
  })
  @IsString()
  @IsNotEmpty()
  qrData!: string;

  @ApiPropertyOptional({
    description: "Control agent's device identifier",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  deviceId?: string;

  @ApiPropertyOptional({
    description: "Scan location (e.g., 'North Entrance', 'Gate A')",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;
}
