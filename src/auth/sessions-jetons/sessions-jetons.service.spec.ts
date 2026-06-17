import { Test, TestingModule } from '@nestjs/testing';
import { SessionsJetonsService } from './sessions-jetons.service';

describe('SessionsJetonsService', () => {
  let service: SessionsJetonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionsJetonsService],
    }).compile();

    service = module.get<SessionsJetonsService>(SessionsJetonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
