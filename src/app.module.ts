import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { UtilisateurModule } from './utilisateur/utilisateur.module';
import { CategorieTicketModule } from './categorie-ticket/categorie-ticket.module';
import { LogsAuditModule } from './logs-audit/logs-audit.module';
import { CommandeModule } from './commande/commande.module';
import { ProfilOrganisateurModule } from './profil-organisateur/profil-organisateur.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { AuditSubscriber } from './subscribers/audit.subscriber';
import { UserContextMiddleware } from './common/middlewares/user-context.middleware';




@Module({
  imports: [
    EvenementModule,
    TicketsModule,
    TableauDeBordModule,
    ControleDaccesModule,
    FacturationModule,
    FonctionalitesExposeesModule,
    AdministrateurModule,
    PaiementModule,
    AuthModule,
    UtilisateurModule,
    CategorieTicketModule,
    LogsAuditModule,
    CommandeModule,
    ProfilOrganisateurModule,
    TypeOrmModule.forRootAsync({
      
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
        subscribers: [AuditSubscriber],
      }),
      
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      
    }),
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserContextMiddleware).forRoutes('*');
  }
}
