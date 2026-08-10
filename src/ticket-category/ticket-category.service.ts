import { Injectable } from '@nestjs/common';
import { CreateTicketCategoryDto } from './dto/create-ticket-category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket-category.dto';

@Injectable()
export class TicketCategoryService {
  create(createTicketCategoryDto: CreateTicketCategoryDto) {
    return 'This action adds a new categorieTicket';
  }

  findAll() {
    return `This action returns all categorieTicket`;
  }

  findOne(id: number) {
    return `This action returns a #${id} categorieTicket`;
  }

  update(id: number, updateTicketCategoryDto: UpdateTicketCategoryDto) {
    return `This action updates a #${id} categorieTicket`;
  }

  remove(id: number) {
    return `This action removes a #${id} categorieTicket`;
  }
}
