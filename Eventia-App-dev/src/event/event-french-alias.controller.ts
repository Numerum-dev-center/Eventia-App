import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventService } from './event.service';
import { Event } from './entities/event.entity';

@ApiTags('events')
@Controller('evenement')
export class EventFrenchAliasController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @ApiOperation({ summary: "List published events (alias français de /events/published)" })
  findPublished(@Query() query: {
    search?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }) {
    return this.eventService.findPublished(query);
  }

  @Get(':id')
  @ApiOperation({ summary: "Get event details by ID (alias français de /events/:id)" })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({ status: 200, description: 'Event details.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  async findOne(@Param('id') id: string): Promise<Event> {
    return this.eventService.findOne(id);
  }
}
