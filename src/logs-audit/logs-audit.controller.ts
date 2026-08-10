import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LogsAuditService } from './logs-audit.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/common/role.enum';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class LogsAuditController {
  constructor(private readonly logsAuditService: LogsAuditService) {}

  @Get('admin/audit-log')
  findAll(
    @Query('userId') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.logsAuditService.findAll({ userId, from, to });
  }
}
