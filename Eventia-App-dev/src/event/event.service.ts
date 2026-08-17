import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatut } from 'src/common/event-statut.enum';
import { Role } from 'src/common/role.enum';
import { OrganizerProfile } from 'src/organizer-profile/entities/organizer-profile.entity';
import { TicketCategory } from 'src/ticket-category/entities/ticket-category.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(OrganizerProfile)
    private organizerProfileRepository: Repository<OrganizerProfile>,
    @InjectRepository(TicketCategory)
    private ticketCategoryRepository: Repository<TicketCategory>,
  ) {}

  private readonly logger = new Logger(EventService.name);

  async create(
    createEventDto: CreateEventDto,
    userId: string,
  ): Promise<Event> {
    try {
      const profile = await this.organizerProfileRepository.findOne({
        where: { user: { id: userId } },
      });
      if (!profile) {
        throw new BadRequestException("Aucun profil organisateur trouvé pour cet utilisateur.");
      }

      const event = this.eventRepository.create({
        title: createEventDto.title,
        description: createEventDto.description,
        category: createEventDto.category,
        placeName: createEventDto.placeName,
        adress: createEventDto.adress,
        longitude: createEventDto.longitude,
        latitude: createEventDto.latitude,
        locationType: createEventDto.locationType,
        onlineUrl: createEventDto.onlineUrl,
        maxCapacity: createEventDto.maxCapacity,
        startDate: createEventDto.startDate,
        endDate: createEventDto.endDate,
        bannerImage: createEventDto.bannerImage,
        organizerProfile: { id: profile.id },
      });
      const savedEvent = await this.eventRepository.save(event);

      if (createEventDto.ticketsCategories?.length) {
        const categories = createEventDto.ticketsCategories.map((tc) =>
          this.ticketCategoryRepository.create({
            name: tc.name,
            price: Number(tc.price),
            totalQuantity: tc.totalQuantity,
            availableQuantity: tc.totalQuantity,
            limitByPerson: tc.limitByPerson,
            event: { id: savedEvent.id },
          }),
        );
        await this.ticketCategoryRepository.save(categories);
      }

      return this.findOne(savedEvent.id);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error("Erreur lors de la création de l'événement", error);
      throw new InternalServerErrorException(
        "Erreur lors de la création de l'événement",
      );
    }
  }

  async findAll(): Promise<Event[]> {
    return await this.eventRepository.find({
      relations: { organizerProfile: true, ticketsCategories: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findPublished(): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { statut: EventStatut.PUBLISHED },
      relations: { organizerProfile: true, ticketsCategories: true },
      order: { startDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: { organizerProfile: true, ticketsCategories: true },
    });
    if (!event) {
      throw new NotFoundException(`Événement #${id} non trouvé`);
    }
    return event;
  }

  async findByOrganizer(organizerId: string): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { organizerProfile: { id: organizerId } },
      relations: { ticketsCategories: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    userId: string,
    userRole: string,
  ): Promise<Event> {
    const event = await this.findOne(id);

    if (userRole !== Role.ADMIN && event.organizerProfile?.user?.id !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier cet événement",
      );
    }

    Object.assign(event, updateEventDto);
    return await this.eventRepository.save(event);
  }

  async updateStatut(
    id: string,
    statut: EventStatut,
  ): Promise<Event> {
    const event = await this.findOne(id);

    const allowedTransitions: Record<EventStatut, EventStatut[]> = {
      [EventStatut.DRAFT]: [EventStatut.PENDING_REVIEW, EventStatut.PUBLISHED],
      [EventStatut.PENDING_REVIEW]: [EventStatut.PUBLISHED, EventStatut.SUSPENDED, EventStatut.DRAFT],
      [EventStatut.PUBLISHED]: [EventStatut.SUSPENDED, EventStatut.CANCELED, EventStatut.FINISHED],
      [EventStatut.SUSPENDED]: [EventStatut.PUBLISHED, EventStatut.CANCELED],
      [EventStatut.CANCELED]: [EventStatut.ARCHIVED],
      [EventStatut.FINISHED]: [EventStatut.ARCHIVED],
      [EventStatut.ARCHIVED]: [],
    };

    const allowed = allowedTransitions[event.statut] || [];
    if (!allowed.includes(statut)) {
      throw new BadRequestException(
        `Transition de ${event.statut} vers ${statut} non autorisée`,
      );
    }

    if (statut === EventStatut.PUBLISHED && !event.startDate) {
      throw new BadRequestException(
        "La date de début est requise pour publier",
      );
    }

    event.statut = statut;
    return await this.eventRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
  }

  async countByOrganizer(organizerId: string): Promise<number> {
    return await this.eventRepository.count({
      where: { organizerProfile: { id: organizerId } },
    });
  }
}
