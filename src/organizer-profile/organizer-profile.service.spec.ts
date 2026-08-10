import { Test, TestingModule } from '@nestjs/testing';
import { OrganizerProfileService } from './organizer-profile.service';

describe('ProfilOrganisateurService', () => {
  let service: OrganizerProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizerProfileService],
    }).compile();

    service = module.get<OrganizerProfileService>(OrganizerProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
