import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandeService } from './commande.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Role } from 'src/common/role.enum';
import { UtilisateurService } from 'src/utilisateur/utilisateur.service';
import { EvenementService } from 'src/evenement/evenement.service';

@Controller()
export class CommandeController {
  constructor(
    private readonly commandeService: CommandeService,
    private readonly utilisateurService: UtilisateurService,
    private readonly evenementService: EvenementService,
  ) {}

  @Public()
  @Post('evenement/reserver')
  reserver(@Body() dto: CreateReservationDto) {
    return this.commandeService.reserver(dto);
  }

  @Public()
  @Get('commande/:id')
  findOne(@Param('id') id: string) {
    return this.commandeService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANISATEUR)
  @Get('organizer/events/:id/billets')
  async findParticipants(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const profilId = await this.utilisateurService.getProfilOrganisateurId(user.id);
    await this.evenementService.findOwned(id, profilId);
    return this.commandeService.findAllByEvenement(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/billets')
  findAllAdmin() {
    return this.commandeService.findAllAdmin();
  }

  // --- Finances ---

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANISATEUR)
  @Get('organizer/events/:id/finance')
  async financeEvenement(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const profilId = await this.utilisateurService.getProfilOrganisateurId(user.id);
    await this.evenementService.findOwned(id, profilId);
    return this.commandeService.financeByEvenement(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANISATEUR)
  @Get('organizer/finance')
  async financeOrganisateur(@GetUser() user: AuthenticatedUser) {
    const profilId = await this.utilisateurService.getProfilOrganisateurId(user.id);
    const evenements = await this.evenementService.findAllByOrganisateur(profilId);
    return this.commandeService.financeByOrganisateur(profilId, evenements);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/commissions')
  commissionsAdmin() {
    return this.commandeService.commissionsAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/reversements-orga')
  async reversementsAdmin() {
    const evenements = await this.evenementService.findAllAdmin();
    const parOrganisateur = new Map<string, typeof evenements>();
    for (const ev of evenements) {
      const key = ev.profilOrganisateur.id;
      if (!parOrganisateur.has(key)) parOrganisateur.set(key, []);
      parOrganisateur.get(key)!.push(ev);
    }
    return this.commandeService.reversementsAdmin(parOrganisateur);
  }
}
