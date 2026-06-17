import { Test, TestingModule } from '@nestjs/testing';
import { ProfilOrganisateurController } from './profil-organisateur.controller';
import { ProfilOrganisateurService } from './profil-organisateur.service';

describe('ProfilOrganisateurController', () => {
  let controller: ProfilOrganisateurController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilOrganisateurController],
      providers: [ProfilOrganisateurService],
    }).compile();

    controller = module.get<ProfilOrganisateurController>(ProfilOrganisateurController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
