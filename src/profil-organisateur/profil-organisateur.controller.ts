import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProfilOrganisateurService } from './profil-organisateur.service';
import { CreateProfilOrganisateurDto } from './dto/create-profil-organisateur.dto';
import { UpdateProfilOrganisateurDto } from './dto/update-profil-organisateur.dto';

@Controller('profil-organisateur')
export class ProfilOrganisateurController {
  constructor(private readonly profilOrganisateurService: ProfilOrganisateurService) {}

  @Post()
  create(@Body() createProfilOrganisateurDto: CreateProfilOrganisateurDto) {
    return this.profilOrganisateurService.create(createProfilOrganisateurDto);
  }

  @Get()
  findAll() {
    return this.profilOrganisateurService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profilOrganisateurService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProfilOrganisateurDto: UpdateProfilOrganisateurDto) {
    return this.profilOrganisateurService.update(+id, updateProfilOrganisateurDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profilOrganisateurService.remove(+id);
  }
}
