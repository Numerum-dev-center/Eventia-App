import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Role } from 'src/common/role.enum';
import { EventService } from 'src/event/event.service';
import { TicketCategoryService } from 'src/ticket-category/ticket-category.service';
import { AcessControlService } from 'src/acess-control/acess-control.service';
import { DashboardService } from 'src/dashboard/dashboard.service';
import { UserService } from 'src/user/user.service';
import { CreateEventDto } from 'src/event/dto/create-event.dto';
import { UpdateEventDto } from 'src/event/dto/update-event.dto';
import { CreateTicketCategoryDto } from 'src/ticket-category/dto/create-ticket-category.dto';
import { CreateAcessControlDto } from 'src/acess-control/dto/create-acess-control.dto';
import { EventStatut } from 'src/common/event-statut.enum';

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png'];

@ApiTags('Organizer')
@ApiBearerAuth()
@Controller('organizer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ORGANIZER, Role.ADMIN)
export class OrganizerController {
  constructor(
    private readonly eventService: EventService,
    private readonly ticketCategoryService: TicketCategoryService,
    private readonly acessControlService: AcessControlService,
    private readonly dashboardService: DashboardService,
    private readonly userService: UserService,
  ) {}

  @Get('events')
  @ApiOperation({ summary: 'List all events for the authenticated organizer' })
  async getMyEvents(@GetUser() user: AuthenticatedUser) {
    return this.eventService.findMyEvents(user.id);
  }

  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('coverImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
          return cb(new BadRequestException('Only JPG and PNG images are allowed.'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Create a new event (multipart/form-data)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: {
    type: 'object',
    required: ['title', 'date', 'startTime', 'endTime', 'location', 'category', 'capacity', 'ticketPrice', 'description'],
    properties: {
      coverImage: { type: 'string', format: 'binary' },
      title: { type: 'string' },
      description: { type: 'string' },
      date: { type: 'string' },
      startTime: { type: 'string' },
      endTime: { type: 'string' },
      location: { type: 'string' },
      category: { type: 'string', enum: ['Concert','Conference','Spectacle','Marche','Sport','Autre'] },
      capacity: { type: 'number' },
      ticketPrice: { type: 'number' },
    },
  }})
  async createEvent(
    @GetUser() user: AuthenticatedUser,
    @Body() dto: CreateEventDto,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    return this.eventService.create(dto, user.id, coverImage);
  }

  @Get('events/:eventId/billets')
  @ApiOperation({ summary: 'Get ticket categories for a specific event' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  async getEventTicketCategories(@Param('eventId') eventId: string) {
    return this.ticketCategoryService.findByEvent(eventId);
  }

  @Get('events/:eventId/finance')
  @ApiOperation({ summary: 'Get financial stats for a specific event' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  async getEventFinance(@Param('eventId') eventId: string) {
    return this.dashboardService.getEventStats(eventId);
  }

  @Get('events/:eventId/acces')
  @ApiOperation({ summary: 'Get access control logs for a specific event' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  async getEventAccess(@Param('eventId') eventId: string) {
    return this.acessControlService.findByEvent(eventId);
  }

  @Get('finance')
  @ApiOperation({ summary: 'Get overall revenue for the authenticated organizer' })
  async getMyFinance(@GetUser() user: AuthenticatedUser) {
    const organizerId = await this.userService.findOrganizerProfileId(user.id);
    const stats = await this.dashboardService.getOrganizerStats(organizerId);
    return { totalRevenue: stats.totalRevenue, totalPaidOrders: stats.totalPaidOrders };
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard stats for the authenticated organizer' })
  async getMyDashboard(@GetUser() user: AuthenticatedUser) {
    const organizerId = await this.userService.findOrganizerProfileId(user.id);
    return this.dashboardService.getOrganizerStats(organizerId);
  }

  @Post('events/:id/categories')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a ticket category to an event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  async createTicketCategory(
    @Param('id') eventId: string,
    @Body() dto: CreateTicketCategoryDto,
  ) {
    dto.eventId = eventId;
    return this.ticketCategoryService.create(dto);
  }

  @Post('events/:id/publish')
  @ApiOperation({ summary: 'Publish an event (set status to PUBLISHED)' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  async publishEvent(@Param('id') id: string) {
    return this.eventService.updateStatut(id, EventStatut.PUBLISHED);
  }

  @Post('scan')
  @ApiOperation({ summary: 'Validate/scan a ticket at entry' })
  async scanTicket(@Body() dto: CreateAcessControlDto) {
    return this.acessControlService.validateTicket(dto);
  }

  @Patch('events/:id')
  @UseInterceptors(
    FileInterceptor('coverImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
          return cb(new BadRequestException('Only JPG and PNG images are allowed.'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Update an event (owner or admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Event ID' })
  async updateEvent(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
    @Body() dto: UpdateEventDto,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    return this.eventService.update(id, dto, user.id, user.role, coverImage);
  }

  @Delete('events/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an event (owner or admin only)' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  async deleteEvent(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.eventService.remove(id, user.id, user.role);
  }
}
