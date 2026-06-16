import { Test, TestingModule } from '@nestjs/testing';
import { TableauDeBordController } from './tableau-de-bord.controller';
import { TableauDeBordService } from './tableau-de-bord.service';

describe('TableauDeBordController', () => {
  let controller: TableauDeBordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TableauDeBordController],
      providers: [TableauDeBordService],
    }).compile();

    controller = module.get<TableauDeBordController>(TableauDeBordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
