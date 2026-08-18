import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventCategory } from './entities/event-category.entity';
import { CreateEventCategoryDto, UpdateEventCategoryDto } from './dto/create-event-category.dto';

@Injectable()
export class EventCategoryService {
  constructor(
    @InjectRepository(EventCategory)
    private categoryRepository: Repository<EventCategory>,
  ) {}

  private readonly logger = new Logger(EventCategoryService.name);

  async create(dto: CreateEventCategoryDto): Promise<EventCategory> {
    const existing = await this.categoryRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`La catégorie "${dto.name}" existe déjà`);
    }

    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category = this.categoryRepository.create({
      ...dto,
      slug,
    });
    return await this.categoryRepository.save(category);
  }

  async findAll(): Promise<EventCategory[]> {
    return await this.categoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findActive(): Promise<EventCategory[]> {
    return await this.categoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<EventCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Catégorie #${id} non trouvée`);
    }
    return category;
  }

  async update(id: string, dto: UpdateEventCategoryDto): Promise<EventCategory> {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return await this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }
}
