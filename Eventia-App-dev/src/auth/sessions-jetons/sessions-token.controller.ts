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
import { SessionsTokenService } from './sessions-token.service';
import { CreateSessionsTokenDto } from './dto/create-sessions-token.dto';
import { UpdateSessionsTokenDto } from './dto/update-sessions-token.dto';

@Controller('sessions-token')
export class SessionsTokenController {
  constructor(private readonly sessionsTokenService: SessionsTokenService) {}

  @Post()
  async create(@Body() createSessionsTokenDto: CreateSessionsTokenDto) {
    return await this.sessionsTokenService.create(createSessionsTokenDto);
  }

  @Get()
  async findAll() {
    return await this.sessionsTokenService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.sessionsTokenService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSessionsTokenDto: UpdateSessionsTokenDto,
  ) {
    return await this.sessionsTokenService.update(id, updateSessionsTokenDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Retourne un 204 No Content après suppression
  async remove(@Param('id') id: string) {
    return await this.sessionsTokenService.remove(id);
  }
}
