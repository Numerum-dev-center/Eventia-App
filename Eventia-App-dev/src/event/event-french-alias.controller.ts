import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventService } from './event.service';
import { Event } from './entities/event.entity';

@ApiTags('events')
@Controller('evenement')
export class EventFrenchAliasController {
  constructor(private readonly eventService: EventService) {}

  @Get(':id')
  @ApiOperation({ summary: "Get event details by ID (alias français de /events/:id)" })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({ status: 200, description: 'Event details.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  async findOne(@Param('id') id: string): Promise<Event> {
    return this.eventService.findOne(id);
  }
}
