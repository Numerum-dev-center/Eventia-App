/* eslint-disable @typescript-eslint/no-unused-vars */
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

@Controller('tableau-de-bord')
export class TableauDeBordController {
  constructor(private readonly tableauDeBordService: TableauDeBordService) {}

  @Get()
  findAll() {
    return this.tableauDeBordService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tableauDeBordService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tableauDeBordService.remove(+id);
  }
}
