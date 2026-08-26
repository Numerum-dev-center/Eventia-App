import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commission } from './entities/commission.entity';

const DEFAULT_COMMISSION_RATE = 10.0;

@Injectable()
export class CommissionService {
  constructor(
    @InjectRepository(Commission)
    private commissionRepository: Repository<Commission>,
  ) {}

  private readonly logger = new Logger(CommissionService.name);

  async calculate(eventId: string, revenue: number): Promise<Commission> {
    const existing = await this.commissionRepository.findOne({
      where: { event: { id: eventId } },
    });

    const rate = existing?.rate ?? DEFAULT_COMMISSION_RATE;
    const amount = Math.round(revenue * (rate / 100) * 100) / 100;
    const organizerPayout = Math.round((revenue - amount) * 100) / 100;

    const commission = this.commissionRepository.create({
      rate,
      amount,
      organizerPayout,
      event: { id: eventId },
    });

    return await this.commissionRepository.save(commission);
  }

  async findAll(): Promise<Commission[]> {
    return await this.commissionRepository.find({
      relations: { event: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByEvent(eventId: string): Promise<Commission[]> {
    return await this.commissionRepository.find({
      where: { event: { id: eventId } },
      order: { createdAt: 'DESC' },
    });
  }

  async updateRate(id: string, rate: number): Promise<Commission> {
    const commission = await this.commissionRepository.findOne({ where: { id } });
    if (!commission) {
      throw new NotFoundException(`Commission #${id} non trouvée`);
    }
    commission.rate = rate;
    commission.amount = Math.round((commission.amount / (commission.rate / 100)) * (rate / 100) * 100) / 100;
    commission.organizerPayout = Math.round((commission.amount / (rate / 100)) - commission.amount * 100) / 100;
    return await this.commissionRepository.save(commission);
  }

  async markAsPaid(id: string): Promise<Commission> {
    const commission = await this.commissionRepository.findOne({ where: { id } });
    if (!commission) {
      throw new NotFoundException(`Commission #${id} non trouvée`);
    }
    commission.isPaid = true;
    return await this.commissionRepository.save(commission);
  }

  async getTotalCommissions(): Promise<number> {
    const result = await this.commissionRepository
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.amount), 0)', 'total')
      .getRawOne();
    return Number(result?.total || 0);
  }

  async getTotalPayouts(): Promise<number> {
    const result = await this.commissionRepository
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.organizerPayout), 0)', 'total')
      .getRawOne();
    return Number(result?.total || 0);
  }

  async getPayoutHistory(query: {
    isPaid?: string;
    page?: string;
    limit?: string;
  }) {
    const qb = this.commissionRepository
      .createQueryBuilder('commission')
      .leftJoinAndSelect('commission.event', 'event');

    if (query.isPaid !== undefined) {
      qb.andWhere('commission.isPaid = :isPaid', {
        isPaid: query.isPaid === 'true',
      });
    }

    qb.orderBy('commission.createdAt', 'DESC');
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Number(query.limit) || 20);
    qb.skip((page - 1) * limit).take(limit);

    const [commissions, total] = await qb.getManyAndCount();
    return {
      commissions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async refusePayout(id: string, reason: string) {
    const commission = await this.commissionRepository.findOne({ where: { id } });
    if (!commission)
      throw new NotFoundException(`Commission #${id} not found`);
    commission.refusalReason = reason;
    commission.isPaid = false;
    return this.commissionRepository.save(commission);
  }

  async getByOrganizer(organizerId: string) {
    return this.commissionRepository
      .createQueryBuilder('commission')
      .leftJoinAndSelect('commission.event', 'event')
      .innerJoin(
        'event.organizerProfile',
        'op',
        'op.id = :organizerId',
        { organizerId },
      )
      .getMany();
  }
}
