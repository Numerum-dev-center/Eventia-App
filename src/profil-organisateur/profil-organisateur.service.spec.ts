import { Test, TestingModule } from '@nestjs/testing';
import { ProfilOrganisateurService } from './profil-organisateur.service';

describe('ProfilOrganisateurService', () => {
  let service: ProfilOrganisateurService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfilOrganisateurService],
    }).compile();

    service = module.get<ProfilOrganisateurService>(ProfilOrganisateurService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
