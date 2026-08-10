import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TableauDeBordService } from './tableau-de-bord.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Role } from 'src/common/role.enum';
import { UtilisateurService } from 'src/utilisateur/utilisateur.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TableauDeBordController {
  constructor(
    private readonly tableauDeBordService: TableauDeBordService,
    private readonly utilisateurService: UtilisateurService,
  ) {}

  @Roles(Role.ADMIN)
  @Get('admin/dashboard')
  dashboardAdmin() {
    return this.tableauDeBordService.dashboardAdmin();
  }

  @Roles(Role.ADMIN)
  @Get('admin/reports')
  reportsAdmin(@Query('from') from?: string, @Query('to') to?: string) {
    return this.tableauDeBordService.reportsAdmin(from, to);
  }

  @Roles(Role.ORGANISATEUR)
  @Get('organizer/dashboard')
  async dashboardOrganisateur(@GetUser() user: AuthenticatedUser) {
    const profilId = await this.utilisateurService.getProfilOrganisateurId(user.id);
    return this.tableauDeBordService.dashboardOrganisateur(profilId);
  }
}
