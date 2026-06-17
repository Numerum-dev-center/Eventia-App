import { Test, TestingModule } from '@nestjs/testing';
import { CategorieTicketController } from './categorie-ticket.controller';
import { CategorieTicketService } from './categorie-ticket.service';

describe('CategorieTicketController', () => {
  let controller: CategorieTicketController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategorieTicketController],
      providers: [CategorieTicketService],
    }).compile();

    controller = module.get<CategorieTicketController>(CategorieTicketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
