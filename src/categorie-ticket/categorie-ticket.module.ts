import { Module } from '@nestjs/common';
import { CategorieTicketService } from './categorie-ticket.service';
import { CategorieTicketController } from './categorie-ticket.controller';
import { Evenement } from 'src/evenement/entities/evenement.entity';
import { TicketEmis } from 'src/tickets/entities/ticket-emis.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([Evenement, TicketEmis])],
  controllers: [CategorieTicketController],
  providers: [CategorieTicketService],
})
export class CategorieTicketModule {}
