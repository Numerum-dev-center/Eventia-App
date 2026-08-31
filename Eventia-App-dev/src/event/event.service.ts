import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatut } from 'src/common/event-statut.enum';
import { EventCategory } from 'src/common/event-category.enum';
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

      const p = this.normalizeEventPayload(createEventDto as any);

      const startDate = this.parseDateTime(p.dateDebut, true, p.heureDebut);
      const endDate = this.parseDateTime(p.dateFin, false, p.heureFin);

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
        title: p.titre,
        description: p.description,
        category: p.categorie as EventCategory,
        location: p.lieuNom,
        placeName: p.lieuNom,
        adress: p.adresse,
        latitude: p.latitude,
        longitude: p.longitude,
        ticketPrice: p.prixBillet,
        startDate,
        endDate,
        bannerImage,
        maxCapacity: p.capacite,
        organizerProfile: { id: profile.id },
      } as DeepPartial<Event>);

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

    const p = this.normalizeEventPayload(updateEventDto as any);

    if (p.dateDebut || p.heureDebut) {
      event.startDate = this.parseDateTime(p.dateDebut ?? '', true, p.heureDebut);
    }
    if (p.dateFin || p.heureFin) {
      event.endDate = this.parseDateTime(p.dateFin ?? '', false, p.heureFin);
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

    if (p.titre !== undefined) event.title = p.titre;
    if (p.description !== undefined) event.description = p.description;
    if (p.categorie !== undefined) event.category = p.categorie as EventCategory;
    if (p.lieuNom !== undefined) {
      event.location = p.lieuNom;
      event.placeName = p.lieuNom;
    }
    if (p.adresse !== undefined) event.adress = p.adresse;
    if (p.latitude !== undefined) event.latitude = p.latitude;
    if (p.longitude !== undefined) event.longitude = p.longitude;
    if (p.prixBillet !== undefined) event.ticketPrice = p.prixBillet;
    if (p.capacite !== undefined) event.maxCapacity = p.capacite;

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

  private parseDateTime(date: string, isStart: boolean, time?: string): Date {
    const t = time?.trim() || (isStart ? '00:00' : '23:59');
    const d = (date || '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      return new Date(`${d}T${t}:00.000Z`);
    }
    const dt = new Date(d);
    if (isNaN(dt.getTime())) {
      throw new BadRequestException('Date invalide.');
    }
    return dt;
  }

  private number(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number') return value;
    const n = Number(String(value).replace(/\s/g, '').replace(',', '.'));
    return isNaN(n) ? undefined : n;
  }

  private string(value: unknown): string | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'string') return value.trim() === '' ? undefined : value.trim();
    if (typeof value === 'number') return String(value);
    return undefined;
  }

  private pick(root: any, ...paths: (string | string[])[]): any {
    for (const key of paths) {
      const hits: any[] = [];
      const visit = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        if (Array.isArray(key)) {
          for (const k of key) {
            if (obj[k] !== undefined) hits.push(obj[k]);
          }
        } else if (obj[key] !== undefined) {
          hits.push(obj[key]);
        }
        for (const v of Object.values(obj)) {
          if (v && typeof v === 'object' && !Array.isArray(v)) visit(v);
        }
      };
      visit(root);
      for (const h of hits) {
        if (h !== undefined && h !== null && h !== '') return h;
      }
    }
    return undefined;
  }

  private normalizeEventPayload(body: any): {
    titre?: string;
    description?: string;
    categorie?: string;
    lieuNom?: string;
    adresse?: string;
    latitude?: string;
    longitude?: string;
    dateDebut: string;
    dateFin: string;
    heureDebut?: string;
    heureFin?: string;
    capacite?: number;
    prixBillet?: number;
  } {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Corps de requête invalide.');
    }

    const titre = this.string(this.pick(body, 'titre', 'title', ['information', 'title'], ['details', 'title']));
    const description = this.string(this.pick(body, 'description', 'descriptionText', ['details', 'description']));
    const categorie = this.string(this.pick(body, 'categorie', 'category', 'categorieEvenement', ['details', 'category']));
    const lieuNom = this.string(this.pick(body, 'lieuNom', 'location', 'lieu', 'placeName', ['position', 'lieuNom'], ['details', 'lieuNom'], ['details', 'location']));
    const adresse = this.string(this.pick(body, 'adresse', 'address', 'adress', ['position', 'adresse'], ['details', 'adresse']));
    const latitude = this.string(this.pick(body, 'latitude', 'lat', ['position', 'latitude'], ['details', 'latitude']));
    const longitude = this.string(this.pick(body, 'longitude', 'lng', 'lon', ['position', 'longitude'], ['details', 'longitude']));

    const dateDebut = this.string(this.pick(body, 'dateDebut', 'date', 'startDate', 'debut', ['dates', 'debut'], ['dates', 'start'], ['details', 'dateDebut'])) ?? '';
    const dateFin = this.string(this.pick(body, 'dateFin', 'endDate', 'fin', ['dates', 'fin'], ['dates', 'end'], ['details', 'dateFin'])) ?? '';
    const heureDebut = this.string(this.pick(body, 'heureDebut', 'startTime', 'heure', ['details', 'heureDebut'], ['details', 'startTime']));
    const heureFin = this.string(this.pick(body, 'heureFin', 'endTime', ['details', 'heureFin'], ['details', 'endTime']));

    const prixBillet = this.number(this.pick(body, 'prixBillet', 'ticketPrice', 'prix', 'price',
      ['ticket', 'price'], ['ticket', 'prixBillet'], ['tarif', 'prixBillet'], ['details', 'prixBillet'], ['details', 'ticketPrice']));
    const capacite = this.number(this.pick(body, 'capacite', 'capacity', 'maxCapacity', 'nombrePlaces',
      ['capacite', 'places'], ['details', 'capacite'], ['details', 'capacity']));

    return { titre, description, categorie, lieuNom, adresse, latitude, longitude, dateDebut, dateFin, heureDebut, heureFin, capacite, prixBillet };
  }
}
