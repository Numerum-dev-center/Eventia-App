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
import { TicketCategoryService } from './ticket-category.service';
import { CreateTicketCategoryDto } from './dto/create-ticket-category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket-category.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/common/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('ticket-category')
export class TicketCategoryController {
  constructor(private readonly ticketCategoryService: TicketCategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  create(@Body() dto: CreateTicketCategoryDto) {
    return this.ticketCategoryService.create(dto);
  }

  @Get()
  findAll() {
    return this.ticketCategoryService.findAll();
  }

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string) {
    return this.ticketCategoryService.findByEvent(eventId);
  }

  @Get('categorie-ticket/:id')
  findOne(@Param('id') id: string) {
    return this.ticketCategoryService.findOne(id);
  }

  @Get(':id')
  findOneByParam(@Param('id') id: string) {
    return this.ticketCategoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  update(@Param('id') id: string, @Body() dto: UpdateTicketCategoryDto) {
    return this.ticketCategoryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.ticketCategoryService.remove(id);
  }
}
