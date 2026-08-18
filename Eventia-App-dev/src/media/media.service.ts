import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventMedia, MediaType } from './entities/event-media.entity';
import { Event } from 'src/event/entities/event.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(EventMedia)
    private mediaRepository: Repository<EventMedia>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  private readonly logger = new Logger(MediaService.name);

  async upload(
    eventId: string,
    file: Express.Multer.File,
    type?: MediaType,
    sortOrder?: number,
  ): Promise<EventMedia> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Événement #${eventId} non trouvé`);
    }

    const detectedType = type || this.detectMediaType(file.mimetype);
    const url = `/uploads/${file.filename}`;

    const media = this.mediaRepository.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url,
      type: detectedType,
      sortOrder: sortOrder ?? 0,
      event,
    });

    return await this.mediaRepository.save(media);
  }

  async findByEvent(eventId: string): Promise<EventMedia[]> {
    return await this.mediaRepository.find({
      where: { event: { id: eventId } },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<EventMedia> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Média #${id} non trouvé`);
    }
    return media;
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<EventMedia> {
    const media = await this.findOne(id);
    media.sortOrder = sortOrder;
    return await this.mediaRepository.save(media);
  }

  async remove(id: string): Promise<void> {
    const media = await this.findOne(id);
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), media.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await this.mediaRepository.remove(media);
  }

  async removeByEvent(eventId: string): Promise<void> {
    const mediaList = await this.findByEvent(eventId);
    for (const media of mediaList) {
      await this.remove(media.id);
    }
  }

  private detectMediaType(mimetype: string): MediaType {
    if (mimetype.startsWith('image/')) return MediaType.IMAGE;
    if (mimetype.startsWith('video/')) return MediaType.VIDEO;
    return MediaType.DOCUMENT;
  }
}
