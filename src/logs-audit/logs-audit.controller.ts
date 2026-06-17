import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LogsAuditService } from './logs-audit.service';
import { CreateLogsAuditDto } from './dto/create-logs-audit.dto';
import { UpdateLogsAuditDto } from './dto/update-logs-audit.dto';

@Controller('logs-audit')
export class LogsAuditController {
  constructor(private readonly logsAuditService: LogsAuditService) {}

  @Post()
  create(@Body() createLogsAuditDto: CreateLogsAuditDto) {
    return this.logsAuditService.create(createLogsAuditDto);
  }

  @Get()
  findAll() {
    return this.logsAuditService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logsAuditService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLogsAuditDto: UpdateLogsAuditDto) {
    return this.logsAuditService.update(+id, updateLogsAuditDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logsAuditService.remove(+id);
  }
}
