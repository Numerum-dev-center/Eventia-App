import { Controller, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PlatformSettingsService } from './platform-settings.service';
import { UpdatePlatformSettingDto } from './dto/update-platform-setting.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/common/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Platform Settings')
@Controller('platform-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PlatformSettingsController {
  constructor(private readonly settingsService: PlatformSettingsService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all platform settings' })
  findAll() {
    return this.settingsService.findAll();
  }

  @Get('defaults')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get default platform settings' })
  getDefaults() {
    return this.settingsService.getDefaults();
  }

  @Get(':key')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get a specific setting' })
  findByKey(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  @Patch()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create or update a platform setting' })
  upsert(@Body() dto: UpdatePlatformSettingDto) {
    return this.settingsService.upsert(dto.key, dto.value, dto.description);
  }

  @Delete(':key')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a platform setting' })
  remove(@Param('key') key: string) {
    return this.settingsService.remove(key);
  }
}
