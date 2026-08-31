import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdministratorService } from './administrator.service';
import { ReportsService } from 'src/reports/reports.service';
import { CommissionService } from 'src/commission/commission.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/role.enum';
import { EventStatut } from 'src/common/event-statut.enum';

// Alias français du frontend : /admin/* -> backend AdministratorService/Reports/Commission
@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly administratorService: AdministratorService,
    private readonly reportsService: ReportsService,
    private readonly commissionService: CommissionService,
  ) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getDashboard() {
    return this.administratorService.getUserStats();
  }

  @Get('events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getEvents() {
    return this.administratorService.getAllEvents();
  }

  @Patch('events/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  moderate(
    @Param('id') id: string,
    @Body('status') statut: EventStatut,
    @Body('reason') reason?: string,
  ) {
    return this.administratorService.moderateEvent(id, statut, reason);
  }

  @Get('reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getReports(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.getFinancialReport(startDate, endDate);
  }

  @Get('commissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getCommissions() {
    const totalCommissions = await this.commissionService.getTotalCommissions();
    const totalPayouts = await this.commissionService.getTotalPayouts();
    return { totalCommissions, totalPayouts };
  }

  @Get('reversements-orga')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getReversements(@Query('isPaid') isPaid?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.commissionService.getPayoutHistory({ isPaid, page, limit });
  }
}
