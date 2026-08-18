import { Test, TestingModule } from '@nestjs/testing';
import { AcessControlController } from './acess-control.controller';
import { AcessControlService } from './acess-control.service';

describe('ControleDaccesController', () => {
  let controller: AcessControlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcessControlController],
      providers: [AcessControlService],
    }).compile();

    controller = module.get<AcessControlController>(AcessControlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
