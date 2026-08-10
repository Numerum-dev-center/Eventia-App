import { Test, TestingModule } from '@nestjs/testing';
import { ExposedFeaturesController } from './exposed-features.controller';
import { ExposedFeaturesService } from './exposed-features.service';

describe('ExposedFeaturesController', () => {
  let controller: ExposedFeaturesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExposedFeaturesController],
      providers: [ExposedFeaturesService],
    }).compile();

    controller = module.get<ExposedFeaturesController>(ExposedFeaturesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
