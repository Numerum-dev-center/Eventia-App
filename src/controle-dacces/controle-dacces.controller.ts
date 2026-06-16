import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ControleDaccesService } from './controle-dacces.service';
import { CreateControleDacceDto } from './dto/create-controle-dacce.dto';
import { UpdateControleDacceDto } from './dto/update-controle-dacce.dto';

@Controller('controle-dacces')
export class ControleDaccesController {
  constructor(private readonly controleDaccesService: ControleDaccesService) {}

  @Post()
  create(@Body() createControleDacceDto: CreateControleDacceDto) {
    return this.controleDaccesService.create(createControleDacceDto);
  }

  @Get()
  findAll() {
    return this.controleDaccesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.controleDaccesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateControleDacceDto: UpdateControleDacceDto) {
    return this.controleDaccesService.update(+id, updateControleDacceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.controleDaccesService.remove(+id);
  }
}
