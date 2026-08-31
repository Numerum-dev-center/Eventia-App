import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatut } from 'src/common/event-statut.enum';
import { StatutVerification } from 'src/common/profile-organizer-validation-statut.enum';
import { Role } from 'src/common/role.enum';
import { OrganizerProfile } from 'src/organizer-profile/entities/organizer-profile.entity';
import { TicketCategory } from 'src/ticket-category/entities/ticket-category.entity';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(OrganizerProfile)
    private organizerProfileRepository: Repository<OrganizerProfile>,
    @InjectRepository(TicketCategory)
    private ticketCategoryRepository: Repository<TicketCategory>,
    private readonly supabase: SupabaseService,
  ) {}

  private readonly logger = new Logger(EventService.name);

  async create(
    createEventDto: CreateEventDto,
    userId: string,
    coverImageFile?: Express.Multer.File,
  ): Promise<Event> {
    try {
      const profile = await this.organizerProfileRepository.findOne({
        where: { user: { id: userId } },
      });
      if (!profile) {
        throw new BadRequestException(
          'Aucun profil organisateur trouvé pour cet utilisateur. Veuillez d’abord créer votre profil organisateur.',
        );
      }

      if (profile.verificationStatut !== StatutVerification.APPROVED) {
        throw new ForbiddenException(
          'Votre profil organisateur doit être approuvé par un administrateur avant de pouvoir créer un événement.',
        );
      }

      const {
        titre,
        description,
        categorie,
        lieuNom,
        adresse,
        latitude,
        longitude,
        dateDebut,
        dateFin,
        heureDebut,
        heureFin,
        capacite,
        prixBillet,
        ...rest
      } = createEventDto;

      const startDate = this.combineDateAndTime(dateDebut, heureDebut ?? '00:00');
      const endDate = this.combineDateAndTime(dateFin, heureFin ?? '23:59');

      if (endDate <= startDate) {
        throw new BadRequestException(
          'La date de fin doit être postérieure à la date de début.',
        );
      }

      let bannerImage: string | undefined;
      if (coverImageFile) {
        bannerImage = await this.supabase.uploadImage(
          coverImageFile.buffer,
          coverImageFile.originalname,
          coverImageFile.mimetype,
        );
      }

      const event = this.eventRepository.create({
        title: titre?.trim(),
        description: description?.trim(),
        category: categorie,
        location: lieuNom?.trim(),
        placeName: lieuNom?.trim(),
        adress: adresse?.trim(),
        latitude,
        longitude,
        ticketPrice: prixBillet,
        startDate,
        endDate,
        bannerImage,
        maxCapacity: capacite,
        organizerProfile: { id: profile.id },
      });

      return await this.eventRepository.save(event);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error('Failed to create event', error);
      throw new InternalServerErrorException('Failed to create event. Please try again.');
    }
  }

  async findAll(query?: { search?: string; status?: string; category?: string; page?: string; limit?: string }): Promise<{ events: Event[]; pagination: any }> {
    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizerProfile', 'organizerProfile')
      .leftJoinAndSelect('event.ticketsCategories', 'ticketsCategories');

    if (query?.search) {
      qb.andWhere('(LOWER(event.title) LIKE :search OR LOWER(event.description) LIKE :search)', { search: `%${query.search.toLowerCase()}%` });
    }
    if (query?.status) {
      qb.andWhere('event.statut = :status', { status: query.status });
    }
    if (query?.category) {
      qb.andWhere('event.category = :category', { category: query.category });
    }

    qb.orderBy('event.createdAt', 'DESC');

    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query?.limit) || 20));
    qb.skip((page - 1) * limit).take(limit);

    const [events, total] = await qb.getManyAndCount();
    return { events, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findPublished(query: {
    search?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }): Promise<{ events: Event[]; pagination: any }> {
    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizerProfile', 'organizerProfile')
      .leftJoinAndSelect('event.ticketsCategories', 'ticketsCategories')
      .where('event.statut = :statut', { statut: EventStatut.PUBLISHED });

    if (query.search) {
      qb.andWhere('(LOWER(event.title) LIKE :search OR LOWER(event.description) LIKE :search OR LOWER(event.location) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` });
    }

    if (query.category) {
      qb.andWhere('event.category = :category', { category: query.category });
    }

    if (query.dateFrom) {
      qb.andWhere('event.startDate >= :dateFrom', { dateFrom: query.dateFrom });
    }

    if (query.dateTo) {
      qb.andWhere('event.startDate <= :dateTo', { dateTo: query.dateTo });
    }

    if (query.location) {
      qb.andWhere('LOWER(event.location) LIKE :location', { location: `%${query.location.toLowerCase()}%` });
    }

    if (query.minPrice) {
      qb.andWhere('event.ticketPrice >= :minPrice', { minPrice: Number(query.minPrice) });
    }

    if (query.maxPrice) {
      qb.andWhere('event.ticketPrice <= :maxPrice', { maxPrice: Number(query.maxPrice) });
    }

    switch (query.sort) {
      case 'date_asc': qb.orderBy('event.startDate', 'ASC'); break;
      case 'date_desc': qb.orderBy('event.startDate', 'DESC'); break;
      case 'price_asc': qb.orderBy('event.ticketPrice', 'ASC'); break;
      case 'price_desc': qb.orderBy('event.ticketPrice', 'DESC'); break;
      case 'newest': qb.orderBy('event.createdAt', 'DESC'); break;
      default: qb.orderBy('event.startDate', 'ASC');
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
    const skip = (page - 1) * limit;

    qb.skip(skip).take(limit);

    const [events, total] = await qb.getManyAndCount();

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: { organizerProfile: true, ticketsCategories: true, media: true },
    });
    if (!event) {
      throw new NotFoundException(`Event #${id} not found.`);
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

  async findMyEvents(userId: string): Promise<Event[]> {
    const profile = await this.organizerProfileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!profile) {
      throw new NotFoundException('No organizer profile found for this user.');
    }
    return await this.findByOrganizer(profile.id);
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    userId: string,
    userRole: string,
    coverImageFile?: Express.Multer.File,
  ): Promise<Event> {
    const event = await this.findOne(id);

    if (userRole !== Role.ADMIN) {
      const profile = await this.organizerProfileRepository.findOne({
        where: { user: { id: userId } },
      });
      if (!profile || event.organizerProfile?.id !== profile.id) {
        throw new ForbiddenException(
          'You are not authorized to update this event.',
        );
      }
    }

    const {
      titre,
      description,
      categorie,
      lieuNom,
      adresse,
      latitude,
      longitude,
      dateDebut,
      dateFin,
      heureDebut,
      heureFin,
      capacite,
      prixBillet,
      ...rest
    } = updateEventDto;

    if (dateDebut && heureDebut) {
      event.startDate = this.combineDateAndTime(dateDebut, heureDebut);
    } else if (dateDebut) {
      event.startDate = this.combineDateAndTime(dateDebut, '00:00');
    }
    if (dateFin && heureFin) {
      event.endDate = this.combineDateAndTime(dateFin, heureFin);
    } else if (dateFin) {
      event.endDate = this.combineDateAndTime(dateFin, '23:59');
    }

    if (event.endDate && event.startDate && event.endDate <= event.startDate) {
      throw new BadRequestException('End time must be after start time.');
    }

    if (coverImageFile) {
      if (event.bannerImage) {
        await this.supabase.deleteImage(event.bannerImage);
      }
      event.bannerImage = await this.supabase.uploadImage(
        coverImageFile.buffer,
        coverImageFile.originalname,
        coverImageFile.mimetype,
      );
    }

    if (titre !== undefined) event.title = titre?.trim();
    if (description !== undefined) event.description = description?.trim();
    if (categorie !== undefined) event.category = categorie;
    if (lieuNom !== undefined) {
      event.location = lieuNom?.trim();
      event.placeName = lieuNom?.trim();
    }
    if (adresse !== undefined) event.adress = adresse?.trim();
    if (latitude !== undefined) event.latitude = latitude;
    if (longitude !== undefined) event.longitude = longitude;
    if (prixBillet !== undefined) event.ticketPrice = prixBillet;
    if (capacite !== undefined) event.maxCapacity = capacite;

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
        `Transition from ${event.statut} to ${statut} is not allowed.`,
      );
    }

    if (statut === EventStatut.PUBLISHED && !event.startDate) {
      throw new BadRequestException(
        'Start date is required before publishing.',
      );
    }

    event.statut = statut;
    return await this.eventRepository.save(event);
  }

  async remove(id: string, userId?: string, userRole?: string): Promise<void> {
    const event = await this.findOne(id);

    if (userRole !== Role.ADMIN && userId) {
      const profile = await this.organizerProfileRepository.findOne({
        where: { user: { id: userId } },
      });
      if (!profile || event.organizerProfile?.id !== profile.id) {
        throw new ForbiddenException(
          'You are not authorized to delete this event.',
        );
      }
    }

    if (event.bannerImage) {
      await this.supabase.deleteImage(event.bannerImage);
    }

    await this.eventRepository.remove(event);
  }

  async countByOrganizer(organizerId: string): Promise<number> {
    return await this.eventRepository.count({
      where: { organizerProfile: { id: organizerId } },
    });
  }

  private combineDateAndTime(date: string, time: string): Date {
    return new Date(`${date}T${time}:00.000Z`);
  }
}
