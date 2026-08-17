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
import { OrganizerProfileService } from './organizer-profile.service';
import { CreateOrganizerProfileDto } from './dto/create-organizer-profile.dto';
import { UpdateOrganizerProfileDto } from './dto/update-organizer-profile.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/common/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { StatutVerification } from 'src/common/profile-organizer-validation-statut.enum';

@Controller('organizer-profile')
export class OrganizerProfileController {
  constructor(private readonly organizerProfileService: OrganizerProfileService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  create(
    @Body() dto: CreateOrganizerProfileDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.organizerProfileService.create(dto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.organizerProfileService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  findMine(@GetUser() user: AuthenticatedUser) {
    return this.organizerProfileService.findByUserId(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.organizerProfileService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  update(@Param('id') id: string, @Body() dto: UpdateOrganizerProfileDto) {
    return this.organizerProfileService.update(id, dto);
  }

  @Patch(':id/verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateVerification(
    @Param('id') id: string,
    @Body('statut') statut: StatutVerification,
  ) {
    return this.organizerProfileService.updateVerificationStatut(id, statut);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.organizerProfileService.remove(id);
  }
}
