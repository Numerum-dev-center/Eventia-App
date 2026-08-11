import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  private readonly logger = new Logger(EventService.name);

  async create(
    createEventDto: CreateEventDto,
    organisateurId: string,
  ): Promise<Event> {
    try {
      // 1. On crée une instance de l'entité avec les données du DTO
      // 2. On injecte l'organisateurId explicitement
      const event = this.eventRepository.create({
        ...createEventDto,
        organizerProfile: { id: organisateurId }, // L'ID vient du token, pas du DTO
      });

      // 3. On sauvegarde dans la base de données
      return await this.eventRepository.save(event);
    } catch (error) {
      // <--- Ici, on récupère l'objet erreur
      // Il est très utile de loguer cette erreur pour savoir CE QUI a planté
      this.logger.error("Détail de l'erreur :", error);
      throw new InternalServerErrorException(
        "Erreur lors de la création de l'événement",
      );
    }
  }
}
