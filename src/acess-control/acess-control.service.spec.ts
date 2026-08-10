import { Test, TestingModule } from '@nestjs/testing';
import { AcessControlService } from './acess-control.service';

describe('ControleDaccesService', () => {
  let service: AcessControlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcessControlService],
    }).compile();

    service = module.get<AcessControlService>(AcessControlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
