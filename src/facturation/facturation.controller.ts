import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FacturationService } from './facturation.service';
import { CreateFacturationDto } from './dto/create-facturation.dto';
import { UpdateFacturationDto } from './dto/update-facturation.dto';

@Controller('facturation')
export class FacturationController {
  constructor(private readonly facturationService: FacturationService) {}

  @Post()
  create(@Body() createFacturationDto: CreateFacturationDto) {
    return this.facturationService.create(createFacturationDto);
  }

  @Get()
  findAll() {
    return this.facturationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facturationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFacturationDto: UpdateFacturationDto) {
    return this.facturationService.update(+id, updateFacturationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facturationService.remove(+id);
  }
}
