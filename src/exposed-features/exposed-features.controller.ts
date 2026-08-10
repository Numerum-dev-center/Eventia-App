import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExposedFeaturesService } from './exposed-features.service';
import { CreateExposedFeaturesDto } from './dto/create-exposed-features.dto';
import { UpdateExposedFeaturesDto } from './dto/update-exposed-features.dto';

@Controller('exposed-features')
export class ExposedFeaturesController {
  constructor(private readonly exposedFeaturesService: ExposedFeaturesService) {}

  @Post()
  create(@Body() createExposedFeaturesDto: CreateExposedFeaturesDto) {
    return this.exposedFeaturesService.create(createExposedFeaturesDto);
  }

  @Get()
  findAll() {
    return this.exposedFeaturesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exposedFeaturesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExposedFeaturesDto: UpdateExposedFeaturesDto) {
    return this.exposedFeaturesService.update(+id, updateExposedFeaturesDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exposedFeaturesService.remove(+id);
  }
}
