import { Test, TestingModule } from '@nestjs/testing';
import { ControleDaccesController } from './controle-dacces.controller';
import { ControleDaccesService } from './controle-dacces.service';

describe('ControleDaccesController', () => {
  let controller: ControleDaccesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ControleDaccesController],
      providers: [ControleDaccesService],
    }).compile();

    controller = module.get<ControleDaccesController>(ControleDaccesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
