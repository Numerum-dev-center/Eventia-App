import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TableauDeBordService } from './tableau-de-bord.service';
import { CreateTableauDeBordDto } from './dto/create-tableau-de-bord.dto';
import { UpdateTableauDeBordDto } from './dto/update-tableau-de-bord.dto';

@Controller('tableau-de-bord')
export class TableauDeBordController {
  constructor(private readonly tableauDeBordService: TableauDeBordService) {}

  @Post()
  create(@Body() createTableauDeBordDto: CreateTableauDeBordDto) {
    return this.tableauDeBordService.create(createTableauDeBordDto);
  }

  @Get()
  findAll() {
    return this.tableauDeBordService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tableauDeBordService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTableauDeBordDto: UpdateTableauDeBordDto,
  ) {
    return this.tableauDeBordService.update(+id, updateTableauDeBordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tableauDeBordService.remove(+id);
  }
}
