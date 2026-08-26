import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import { Ticket } from './entities/ticket.entity';
import { TicketValidationStatut } from 'src/common/ticket-validation-statut.enum';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  private readonly logger = new Logger(TicketService.name);

  async create(
    orderId: string,
    ticketCategoryId: string,
    quantity: number,
  ): Promise<Ticket[]> {
    try {
      const tickets: Ticket[] = [];

      for (let i = 0; i < quantity; i++) {
        const uniqueCode = this.generateUniqueCode();

        const ticket = this.ticketRepository.create({
          uniqueCodeCrypto: uniqueCode,
          validationStatut: TicketValidationStatut.VALID,
          order: { id: orderId },
          ticketCategory: { id: ticketCategoryId },
        });

        tickets.push(await this.ticketRepository.save(ticket));
      }

      return tickets;
    } catch (error) {
      this.logger.error('Failed to create tickets. Please verify the order and category.', error);
      throw new InternalServerErrorException('Failed to create tickets. Please verify the order and category.');
    }
  }

  async findAll(): Promise<Ticket[]> {
    return await this.ticketRepository.find({
      relations: { order: true, ticketCategory: { event: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: { order: true, ticketCategory: { event: true }, scanBy: true, logValidation: true },
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket #${id} non trouvé`);
    }
    return ticket;
  }

  async findByCode(code: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { uniqueCodeCrypto: code },
      relations: { ticketCategory: { event: true }, order: { client: true } },
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket avec le code ${code} non trouvé`);
    }
    return ticket;
  }

  async findByOrder(orderId: string): Promise<Ticket[]> {
    return await this.ticketRepository.find({
      where: { order: { id: orderId } },
      relations: { ticketCategory: { event: true } },
      order: { createdAt: 'ASC' },
    });
  }

  async findByClient(clientId: string, status?: string): Promise<Ticket[]> {
    const qb = this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.order', 'order')
      .innerJoinAndSelect('ticket.ticketCategory', 'ticketCategory')
      .leftJoinAndSelect('ticketCategory.event', 'event')
      .leftJoinAndSelect('ticket.order', 'orderFull')
      .where('order.client_id = :clientId', { clientId });

    if (status === 'upcoming') {
      qb.andWhere('ticket.validationStatut = :status', { status: TicketValidationStatut.VALID })
        .andWhere('event.startDate > :now', { now: new Date().toISOString() });
    } else if (status === 'used') {
      qb.andWhere('ticket.validationStatut = :status', { status: TicketValidationStatut.SCANNNED });
    } else if (status === 'cancelled') {
      qb.andWhere('ticket.validationStatut = :status', { status: TicketValidationStatut.INVALID });
    }

    qb.orderBy('ticket.createdAt', 'DESC');
    return qb.getMany();
  }

  async validateTicket(id: string, scannerUserId: string): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (ticket.validationStatut !== TicketValidationStatut.VALID) {
      throw new NotFoundException('Ticket already used or invalid.');
    }

    ticket.validationStatut = TicketValidationStatut.SCANNNED;
    ticket.scanDate = new Date();
    ticket.scanBy = { id: scannerUserId } as any;

    return await this.ticketRepository.save(ticket);
  }

  async invalidateTicket(id: string): Promise<Ticket> {
    const ticket = await this.findOne(id);
    ticket.validationStatut = TicketValidationStatut.INVALID;
    return await this.ticketRepository.save(ticket);
  }

  async generateQRCode(ticketId: string): Promise<string> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      select: { id: true, uniqueCodeCrypto: true },
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket #${ticketId} not found`);
    }
    const qrData = JSON.stringify({
      ticketId: ticket.id,
      code: ticket.uniqueCodeCrypto,
    });
    return QRCode.toDataURL(qrData);
  }

  async countByEvent(eventId: string): Promise<number> {
    return await this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.ticketCategory', 'tc')
      .innerJoin('tc.event', 'event', 'event.id = :eventId', { eventId })
      .getCount();
  }

  async countByEventAndStatus(eventId: string, status: TicketValidationStatut): Promise<number> {
    return await this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.ticketCategory', 'tc')
      .innerJoin('tc.event', 'event', 'event.id = :eventId', { eventId })
      .where('ticket.validationStatut = :status', { status })
      .getCount();
  }

  async findByEvent(eventId: string, query?: { search?: string; ticketType?: string; paymentStatus?: string; page?: string; limit?: string }): Promise<{ tickets: Ticket[]; pagination: any }> {
    const qb = this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.ticketCategory', 'tc')
      .innerJoin('tc.event', 'event', 'event.id = :eventId', { eventId })
      .leftJoinAndSelect('ticket.order', 'order')
      .leftJoinAndSelect('order.client', 'client')
      .leftJoinAndSelect('ticket.ticketCategory', 'ticketCategory');

    if (query?.search) {
      qb.andWhere('(LOWER(client.firstName) LIKE :search OR LOWER(client.lastName) LIKE :search OR LOWER(client.email) LIKE :search OR LOWER(client.phoneNumber) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` });
    }

    if (query?.ticketType) {
      qb.andWhere('tc.id = :ticketType', { ticketType: query.ticketType });
    }

    if (query?.paymentStatus) {
      qb.andWhere('order.paymentStatut = :paymentStatus', { paymentStatus: query.paymentStatus });
    }

    qb.orderBy('ticket.createdAt', 'DESC');

    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query?.limit) || 20));
    qb.skip((page - 1) * limit).take(limit);

    const [tickets, total] = await qb.getManyAndCount();
    return { tickets, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async remove(id: string): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketRepository.remove(ticket);
  }

  private generateUniqueCode(): string {
    return `EVT-${crypto.randomBytes(16).toString('hex').toUpperCase()}`;
  }
}
