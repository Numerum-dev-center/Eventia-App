import { Module } from '@nestjs/common';
import { ProfilOrganisateurService } from './profil-organisateur.service';
import { ProfilOrganisateurController } from './profil-organisateur.controller';

@Module({
  controllers: [ProfilOrganisateurController],
  providers: [ProfilOrganisateurService],
})
export class ProfilOrganisateurModule {}
