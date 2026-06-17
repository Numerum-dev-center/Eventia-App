import { PartialType } from '@nestjs/mapped-types';
import { CreateLogsAuditDto } from './create-logs-audit.dto';

export class UpdateLogsAuditDto extends PartialType(CreateLogsAuditDto) {}
