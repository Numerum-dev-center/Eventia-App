import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TicketCategoryService } from './ticket-category.service';
import { UpdateTicketCategoryDto } from './dto/update-ticket-category.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/common/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';

// Alias français du frontend : /categorie-ticket/:id -> /ticket-category/:id
@ApiTags('ticket-category')
@Controller('categorie-ticket')
export class CategorieTicketAliasController {
  constructor(private readonly ticketCategoryService: TicketCategoryService) {}

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  update(@Param('id') id: string, @Body() dto: UpdateTicketCategoryDto) {
    return this.ticketCategoryService.update(id, dto);
  }
}
