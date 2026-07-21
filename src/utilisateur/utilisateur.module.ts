import { forwardRef, Module } from '@nestjs/common';
import { UtilisateurService } from './utilisateur.service';
import { UtilisateurController } from './utilisateur.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilisateur } from './entities/utilisateur.entity';
import { MailModule } from 'src/mail/mail.module';
import { ProfilOrganisateur } from 'src/profil-organisateur/entities/profil-organisateur.entity';
import { Commande } from 'src/commande/entities/commande.entity';
import { TicketEmis } from 'src/tickets/entities/ticket-emis.entity';
import { SessionsJetons } from 'src/auth/sessions-jetons/entities/sessions-jeton.entity';
import { LogsAudit } from 'src/logs-audit/entities/logs-audit.entity';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([
      Utilisateur,
      ProfilOrganisateur,
      Commande,
      TicketEmis,
      SessionsJetons,
      LogsAudit,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
    MailModule,
  ],
  controllers: [UtilisateurController],
  providers: [UtilisateurService],
  exports: [UtilisateurService],
})
export class UtilisateurModule {}
