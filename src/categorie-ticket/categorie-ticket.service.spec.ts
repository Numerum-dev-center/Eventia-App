import { Test, TestingModule } from '@nestjs/testing';
import { CategorieTicketService } from './categorie-ticket.service';

describe('CategorieTicketService', () => {
  let service: CategorieTicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategorieTicketService],
    }).compile();

    service = module.get<CategorieTicketService>(CategorieTicketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
