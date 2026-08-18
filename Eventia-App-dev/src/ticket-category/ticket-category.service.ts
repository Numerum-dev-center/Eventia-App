import { Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketCategory } from './entities/ticket-category.entity';
import { CreateTicketCategoryDto } from './dto/create-ticket-category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket-category.dto';

@Injectable()
export class TicketCategoryService {
  constructor(
    @InjectRepository(TicketCategory)
    private ticketCategoryRepository: Repository<TicketCategory>,
  ) {}

  private readonly logger = new Logger(TicketCategoryService.name);

  async create(dto: CreateTicketCategoryDto): Promise<TicketCategory> {
    try {
      const category = this.ticketCategoryRepository.create({
        name: dto.name,
        price: dto.price,
        totalQuantity: dto.totalQuantity,
        availableQuantity: dto.totalQuantity,
        limitByPerson: dto.limitByPerson,
        event: { id: dto.eventId },
      });
      return await this.ticketCategoryRepository.save(category);
    } catch (error) {
      this.logger.error('Failed to create ticket category. Please verify the event ID and data.', error);
      throw new InternalServerErrorException('Failed to create ticket category. Please verify the event ID and data.');
    }
  }

  async findAll(): Promise<TicketCategory[]> {
    return await this.ticketCategoryRepository.find({
      relations: { event: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByEvent(eventId: string): Promise<TicketCategory[]> {
    return await this.ticketCategoryRepository.find({
      where: { event: { id: eventId } },
      order: { price: 'ASC' },
    });
  }

  async findOne(id: string): Promise<TicketCategory> {
    const category = await this.ticketCategoryRepository.findOne({
      where: { id },
      relations: { event: true, ticket: true },
    });
    if (!category) {
      throw new NotFoundException(`Catégorie #${id} non trouvée`);
    }
    return category;
  }

  async update(id: string, dto: UpdateTicketCategoryDto): Promise<TicketCategory> {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return await this.ticketCategoryRepository.save(category);
  }

  async decrementAvailable(id: string, quantity: number): Promise<TicketCategory> {
    const category = await this.findOne(id);
    if (category.availableQuantity < quantity) {
      throw new NotFoundException(`Quantité insuffisante pour la catégorie "${category.name}"`);
    }
    category.availableQuantity -= quantity;
    return await this.ticketCategoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.ticketCategoryRepository.remove(category);
  }
}
