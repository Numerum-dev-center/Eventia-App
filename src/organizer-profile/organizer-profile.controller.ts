import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrganizerProfileService } from './organizer-profile.service';
import { CreateOrganizerProfileDto } from './dto/create-organizer-profile.dto';
import { UpdateOrganizerProfileDto } from './dto/update-organizer-profile.dto';

@Controller('organizer-profile')
export class OrganizerProfileController {
  constructor(private readonly organizerProfileService: OrganizerProfileService) {}

  @Post()
  create(@Body() createOrganizerProfileDto: CreateOrganizerProfileDto) {
    return this.organizerProfileService.create(createOrganizerProfileDto);
  }

  @Get()
  findAll() {
    return this.organizerProfileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizerProfileService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProfilOrganisateurDto: UpdateOrganizerProfileDto) {
    return this.organizerProfileService.update(+id, updateProfilOrganisateurDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizerProfileService.remove(+id);
  }
}
