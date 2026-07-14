import { Test, TestingModule } from '@nestjs/testing';
import { FacturationController } from './facturation.controller';
import { FacturationService } from './facturation.service';

describe('FacturationController', () => {
  let controller: FacturationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacturationController],
      providers: [FacturationService],
    }).compile();

    controller = module.get<FacturationController>(FacturationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
