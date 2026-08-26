import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  private readonly logger = new Logger(AuditLogService.name);

  async create(dto: CreateAuditLogDto): Promise<AuditLog> {
    const log = this.auditLogRepository.create({
      targetEntity: dto.targetEntity,
      targetId: dto.targetId,
      action: dto.action,
      changes: dto.changes,
      userId: dto.userId,
    });
    return await this.auditLogRepository.save(log);
  }

  async findAll(): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      relations: { user: true },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async findOne(id: string): Promise<AuditLog> {
    const log = await this.auditLogRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!log) {
      throw new NotFoundException(`Audit log #${id} not found`);
    }
    return log;
  }

  async findByTarget(entity: string, targetId: string): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { targetEntity: entity, targetId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { userId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async searchLogs(query: {
    action?: string;
    entity?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
    limit?: string;
  }) {
    const qb = this.auditLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user');

    if (query.action) {
      qb.andWhere('log.action = :action', { action: query.action });
    }
    if (query.entity) {
      qb.andWhere('log.targetEntity = :entity', { entity: query.entity });
    }
    if (query.userId) {
      qb.andWhere('log.userId = :userId', { userId: query.userId });
    }
    if (query.dateFrom) {
      qb.andWhere('log.createdAt >= :dateFrom', { dateFrom: query.dateFrom });
    }
    if (query.dateTo) {
      qb.andWhere('log.createdAt <= :dateTo', { dateTo: query.dateTo });
    }

    qb.orderBy('log.createdAt', 'DESC');

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Number(query.limit) || 20);
    qb.skip((page - 1) * limit).take(limit);

    const [logs, total] = await qb.getManyAndCount();
    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
