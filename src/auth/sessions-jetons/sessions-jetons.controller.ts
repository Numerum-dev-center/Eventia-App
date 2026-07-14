import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SessionsJetonsService } from './sessions-jetons.service';
import { CreateSessionsJetonDto } from './dto/create-sessions-jeton.dto';
import { UpdateSessionsJetonDto } from './dto/update-sessions-jeton.dto';

@Controller('sessions-jetons')
export class SessionsJetonsController {
  constructor(private readonly sessionsJetonsService: SessionsJetonsService) {}

  @Post()
  async create(@Body() createSessionsJetonDto: CreateSessionsJetonDto) {
    return await this.sessionsJetonsService.create(createSessionsJetonDto);
  }

  @Get()
  async findAll() {
    return await this.sessionsJetonsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.sessionsJetonsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSessionsJetonDto: UpdateSessionsJetonDto,
  ) {
    return await this.sessionsJetonsService.update(id, updateSessionsJetonDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Retourne un 204 No Content après suppression
  async remove(@Param('id') id: string) {
    return await this.sessionsJetonsService.remove(id);
  }
}
