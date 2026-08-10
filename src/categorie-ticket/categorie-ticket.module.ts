import { forwardRef, Module } from '@nestjs/common';
import { CategorieTicketService } from './categorie-ticket.service';
import { CategorieTicketController } from './categorie-ticket.controller';
import { Evenement } from 'src/evenement/entities/evenement.entity';
import { CategorieTicket } from './entities/categorie-ticket.entity';
import { TicketEmis } from 'src/tickets/entities/ticket-emis.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilisateurModule } from 'src/utilisateur/utilisateur.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evenement, CategorieTicket, TicketEmis]),
    forwardRef(() => UtilisateurModule),
  ],
  controllers: [CategorieTicketController],
  providers: [CategorieTicketService],
  exports: [CategorieTicketService],
})
export class CategorieTicketModule {}
