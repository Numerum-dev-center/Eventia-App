import { Injectable } from '@nestjs/common';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';

@Injectable()
export class AuditLogService {
  create(createAuditLogDto: CreateAuditLogDto) {
    return 'This action adds a new logsAudit';
  }

  findAll() {
    return `This action returns all logsAudit`;
  }

  findOne(id: number) {
    return `This action returns a #${id} logsAudit`;
  }

  update(id: number, updateLogsAuditDto: UpdateAuditLogDto) {
    return `This action updates a #${id} logsAudit`;
  }

  remove(id: number) {
    return `This action removes a #${id} logsAudit`;
  }
}
