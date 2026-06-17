import { Injectable } from '@nestjs/common';
import { CreateLogsAuditDto } from './dto/create-logs-audit.dto';
import { UpdateLogsAuditDto } from './dto/update-logs-audit.dto';

@Injectable()
export class LogsAuditService {
  create(createLogsAuditDto: CreateLogsAuditDto) {
    return 'This action adds a new logsAudit';
  }

  findAll() {
    return `This action returns all logsAudit`;
  }

  findOne(id: number) {
    return `This action returns a #${id} logsAudit`;
  }

  update(id: number, updateLogsAuditDto: UpdateLogsAuditDto) {
    return `This action updates a #${id} logsAudit`;
  }

  remove(id: number) {
    return `This action removes a #${id} logsAudit`;
  }
}
