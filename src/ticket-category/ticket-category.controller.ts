import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TicketCategoryService } from './ticket-category.service';
import { CreateTicketCategoryDto } from './dto/create-ticket-category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket-category.dto';

@Controller('ticket-category')
export class TicketCategoryController {
  constructor(private readonly ticketCategoryService: TicketCategoryService) {}

  @Post()
  create(@Body() createTicketCategoryDto: CreateTicketCategoryDto) {
    return this.ticketCategoryService.create(createTicketCategoryDto);
  }

  @Get()
  findAll() {
    return this.ticketCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketCategoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategorieTicketDto: UpdateTicketCategoryDto) {
    return this.ticketCategoryService.update(+id, updateCategorieTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketCategoryService.remove(+id);
  }
}
