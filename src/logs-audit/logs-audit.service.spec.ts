import { Test, TestingModule } from '@nestjs/testing';
import { LogsAuditService } from './logs-audit.service';

describe('LogsAuditService', () => {
  let service: LogsAuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogsAuditService],
    }).compile();

    service = module.get<LogsAuditService>(LogsAuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
