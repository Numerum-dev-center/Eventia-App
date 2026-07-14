import { Test, TestingModule } from '@nestjs/testing';
import { SessionsJetonsController } from './sessions-jetons.controller';
import { SessionsJetonsService } from './sessions-jetons.service';

describe('SessionsJetonsController', () => {
  let controller: SessionsJetonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsJetonsController],
      providers: [SessionsJetonsService],
    }).compile();

    controller = module.get<SessionsJetonsController>(SessionsJetonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
