import { Module } from '@nestjs/common';
import { ProfilOrganisateurService } from './profil-organisateur.service';
import { ProfilOrganisateurController } from './profil-organisateur.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilisateur } from 'src/utilisateur/entities/utilisateur.entity';
import { Evenement } from 'src/evenement/entities/evenement.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Evenement, Utilisateur])],
  controllers: [ProfilOrganisateurController],
  providers: [ProfilOrganisateurService],
})
export class ProfilOrganisateurModule {}
