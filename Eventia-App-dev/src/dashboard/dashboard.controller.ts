import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/common/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getGlobalStats() {
    return this.dashboardService.getGlobalStats();
  }

  @Get('organizer/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  getOrganizerStats(@GetUser() user: AuthenticatedUser) {
    return this.dashboardService.getOrganizerStats(user.id);
  }

  @Get('event/:eventId/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER, Role.ADMIN)
  getEventStats(@Param('eventId') eventId: string) {
    return this.dashboardService.getEventStats(eventId);
  }

  @Get('activity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getRecentActivity() {
    return this.dashboardService.getRecentActivity();
  }

  @Get('event/:eventId/export-participants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER, Role.ADMIN)
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="participants.csv"')
  async exportParticipants(
    @Param('eventId') eventId: string,
    @Res() res: Response,
  ) {
    const csv = await this.dashboardService.exportParticipants(eventId);
    res.send(csv);
  }
}
