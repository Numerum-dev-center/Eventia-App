import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdministratorService } from './administrator.service';
import { ReportsService } from 'src/reports/reports.service';
import { CommissionService } from 'src/commission/commission.service';
import { OrganizerProfileService } from 'src/organizer-profile/organizer-profile.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/role.enum';
import { EventStatut } from 'src/common/event-statut.enum';
import { StatutVerification } from 'src/common/profile-organizer-validation-statut.enum';

// Alias français du frontend : /admin/* -> backend AdministratorService/Reports/Commission
@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly administratorService: AdministratorService,
    private readonly reportsService: ReportsService,
    private readonly commissionService: CommissionService,
    private readonly organizerProfileService: OrganizerProfileService,
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

  // --- Approbation / rejet des organisateurs (alias français) ---
  @Get('organizers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getOrganizers(@Query('search') search?: string) {
    if (search) {
      return this.administratorService.searchUsers({ search, role: 'ORGANIZER' });
    }
    return this.administratorService.getUsersByRole(Role.ORGANIZER);
  }

  @Get('organizers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getOrganizer(@Param('id') id: string) {
    return this.administratorService.getUserById(id);
  }

  @Patch('organizers/:id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  verifyOrganizer(@Param('id') id: string, @Body() body: any) {
    const statut = (body.statut ?? body.verificationStatut ?? body.status) as StatutVerification;
    return this.organizerProfileService.updateVerificationStatut(id, statut);
  }

  @Patch('organizer-profiles/:id/verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  setOrganizerVerification(@Param('id') id: string, @Body('statut') statut: StatutVerification) {
    return this.organizerProfileService.updateVerificationStatut(id, statut);
  }

  @Patch('organizers/:id/verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  setOrganizerVerification2(@Param('id') id: string, @Body('statut') statut: StatutVerification) {
    return this.organizerProfileService.updateVerificationStatut(id, statut);
  }

  // --- Alias modération d'événement ---
  @Patch('events/:id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  moderateEvent(@Param('id') id: string, @Body('statut') statut: EventStatut, @Body('reason') reason?: string) {
    return this.administratorService.moderateEvent(id, statut, reason);
  }

  @Patch('events/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  rejectEvent(@Param('id') id: string, @Body('reason') reason: string) {
    return this.administratorService.moderateEvent(id, EventStatut.REJECTED, reason);
  }
}
