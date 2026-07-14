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
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/role.enum';
import { VerifyActivationDto } from './dto/verify-activation.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { VerifyResetCodeDto } from 'src/utilisateur/dto/verify-reset-code.dto';

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

  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateUtilisateurDto: UpdateUtilisateurDto,
  ) {
    return await this.utilisateurService.update(id, updateUtilisateurDto);
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
