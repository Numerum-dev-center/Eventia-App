import { forwardRef, Module } from '@nestjs/common';
import { CommandeService } from './commande.service';
import { CommandeController } from './commande.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilisateur } from 'src/utilisateur/entities/utilisateur.entity';
import { Commande } from './entities/commande.entity';
import { TicketEmis } from 'src/tickets/entities/ticket-emis.entity';
import { Paiement } from 'src/paiement/entities/paiement.entity';
import { CategorieTicket } from 'src/categorie-ticket/entities/categorie-ticket.entity';
import { UtilisateurModule } from 'src/utilisateur/utilisateur.module';
import { EvenementModule } from 'src/evenement/evenement.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Utilisateur,
      Commande,
      TicketEmis,
      Paiement,
      CategorieTicket,
    ]),
    forwardRef(() => UtilisateurModule),
    forwardRef(() => EvenementModule),
  ],
  controllers: [CommandeController],
  providers: [CommandeService],
  exports: [CommandeService],
})
export class CommandeModule {}
