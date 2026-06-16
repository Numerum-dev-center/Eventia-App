import { Test, TestingModule } from '@nestjs/testing';
import { FonctionalitesExposeesController } from './fonctionalites-exposees.controller';
import { FonctionalitesExposeesService } from './fonctionalites-exposees.service';

describe('FonctionalitesExposeesController', () => {
  let controller: FonctionalitesExposeesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FonctionalitesExposeesController],
      providers: [FonctionalitesExposeesService],
    }).compile();

    controller = module.get<FonctionalitesExposeesController>(FonctionalitesExposeesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
