import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/common/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.ORGANIZER)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Sales report' })
  getSalesReport(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.getSalesReport(startDate, endDate);
  }

  @Get('financial')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Financial report' })
  getFinancialReport(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.getFinancialReport(startDate, endDate);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Ticket report' })
  getTicketReport(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.getTicketReport(startDate, endDate);
  }

  @Get('users')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'User report' })
  getUserReport() {
    return this.reportsService.getUserReport();
  }

  @Get('events')
  @ApiOperation({ summary: 'Event report' })
  getEventReport() {
    return this.reportsService.getEventReport();
  }

  @Get('checkin')
  @ApiOperation({ summary: 'Check-in report' })
  getCheckinReport(@Query('eventId') eventId?: string) {
    return this.reportsService.getCheckinReport(eventId);
  }
}
