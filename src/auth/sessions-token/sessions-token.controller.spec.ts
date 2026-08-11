import { Test, TestingModule } from '@nestjs/testing';
import { SessionsTokenController } from './sessions-token.controller';
import { SessionsTokenService } from './sessions-token.service';

describe('SessionsJetonsController', () => {
  let controller: SessionsTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsTokenController],
      providers: [SessionsTokenService],
    }).compile();

    controller = module.get<SessionsTokenController>(SessionsTokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
