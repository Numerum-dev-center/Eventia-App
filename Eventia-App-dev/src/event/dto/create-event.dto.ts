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
  @ApiProperty({ example: 'Festival Afrobeat Lome 2026', description: 'Titre de l’événement' })
  @IsString()
  @IsNotEmpty({ message: 'Le titre est obligatoire.' })
  @MaxLength(255, { message: 'Le titre ne doit pas dépasser 255 caractères.' })
  titre!: string;

  @ApiProperty({ example: 'The biggest afrobeat music festival in West Africa', description: 'Description de l’événement' })
  @IsString()
  @IsNotEmpty({ message: 'La description est obligatoire.' })
  description!: string;

  @ApiProperty({ example: 'Concert', enum: EventCategory, description: 'Catégorie de l’événement' })
  @IsEnum(EventCategory, { message: 'La catégorie doit être l’une de : Concert, Conference, Spectacle, Marche, Sport, Autre.' })
  categorie!: EventCategory;

  @ApiProperty({ example: 'Stade de Kégué', description: 'Nom du lieu' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom du lieu est obligatoire.' })
  lieuNom!: string;

  @ApiProperty({ example: 'Avenue de la Paix, Lomé', description: 'Adresse complète du lieu' })
  @IsString()
  @IsNotEmpty({ message: 'L’adresse est obligatoire.' })
  adresse!: string;

  @ApiPropertyOptional({ example: '6.1319', description: 'Latitude' })
  @IsOptional()
  @IsString()
  latitude?: string;

  @ApiPropertyOptional({ example: '1.2228', description: 'Longitude' })
  @IsOptional()
  @IsString()
  longitude?: string;

  @ApiProperty({ example: '2026-12-20', description: 'Date de début (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty({ message: 'La date est obligatoire.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La date doit être au format YYYY-MM-DD.' })
  dateDebut!: string;

  @ApiProperty({ example: '2026-12-21', description: 'Date de fin (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty({ message: 'La date de fin est obligatoire.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La date de fin doit être au format YYYY-MM-DD.' })
  dateFin!: string;

  @ApiPropertyOptional({ example: '20:00', description: 'Heure de début (HH:mm)' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'L’heure de début doit être au format HH:mm.' })
  heureDebut?: string;

  @ApiPropertyOptional({ example: '04:00', description: 'Heure de fin (HH:mm)' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'L’heure de fin doit être au format HH:mm.' })
  heureFin?: string;

  @ApiProperty({ example: 5000, description: 'Nombre de places disponibles' })
  @Type(() => Number)
  @IsNumber({}, { message: 'La capacité doit être un nombre.' })
  @Min(1, { message: 'La capacité doit être au moins 1.' })
  capacite!: number;

  @ApiProperty({ example: 5000, description: 'Prix du billet en FCFA/XOF (0 pour un événement gratuit)' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Le prix du billet doit être un nombre.' })
  @Min(0, { message: 'Le prix du billet ne peut pas être négatif.' })
  prixBillet!: number;

  @ApiPropertyOptional({ description: 'Image de couverture (JPG, JPEG, PNG)' })
  @IsOptional()
  coverImage?: any;
}
