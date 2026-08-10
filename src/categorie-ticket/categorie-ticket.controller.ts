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
import { CategorieTicketService } from './categorie-ticket.service';
import { CreateCategorieTicketDto } from './dto/create-categorie-ticket.dto';
import { UpdateCategorieTicketDto } from './dto/update-categorie-ticket.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Role } from 'src/common/role.enum';
import { UtilisateurService } from 'src/utilisateur/utilisateur.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategorieTicketController {
  constructor(
    private readonly categorieTicketService: CategorieTicketService,
    private readonly utilisateurService: UtilisateurService,
  ) {}

  @Roles(Role.ORGANISATEUR)
  @Post('organizer/events/:evenementId/categories')
  async create(
    @Param('evenementId') evenementId: string,
    @Body() dto: CreateCategorieTicketDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const profilId = await this.utilisateurService.getProfilOrganisateurId(user.id);
    return this.categorieTicketService.create(evenementId, profilId, dto);
  }

  @Public()
  @Get('evenement/:evenementId/categories')
  findAllByEvenement(@Param('evenementId') evenementId: string) {
    return this.categorieTicketService.findAllByEvenement(evenementId);
  }

  @Public()
  @Get('categorie-ticket/:id')
  findOne(@Param('id') id: string) {
    return this.categorieTicketService.findOne(id);
  }

  @Roles(Role.ORGANISATEUR)
  @Patch('categorie-ticket/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategorieTicketDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const profilId = await this.utilisateurService.getProfilOrganisateurId(user.id);
    return this.categorieTicketService.update(id, profilId, dto);
  }

  @Roles(Role.ORGANISATEUR)
  @Delete('categorie-ticket/:id')
  async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const profilId = await this.utilisateurService.getProfilOrganisateurId(user.id);
    await this.categorieTicketService.remove(id, profilId);
    return { message: 'Catégorie de billet supprimée' };
  }
}
