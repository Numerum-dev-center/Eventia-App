import { Test, TestingModule } from '@nestjs/testing';
import { TableauDeBordService } from './tableau-de-bord.service';

describe('TableauDeBordService', () => {
  let service: TableauDeBordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TableauDeBordService],
    }).compile();

    service = module.get<TableauDeBordService>(TableauDeBordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
