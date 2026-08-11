import { Test, TestingModule } from '@nestjs/testing';
import { SessionsTokenService } from './sessions-token.service';

describe('SessionsJetonsService', () => {
  let service: SessionsTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionsTokenService],
    }).compile();

    service = module.get<SessionsTokenService>(SessionsTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
