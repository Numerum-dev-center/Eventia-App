import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidationTicketLog } from './entities/ticket-validation-log.entity';
import { CreateAcessControlDto } from './dto/create-acess-control.dto';
import { UpdateAcessControlDto } from './dto/update-acess-control.dto';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { TicketValidationStatut } from 'src/common/ticket-validation-statut.enum';

@Injectable()
export class AcessControlService {
  constructor(
    @InjectRepository(ValidationTicketLog)
    private validationLogRepository: Repository<ValidationTicketLog>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  private readonly logger = new Logger(AcessControlService.name);

  async validateTicket(dto: CreateAcessControlDto): Promise<{ success: boolean; message: string; log: ValidationTicketLog }> {
    try {
      const ticket = await this.ticketRepository.findOne({
        where: { id: dto.ticketId },
        relations: { ticketCategory: { event: true } },
      });

      if (!ticket) {
        const log = this.validationLogRepository.create({
          ...dto,
          isSuccess: false,
          errorMessage: 'Billet non trouvé',
        });
        const savedLog = await this.validationLogRepository.save(log);
        return { success: false, message: 'Billet non trouvé', log: savedLog };
      }

      if (ticket.validationStatut === TicketValidationStatut.SCANNNED) {
        const log = this.validationLogRepository.create({
          ...dto,
          isSuccess: false,
          errorMessage: 'Billet déjà utilisé',
        });
        const savedLog = await this.validationLogRepository.save(log);
        return { success: false, message: 'Billet déjà utilisé', log: savedLog };
      }

      if (ticket.validationStatut === TicketValidationStatut.INVALID) {
        const log = this.validationLogRepository.create({
          ...dto,
          isSuccess: false,
          errorMessage: 'Billet invalide',
        });
        const savedLog = await this.validationLogRepository.save(log);
        return { success: false, message: 'Billet invalide', log: savedLog };
      }

      ticket.validationStatut = TicketValidationStatut.SCANNNED;
      ticket.scanDate = new Date();
      await this.ticketRepository.save(ticket);

      const log = this.validationLogRepository.create({
        ...dto,
        isSuccess: true,
        ticket,
      });
      const savedLog = await this.validationLogRepository.save(log);

      return { success: true, message: 'Accès validé', log: savedLog };
    } catch (error) {
      this.logger.error('Erreur lors de la validation du ticket', error);
      throw new InternalServerErrorException('Erreur lors de la validation');
    }
  }

  async findAll(): Promise<ValidationTicketLog[]> {
    return await this.validationLogRepository.find({
      relations: { ticket: { ticketCategory: { event: true } } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ValidationTicketLog> {
    const log = await this.validationLogRepository.findOne({
      where: { id },
      relations: { ticket: { ticketCategory: { event: true } } },
    });
    if (!log) {
      throw new NotFoundException(`Journal de validation #${id} non trouvé`);
    }
    return log;
  }

  async findByEvent(eventId: string): Promise<ValidationTicketLog[]> {
    return await this.validationLogRepository
      .createQueryBuilder('log')
      .innerJoin('log.ticket', 'ticket')
      .innerJoin('ticket.ticketCategory', 'tc')
      .innerJoin('tc.event', 'event', 'event.id = :eventId', { eventId })
      .leftJoinAndSelect('log.ticket', 'ticketRef')
      .leftJoinAndSelect('ticketRef.ticketCategory', 'tcRef')
      .orderBy('log.createdAt', 'DESC')
      .getMany();
  }

  async findByTicket(ticketId: string): Promise<ValidationTicketLog[]> {
    return await this.validationLogRepository.find({
      where: { ticketId },
      relations: { ticket: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getEntryStats(eventId: string) {
    const logs = await this.findByEvent(eventId);
    return {
      totalAttempts: logs.length,
      successfulEntries: logs.filter((l) => l.isSuccess).length,
      failedAttempts: logs.filter((l) => !l.isSuccess).length,
      entriesByLocation: logs
        .filter((l) => l.isSuccess)
        .reduce((acc, l) => {
          acc[l.location] = (acc[l.location] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
    };
  }

  async update(id: string, dto: UpdateAcessControlDto): Promise<ValidationTicketLog> {
    const log = await this.findOne(id);
    Object.assign(log, dto);
    return await this.validationLogRepository.save(log);
  }

  async remove(id: string): Promise<void> {
    const log = await this.findOne(id);
    await this.validationLogRepository.remove(log);
  }
}
