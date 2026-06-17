import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategorieTicketService } from './categorie-ticket.service';
import { CreateCategorieTicketDto } from './dto/create-categorie-ticket.dto';
import { UpdateCategorieTicketDto } from './dto/update-categorie-ticket.dto';

@Controller('categorie-ticket')
export class CategorieTicketController {
  constructor(private readonly categorieTicketService: CategorieTicketService) {}

  @Post()
  create(@Body() createCategorieTicketDto: CreateCategorieTicketDto) {
    return this.categorieTicketService.create(createCategorieTicketDto);
  }

  @Get()
  findAll() {
    return this.categorieTicketService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categorieTicketService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategorieTicketDto: UpdateCategorieTicketDto) {
    return this.categorieTicketService.update(+id, updateCategorieTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categorieTicketService.remove(+id);
  }
}
