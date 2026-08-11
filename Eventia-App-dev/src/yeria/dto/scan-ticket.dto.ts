import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScanTicketDto {
  @ApiProperty({
    description:
      'Valeur scannée (le code unique du billet, ex: uniqueCodeCrypto)',
  })
  @IsString()
  @IsNotEmpty()
  qrData!: string;

  @ApiPropertyOptional({
    description: "Identifiant de l'appareil de l'agent de contrôle",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  deviceId?: string;

  @ApiPropertyOptional({
    description: "Localisation du scan (ex: 'Entrée Nord', 'Porte A')",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;
}
