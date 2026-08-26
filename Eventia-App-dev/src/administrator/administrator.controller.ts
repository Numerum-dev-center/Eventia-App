import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import { EventStatut } from 'src/common/event-statut.enum';
import { Role } from 'src/common/role.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('administrator')
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  @Get('users/search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  searchUsers(@Query() query: { search?: string; role?: string; isActive?: string; page?: string; limit?: string }) {
    return this.administratorService.searchUsers(query);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAllUsers() {
    return this.administratorService.getAllUsers();
  }

  @Get('users/role/:role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getUsersByRole(@Param('role') role: Role) {
    return this.administratorService.getUsersByRole(role);
  }

  @Patch('users/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateUserRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.administratorService.updateUserRole(id, role);
  }

  @Patch('users/:id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  toggleUserActive(@Param('id') id: string) {
    return this.administratorService.toggleUserActive(id);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteUser(@Param('id') id: string) {
    return this.administratorService.deleteUser(id);
  }

  @Get('events/search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  searchEvents(@Query() query: { search?: string; status?: string; category?: string; page?: string; limit?: string }) {
    return this.administratorService.searchEvents(query);
  }

  @Get('events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAllEvents() {
    return this.administratorService.getAllEvents();
  }

  @Get('events/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getPendingEvents() {
    return this.administratorService.getPendingEvents();
  }

  @Get('events/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getEventById(@Param('id') id: string) {
    return this.administratorService.getEventById(id);
  }

  @Patch('events/:id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  moderateEvent(
    @Param('id') id: string,
    @Body() body: { statut: EventStatut; reason?: string },
  ) {
    return this.administratorService.moderateEvent(id, body.statut, body.reason);
  }

  @Patch('events/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  rejectEvent(@Param('id') id: string, @Body('reason') reason: string) {
    return this.administratorService.rejectEvent(id, reason);
  }

  @Patch('events/:id/suspend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  suspendEvent(@Param('id') id: string) {
    return this.administratorService.suspendEvent(id);
  }

  @Get('financial')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getFinancialSummary() {
    return this.administratorService.getFinancialSummary();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getUserStats() {
    return this.administratorService.getUserStats();
  }
}
