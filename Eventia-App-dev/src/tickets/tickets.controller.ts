import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TicketService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/common/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  create(@Body() dto: CreateTicketDto) {
    return this.ticketService.create(dto.orderId, dto.ticketCategoryId, dto.quantity);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.ticketService.findAll();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's tickets" })
  findMyTickets(
    @GetUser() user: AuthenticatedUser,
    @Query('status') status?: string,
  ) {
    return this.ticketService.findByClient(user.id, status);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  findByOrder(@Param('orderId') orderId: string) {
    return this.ticketService.findByOrder(orderId);
  }

  @Get('event/:eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER, Role.ADMIN)
  findByEvent(
    @Param('eventId') eventId: string,
    @Query() query: { search?: string; ticketType?: string; paymentStatus?: string; page?: string; limit?: string },
  ) {
    return this.ticketService.findByEvent(eventId, query);
  }

  @Get('code/:code')
  @UseGuards(JwtAuthGuard)
  findByCode(@Param('code') code: string) {
    return this.ticketService.findByCode(code);
  }

  @Get(':id/qr')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate QR code for a ticket' })
  async getQRCode(@Param('id') id: string) {
    const qrDataUrl = await this.ticketService.generateQRCode(id);
    return { qrCode: qrDataUrl };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.ticketService.findOne(id);
  }

  @Patch(':id/validate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANIZER)
  validateTicket(
    @Param('id') id: string,
    @Body('scannerUserId') scannerUserId: string,
  ) {
    return this.ticketService.validateTicket(id, scannerUserId);
  }

  @Patch(':id/invalidate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel/invalidate a ticket (admin only)' })
  invalidateTicket(@Param('id') id: string) {
    return this.ticketService.invalidateTicket(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.ticketService.remove(id);
  }
}
