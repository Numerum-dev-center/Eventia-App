import { Injectable } from '@nestjs/common';
import { CreateCategorieTicketDto } from './dto/create-categorie-ticket.dto';
import { UpdateCategorieTicketDto } from './dto/update-categorie-ticket.dto';

@Injectable()
export class CategorieTicketService {
  create(createCategorieTicketDto: CreateCategorieTicketDto) {
    return 'This action adds a new categorieTicket';
  }

  findAll() {
    return `This action returns all categorieTicket`;
  }

  findOne(id: number) {
    return `This action returns a #${id} categorieTicket`;
  }

  update(id: number, updateCategorieTicketDto: UpdateCategorieTicketDto) {
    return `This action updates a #${id} categorieTicket`;
  }

  remove(id: number) {
    return `This action removes a #${id} categorieTicket`;
  }
}
