import { Test, TestingModule } from '@nestjs/testing';
import { FonctionalitesExposeesService } from './exposed-features.service';

describe('FonctionalitesExposeesService', () => {
  let service: FonctionalitesExposeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FonctionalitesExposeesService],
    }).compile();

    service = module.get<FonctionalitesExposeesService>(FonctionalitesExposeesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
