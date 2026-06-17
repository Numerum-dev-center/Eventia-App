import { Test, TestingModule } from '@nestjs/testing';
import { LogsAuditController } from './logs-audit.controller';
import { LogsAuditService } from './logs-audit.service';

describe('LogsAuditController', () => {
  let controller: LogsAuditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogsAuditController],
      providers: [LogsAuditService],
    }).compile();

    controller = module.get<LogsAuditController>(LogsAuditController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
