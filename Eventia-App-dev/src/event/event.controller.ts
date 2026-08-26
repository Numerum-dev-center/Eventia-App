import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatut } from 'src/common/event-statut.enum';
import { Role } from 'src/common/role.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const coverImageInterceptor = UseInterceptors(
  FileInterceptor('coverImage', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
        return cb(
          new BadRequestException('Only JPG, PNG, WebP, GIF and SVG images are allowed.'),
          false,
        );
      }
      cb(null, true);
    },
  }),
);

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @ApiBearerAuth()
  @coverImageInterceptor
  @ApiOperation({ summary: 'Create a new event (multipart/form-data with optional coverImage)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: {
    type: 'object',
    required: ['title', 'date', 'startTime', 'endTime', 'location', 'category', 'capacity', 'ticketPrice', 'description'],
    properties: {
      coverImage: { type: 'string', format: 'binary', description: 'Cover image (JPG/PNG/WebP/GIF/SVG, max 5MB)' },
      title: { type: 'string', example: 'Festival Afrobeat Lome 2026' },
      description: { type: 'string', example: 'The biggest afrobeat music festival' },
      date: { type: 'string', example: '2026-12-20' },
      startTime: { type: 'string', example: '20:00' },
      endTime: { type: 'string', example: '04:00' },
      location: { type: 'string', example: 'Stade de Keque, Lome' },
      category: { type: 'string', enum: ['Concert','Conference','Spectacle','Marche','Sport','Autre'] },
      capacity: { type: 'number', example: 5000 },
      ticketPrice: { type: 'number', example: 5000 },
    },
  }})
  @ApiResponse({ status: 201, description: 'Event created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(
    @GetUser() user: AuthenticatedUser,
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    return this.eventService.create(createEventDto, user.id, coverImage);
  }

  @Get('my-events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all events for the authenticated organizer' })
  @ApiResponse({ status: 200, description: 'List of organizer events.' })
  async findMyEvents(@GetUser() user: AuthenticatedUser) {
    return this.eventService.findMyEvents(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events (admin) with search/filter' })
  findAll(@Query() query: { search?: string; status?: string; category?: string; page?: string; limit?: string }) {
    return this.eventService.findAll(query);
  }

  @Get('published')
  @ApiOperation({ summary: 'Get published events with search, filter, sort, pagination' })
  @ApiResponse({ status: 200, description: 'List of published events.' })
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
  @ApiOperation({ summary: 'Get event details by ID' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({ status: 200, description: 'Event details.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  async findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER, Role.ADMIN)
  @ApiBearerAuth()
  @coverImageInterceptor
  @ApiOperation({ summary: 'Update an event (owner or admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({ status: 200, description: 'Event updated.' })
  @ApiResponse({ status: 403, description: 'Not authorized to update this event.' })
  async update(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    return this.eventService.update(id, updateEventDto, user.id, user.role, coverImage);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event status' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  async updateStatut(
    @Param('id') id: string,
    @Body('status') statut: EventStatut,
  ) {
    return this.eventService.updateStatut(id, statut);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an event (owner or admin only)' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({ status: 204, description: 'Event deleted.' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this event.' })
  async remove(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.eventService.remove(id, user.id, user.role);
  }
}
