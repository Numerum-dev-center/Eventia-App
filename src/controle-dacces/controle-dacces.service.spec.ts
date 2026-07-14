import { Test, TestingModule } from '@nestjs/testing';
import { ControleDaccesService } from './controle-dacces.service';

describe('ControleDaccesService', () => {
  let service: ControleDaccesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ControleDaccesService],
    }).compile();

    service = module.get<ControleDaccesService>(ControleDaccesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
