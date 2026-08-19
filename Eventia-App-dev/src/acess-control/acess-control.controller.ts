import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AcessControlService } from './acess-control.service';
import { CreateAcessControlDto, UpdateAcessControlDto } from './dto/create-acess-control.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/common/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('AccessControl')
@Controller('access-control')
export class AcessControlController {
  constructor(private readonly acessControlService: AcessControlService) {}

  @Post('validate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANIZER)
  validateTicket(@Body() dto: CreateAcessControlDto) {
    return this.acessControlService.validateTicket(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANIZER)
  findAll() {
    return this.acessControlService.findAll();
  }

  @Get('event/:eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANIZER)
  findByEvent(@Param('eventId') eventId: string) {
    return this.acessControlService.findByEvent(eventId);
  }

  @Get('event/:eventId/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANIZER)
  getEntryStats(@Param('eventId') eventId: string) {
    return this.acessControlService.getEntryStats(eventId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.acessControlService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateAcessControlDto) {
    return this.acessControlService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.acessControlService.remove(id);
  }
}
