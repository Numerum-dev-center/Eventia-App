import { Test, TestingModule } from '@nestjs/testing';
import { FacturationService } from './invoice.service';

describe('FacturationService', () => {
  let service: FacturationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacturationService],
    }).compile();

    service = module.get<FacturationService>(FacturationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
