import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommissionService } from './commission.service';
import { UpdateCommissionRateDto } from './dto/create-commission.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/common/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('commission')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.commissionService.findAll();
  }

  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getPayoutHistory(
    @Query() query: { isPaid?: string; page?: string; limit?: string },
  ) {
    return this.commissionService.getPayoutHistory(query);
  }

  @Get('organizer/:organizerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANIZER)
  getByOrganizer(@Param('organizerId') organizerId: string) {
    return this.commissionService.getByOrganizer(organizerId);
  }

  @Get('event/:eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANIZER)
  findByEvent(@Param('eventId') eventId: string) {
    return this.commissionService.findByEvent(eventId);
  }

  @Patch(':id/rate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateRate(@Param('id') id: string, @Body() dto: UpdateCommissionRateDto) {
    return this.commissionService.updateRate(id, dto.rate);
  }

  @Patch(':id/pay')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  markAsPaid(@Param('id') id: string) {
    return this.commissionService.markAsPaid(id);
  }

  @Patch(':id/refuse')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  refusePayout(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.commissionService.refusePayout(id, reason);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getStats() {
    const totalCommissions = await this.commissionService.getTotalCommissions();
    const totalPayouts = await this.commissionService.getTotalPayouts();
    return { totalCommissions, totalPayouts };
  }
}
