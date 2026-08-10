import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { LogsAudit } from './entities/logs-audit.entity';

@Injectable()
export class LogsAuditService {
  constructor(
    @InjectRepository(LogsAudit)
    private logsAuditRepository: Repository<LogsAudit>,
  ) {}

  async findAll(filters: { userId?: string; from?: string; to?: string }) {
    const where: Record<string, unknown> = {};
    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.from && filters.to) {
      where.createdAt = Between(new Date(filters.from), new Date(filters.to));
    }
    return this.logsAuditRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }
}
