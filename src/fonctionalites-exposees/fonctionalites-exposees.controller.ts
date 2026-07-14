import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FonctionalitesExposeesService } from './fonctionalites-exposees.service';
import { CreateFonctionalitesExposeeDto } from './dto/create-fonctionalites-exposee.dto';
import { UpdateFonctionalitesExposeeDto } from './dto/update-fonctionalites-exposee.dto';

@Controller('fonctionalites-exposees')
export class FonctionalitesExposeesController {
  constructor(private readonly fonctionalitesExposeesService: FonctionalitesExposeesService) {}

  @Post()
  create(@Body() createFonctionalitesExposeeDto: CreateFonctionalitesExposeeDto) {
    return this.fonctionalitesExposeesService.create(createFonctionalitesExposeeDto);
  }

  @Get()
  findAll() {
    return this.fonctionalitesExposeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fonctionalitesExposeesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFonctionalitesExposeeDto: UpdateFonctionalitesExposeeDto) {
    return this.fonctionalitesExposeesService.update(+id, updateFonctionalitesExposeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fonctionalitesExposeesService.remove(+id);
  }
}
