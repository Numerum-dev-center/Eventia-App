import { Module } from '@nestjs/common';
import { CategorieTicketService } from './categorie-ticket.service';
import { CategorieTicketController } from './categorie-ticket.controller';

@Module({
  controllers: [CategorieTicketController],
  providers: [CategorieTicketService],
})
export class CategorieTicketModule {}
