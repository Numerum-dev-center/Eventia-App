import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EvenementModule } from './evenement/evenement.module';
import { TicketsModule } from './tickets/tickets.module';
import { TableauDeBordModule } from './tableau-de-bord/tableau-de-bord.module';
import { ControleDaccesModule } from './controle-dacces/controle-dacces.module';
import { FacturationModule } from './facturation/facturation.module';
import { FonctionalitesExposeesModule } from './fonctionalites-exposees/fonctionalites-exposees.module';
import { AdministrateurModule } from './administrateur/administrateur.module';
import { PaiementModule } from './paiement/paiement.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [EvenementModule, TicketsModule, TableauDeBordModule, ControleDaccesModule, FacturationModule, FonctionalitesExposeesModule, AdministrateurModule, PaiementModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
