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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.ADMIN)
  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @Roles(Role.ADMIN)
  @Get('liste')
  async findAllAlias() {
    return await this.userService.findAll();
  }

  @Get('details/:id')
  async findDetails(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile.' })
  async getMe(@GetUser() user: AuthenticatedUser) {
    return this.userService.findOne(user.id);
  }

  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile (any role)' })
  @ApiBody({ type: BaseUpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  async updateMe(
    @GetUser() user: AuthenticatedUser,
    @Body() updateDto: BaseUpdateProfileDto,
  ) {
    return this.userService.update(user.id, updateDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  @Patch('me/change-password')
  async changePassword(
    @GetUser() user: AuthenticatedUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(user.id, changePasswordDto);
  }

  @Patch('me/profil-client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update authenticated client profile' })
  @ApiBody({ type: BaseUpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  async updateProfileClient(
    @GetUser() user: AuthenticatedUser,
    @Body() updateClientDto: BaseUpdateProfileDto,
  ) {
    return this.userService.update(user.id, updateClientDto);
  }

  @Patch('me/profil-organisateur')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update authenticated organizer profile' })
  @ApiBody({ type: UpdateOrganizerDto })
  @ApiResponse({ status: 200, description: 'Organizer profile updated successfully.' })
  async updateProfileOrganizer(
    @GetUser() user: AuthenticatedUser,
    @Body() updateOrganizerDto: UpdateOrganizerDto,
  ) {
    return this.userService.updateOrganizer(user.id, updateOrganizerDto);
  }

  @Roles(Role.ADMIN)
  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return await this.userService.delete(id);
  }

  @Public()
  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate user account via code' })
  @ApiParam({ name: 'id', description: 'ID of the user to activate' })
  @ApiBody({ type: VerifyActivationDto })
  @ApiResponse({ status: 200, description: 'Account activated successfully.' })
  async activate(@Param('id') id: string, @Body() body: VerifyActivationDto) {
    return await this.userService.verifyActivation(id, body.code);
  }

  @Public()
  @Post('verify-reset-code')
  async verifyResetCode(@Body() dto: VerifyResetCodeDto) {
    return await this.userService.verifyPasswordResetCode(dto);
  }
}
