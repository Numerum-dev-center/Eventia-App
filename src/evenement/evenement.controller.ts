import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { EvenementService } from './evenement.service';
import { CreateEvenementDto } from './dto/create-evenement.dto';
import { UpdateEvenementDto } from './dto/update-evenement.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Role } from 'src/common/role.enum';
import { StatutEvenement } from 'src/common/statut-evenement.enum';
import { UtilisateurService } from 'src/utilisateur/utilisateur.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvenementController {
  constructor(
    private readonly evenementService: EvenementService,
    private readonly utilisateurService: UtilisateurService,
  ) {}

  // --- Public ---

  @Public()
  @Get('evenement')
  findPublished() {
    return this.evenementService.findPublished();
  }

  @Public()
  @Get('evenement/:id')
  findOnePublic(@Param('id') id: string) {
    return this.evenementService.findOnePublic(id);
  }

  // --- Organisateur ---

  @Roles(Role.ORGANISATEUR)
  @Post('organizer/events')
  async create(
    @Body() dto: CreateEvenementDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const profilId = await this.utilisateurService.getProfilOrganisateurId(
      user.id,
    );
    return this.evenementService.create(dto, profilId);
  }

  @Roles(Role.ORGANISATEUR)
  @Get('organizer/events')
  async findMine(@GetUser() user: AuthenticatedUser) {
    const profilId = await this.utilisateurService.getProfilOrganisateurId(
      user.id,
    );
    return this.evenementService.findAllByOrganisateur(profilId);
  }

  @Roles(Role.ORGANISATEUR)
  @Patch('organizer/events/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEvenementDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const profilId = await this.utilisateurService.getProfilOrganisateurId(
      user.id,
    );
    return this.evenementService.update(id, profilId, dto);
  }

  @Roles(Role.ORGANISATEUR)
  @Post('organizer/events/:id/publish')
  async publish(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const profilId = await this.utilisateurService.getProfilOrganisateurId(
      user.id,
    );
    return this.evenementService.publish(id, profilId);
  }

  @Roles(Role.ORGANISATEUR)
  @Delete('organizer/events/:id')
  async remove(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const profilId = await this.utilisateurService.getProfilOrganisateurId(
      user.id,
    );
    await this.evenementService.remove(id, profilId);
    return { message: 'Événement supprimé' };
  }

  // --- Admin ---

  @Roles(Role.ADMIN)
  @Get('admin/events')
  findAllAdmin() {
    return this.evenementService.findAllAdmin();
  }

  @Roles(Role.ADMIN)
  @Patch('admin/events/:id/status')
  setStatut(
    @Param('id') id: string,
    @Body('statut') statut: StatutEvenement,
  ) {
    return this.evenementService.setStatutAdmin(id, statut);
  }
}
