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
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/role.enum';
import { VerifyActivationDto } from './dto/verify-activation.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { VerifyResetCodeDto } from 'src/user/dto/verify-reset-code.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { BaseUpdateProfileDto } from './dto/base-update-profile.dto';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard) // Protection par défaut pour toutes les routes
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.ADMIN) // Seul un admin peut voir tous les utilisateurs
  @Get('list')
  async findAll() {
    return await this.userService.findAll();
  }

  @Get('details/:id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  @Patch('me/change-password')
  async changePassword(
  @GetUser() user: AuthenticatedUser,
  @Body() changePasswordDto: ChangePasswordDto
) {
  return this.userService.changePassword(user.id, changePasswordDto);
}

  @Patch('me/profil-client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour le profil client connecté' })
  @ApiBody({ type: BaseUpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profil mis à jour.' })
  async updateProfileClient(
    @GetUser() user: AuthenticatedUser, 
    @Body() updateClientDto: BaseUpdateProfileDto
  ) {
    return this.userService.update(user.id, updateClientDto);
  }

  @Patch('me/profile-organisateur')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour le profil organisateur connecté' })
  @ApiBody({ type: UpdateOrganizerDto })
  @ApiResponse({ status: 200, description: 'Profil organisateur mis à jour.' })
  async updateProfileOrganisateur(
    @GetUser() user: AuthenticatedUser,
    @Body() updateOrganizerDto: UpdateOrganizerDto
  ) {
    // Ici, le service saura qu'il doit aussi mettre à jour la table profil_organisateurs
    return this.userService.updateOrganizer(user.id, updateOrganizerDto);
  }

  @Roles(Role.ADMIN)
  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return await this.userService.delete(id);
  }

  @Public()
  @Post(':id/activer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activer un compte utilisateur via code' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur à activer' })
  @ApiBody({ type: VerifyActivationDto })
  @ApiResponse({ status: 200, description: 'Compte activé avec succès.' })
  async activate(@Param('id') id: string, @Body() body: VerifyActivationDto) {
  return await this.userService.verifyActivation(id, body.code);
  }

  @Public()
  @Post('verify-reset-code')
  async verifyResetCode(@Body() dto: VerifyResetCodeDto) {
    // Vérifie si le code est correct et non expiré
    return await this.userService.verifyPasswordResetCode(dto);
  }
}
