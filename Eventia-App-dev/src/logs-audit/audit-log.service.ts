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
}
