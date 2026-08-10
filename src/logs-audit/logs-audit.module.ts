import { Module } from '@nestjs/common';
import { LogsAuditService } from './logs-audit.service';
import { LogsAuditController } from './logs-audit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilisateur } from 'src/utilisateur/entities/utilisateur.entity';
import { LogsAudit } from './entities/logs-audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Utilisateur, LogsAudit])],
  controllers: [LogsAuditController],
  providers: [LogsAuditService],
})
export class LogsAuditModule {}
