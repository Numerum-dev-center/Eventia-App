import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilisateur } from 'src/utilisateur/entities/utilisateur.entity';
import { Commande } from 'src/commande/entities/commande.entity';
import { CategorieTicket } from 'src/categorie-ticket/entities/categorie-ticket.entity';
import { LogValidationBillet } from 'src/controle-dacces/entities/log-validation-billet.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Utilisateur,
      Commande,
      CategorieTicket,
      LogValidationBillet,
    ]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
