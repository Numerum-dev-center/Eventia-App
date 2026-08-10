import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ControleDaccesService } from './controle-dacces.service';
import { ScanTicketDto } from './dto/scan-ticket.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Role } from 'src/common/role.enum';
import { UtilisateurService } from 'src/utilisateur/utilisateur.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ORGANISATEUR)
export class ControleDaccesController {
  constructor(
    private readonly controleDaccesService: ControleDaccesService,
    private readonly utilisateurService: UtilisateurService,
  ) {}

  @Post('organizer/scan')
  async scanner(@Body() dto: ScanTicketDto, @GetUser() user: AuthenticatedUser) {
    const profilId = await this.utilisateurService.getProfilOrganisateurId(user.id);
    return this.controleDaccesService.scanner(dto, user.id, profilId);
  }

  @Get('organizer/events/:id/acces')
  journal(@Param('id') id: string) {
    return this.controleDaccesService.journalByEvenement(id);
  }
}
