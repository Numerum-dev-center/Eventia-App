import { Module } from '@nestjs/common';
import { CommandeService } from './commande.service';
import { CommandeController } from './commande.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilisateur } from 'src/utilisateur/entities/utilisateur.entity';
import { TicketEmis } from 'src/tickets/entities/ticket-emis.entity';
import { Paiement } from 'src/paiement/entities/paiement.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Utilisateur, TicketEmis, Paiement])],
  controllers: [CommandeController],
  providers: [CommandeService],
})
export class CommandeModule {}
