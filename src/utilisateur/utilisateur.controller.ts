import { MailerService } from '@nestjs-modules/mailer';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UtilisateurService } from './utilisateur.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/role.enum';
import { VerifyActivationDto } from './dto/verify-activation.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { VerifyResetCodeDto } from 'src/utilisateur/dto/verify-reset-code.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { BaseUpdateProfilDto } from './dto/base-update-profil.dto';
import { UpdateOrganisateurDto } from './dto/update-organisateur.dto';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('utilisateur')
@UseGuards(JwtAuthGuard, RolesGuard) // Protection par défaut pour toutes les routes
export class UtilisateurController {
  constructor(private readonly utilisateurService: UtilisateurService) {}

  @Roles(Role.ADMIN) // Seul un admin peut voir tous les utilisateurs
  @Get('liste')
  async findAll() {
    return await this.utilisateurService.findAll();
  }

  @Get('details/:id')
  async findOne(@Param('id') id: string) {
    return await this.utilisateurService.findOne(id);
  }

  @Patch('me/change-password')
  async changePassword(
  @GetUser() user: AuthenticatedUser,
  @Body() changePasswordDto: ChangePasswordDto
) {
  return this.utilisateurService.changePassword(user.id, changePasswordDto);
}

  @Patch('me/profil-client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour le profil client connecté' })
  @ApiBody({ type: BaseUpdateProfilDto })
  @ApiResponse({ status: 200, description: 'Profil mis à jour.' })
  async updateProfilClient(
    @GetUser() user: AuthenticatedUser, 
    @Body() updateClientDto: BaseUpdateProfilDto
  ) {
    return this.utilisateurService.update(user.id, updateClientDto);
  }

  @Patch('me/profil-organisateur')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour le profil organisateur connecté' })
  @ApiBody({ type: UpdateOrganisateurDto })
  @ApiResponse({ status: 200, description: 'Profil organisateur mis à jour.' })
  async updateProfilOrganisateur(
    @GetUser() user: AuthenticatedUser,
    @Body() updateOrganisateurDto: UpdateOrganisateurDto
  ) {
    // Ici, le service saura qu'il doit aussi mettre à jour la table profil_organisateurs
    return this.utilisateurService.updateOrganisateur(user.id, updateOrganisateurDto);
  }

  @Roles(Role.ADMIN)
  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return await this.utilisateurService.delete(id);
  }

  @Public()
  @Post(':id/activer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activer un compte utilisateur via code' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur à activer' })
  @ApiBody({ type: VerifyActivationDto })
  @ApiResponse({ status: 200, description: 'Compte activé avec succès.' })
  async activate(@Param('id') id: string, @Body() body: VerifyActivationDto) {
  return await this.utilisateurService.verifyActivation(id, body.code);
  }

  @Public()
  @Post('verify-reset-code')
  async verifyResetCode(@Body() dto: VerifyResetCodeDto) {
    // Vérifie si le code est correct et non expiré
    return await this.utilisateurService.verifyPasswordResetCode(dto);
  }
}
