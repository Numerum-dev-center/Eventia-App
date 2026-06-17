import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SessionsJetonsService } from './sessions-jetons.service';
import { CreateSessionsJetonDto } from './dto/create-sessions-jeton.dto';
import { UpdateSessionsJetonDto } from './dto/update-sessions-jeton.dto';

@Controller('sessions-jetons')
export class SessionsJetonsController {
  constructor(private readonly sessionsJetonsService: SessionsJetonsService) {}

  @Post()
  create(@Body() createSessionsJetonDto: CreateSessionsJetonDto) {
    return this.sessionsJetonsService.create(createSessionsJetonDto);
  }

  @Get()
  findAll() {
    return this.sessionsJetonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsJetonsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSessionsJetonDto: UpdateSessionsJetonDto) {
    return this.sessionsJetonsService.update(+id, updateSessionsJetonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessionsJetonsService.remove(+id);
  }
}
