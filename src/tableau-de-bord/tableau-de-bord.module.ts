import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableauDeBordService } from './tableau-de-bord.service';
import { TableauDeBordController } from './tableau-de-bord.controller';
import { Utilisateur } from 'src/utilisateur/entities/utilisateur.entity';
import { Evenement } from 'src/evenement/entities/evenement.entity';
import { TicketEmis } from 'src/tickets/entities/ticket-emis.entity';
import { UtilisateurModule } from 'src/utilisateur/utilisateur.module';
import { CommandeModule } from 'src/commande/commande.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Utilisateur, Evenement, TicketEmis]),
    forwardRef(() => UtilisateurModule),
    forwardRef(() => CommandeModule),
  ],
  controllers: [TableauDeBordController],
  providers: [TableauDeBordService],
})
export class TableauDeBordModule {}
