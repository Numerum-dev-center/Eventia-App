import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdministrateurService } from './administrateur.service';
import { CreateAdministrateurDto } from './dto/create-administrateur.dto';
import { UpdateAdministrateurDto } from './dto/update-administrateur.dto';

@Controller('administrateur')
export class AdministrateurController {
  constructor(private readonly administrateurService: AdministrateurService) {}

  @Post()
  create(@Body() createAdministrateurDto: CreateAdministrateurDto) {
    return this.administrateurService.create(createAdministrateurDto);
  }

  @Get()
  findAll() {
    return this.administrateurService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.administrateurService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdministrateurDto: UpdateAdministrateurDto) {
    return this.administrateurService.update(+id, updateAdministrateurDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.administrateurService.remove(+id);
  }
}
