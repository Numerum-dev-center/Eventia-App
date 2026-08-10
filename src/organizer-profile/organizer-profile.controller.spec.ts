import { Test, TestingModule } from '@nestjs/testing';
import { OrganizerProfileController } from './organizer-profile.controller';
import { OrganizerProfileService } from './organizer-profile.service';

describe('ProfilOrganisateurController', () => {
  let controller: OrganizerProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizerProfileController],
      providers: [OrganizerProfileService],
    }).compile();

    controller = module.get<OrganizerProfileController>(OrganizerProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
