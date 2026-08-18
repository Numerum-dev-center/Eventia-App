import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatut } from 'src/common/event-statut.enum';
import { Role } from 'src/common/role.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  async create(
    @Body() createEventDto: CreateEventDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.eventService.create(createEventDto, user.id);
  }

  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @Get('published')
  findPublished() {
    return this.eventService.findPublished();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Get('organizer/:organizerId')
  @UseGuards(JwtAuthGuard)
  findByOrganizer(@Param('organizerId') organizerId: string) {
    return this.eventService.findByOrganizer(organizerId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER, Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.eventService.update(id, updateEventDto, user.id, user.role);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER, Role.ADMIN)
  updateStatut(
    @Param('id') id: string,
    @Body('status') statut: EventStatut,
  ) {
    return this.eventService.updateStatut(id, statut);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }
}
