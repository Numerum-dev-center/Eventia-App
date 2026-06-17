import { Module } from '@nestjs/common';
import { LogsAuditService } from './logs-audit.service';
import { LogsAuditController } from './logs-audit.controller';

@Module({
  controllers: [LogsAuditController],
  providers: [LogsAuditService],
})
export class LogsAuditModule {}
