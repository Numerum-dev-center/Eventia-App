import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { SignedEnvelope } from '@numerum-tech/yeriasdk';
import { YeriaService } from './yeria.service';
import { YeriaAuthGuard } from './yeria-auth.guard';
import { GetYeriaUser } from './decorators/get-yeria-user.decorator';
import { ScanTicketDto } from './dto/scan-ticket.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import type { YeriaTokenClaims } from '@numerum-tech/yeriasdk';

@ApiTags('yeria')
@Controller('api/v1/yeria')
export class YeriaController {
  constructor(private readonly yeriaService: YeriaService) {}

  // ---------------------------------------------------------------------------
  // VUES SERVER-DRIVEN (l'application Yeria les consomme directement)
  // ---------------------------------------------------------------------------

  @Get('views/scan')
  @ApiOperation({
    summary: 'Scan view for access control (Signed QRScanView)',
    description:
      "Returns a signed envelope {payload, signature}. The agent scans the QR -> POST /scan-ticket with { qrData }.",
  })
  @ApiResponse({
    status: 200,
    description: 'Signed Yeria envelope (QRScanView)',
  })
  serveScanView(): SignedEnvelope {
    return this.yeriaService.serveScanView();
  }

  @Get('views/tickets/:code')
  @ApiOperation({
    summary: 'Participant wallet: Ticket QR code (Signed QRDisplayView)',
  })
  @ApiParam({ name: 'code', description: 'Unique ticket code (uniqueCodeCrypto)' })
  @ApiResponse({ status: 200, description: 'Signed Yeria envelope (QRDisplayView)' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  serveTicketWalletQR(@Param('code') code: string): Promise<SignedEnvelope> {
    return this.yeriaService.serveTicketWalletQR(code);
  }

  @Get('views/tickets/:code/details')
  @ApiOperation({
    summary: 'Ticket details (Signed ReaderView)',
  })
  @ApiParam({ name: 'code', description: 'Unique ticket code (uniqueCodeCrypto)' })
  @ApiResponse({ status: 200, description: 'Signed Yeria envelope (ReaderView)' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  serveTicketDetails(@Param('code') code: string): Promise<SignedEnvelope> {
    return this.yeriaService.serveTicketDetails(code);
  }

  @Get('views/events')
  @ApiOperation({
    summary: 'List of published events (Signed ActionListView)',
    description:
      "Consumed by the Yeria application. Each action links to the event details page.",
  })
  @ApiResponse({
    status: 200,
    description: 'Signed Yeria envelope (ActionListView)',
  })
  serveEventList(): Promise<SignedEnvelope> {
    return this.yeriaService.serveEventList();
  }

  @Get('views/events/filter')
  @ApiOperation({
    summary: 'Event filter form by category (Signed FormView)',
    description: 'The submit POST sends to /events/filter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Signed Yeria envelope (FormView)',
  })
  serveEventFilter(): Promise<SignedEnvelope> {
    return this.yeriaService.serveEventFilter();
  }

  @Get('views/events/:id')
  @ApiOperation({
    summary: 'Detailed event page (Signed CardView)',
  })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: 200,
    description: 'Signed Yeria envelope (CardView)',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  serveEventDetails(@Param('id') id: string): Promise<SignedEnvelope> {
    return this.yeriaService.serveEventDetails(id);
  }

  @Get('views/events/:id/map')
  @ApiOperation({
    summary: 'Event location on map (Signed MapView)',
  })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Signed Yeria envelope (MapView)' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 400, description: 'No geographic coordinates' })
  serveEventMap(@Param('id') id: string): Promise<SignedEnvelope> {
    return this.yeriaService.serveEventMap(id);
  }

  @Get('views/events/:id/book')
  @ApiOperation({
    summary: 'Booking form (Signed FormView)',
    description: 'The submit POST sends to /event-booking.',
  })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: 200,
    description: 'Signed Yeria envelope (FormView)',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  serveBookingForm(@Param('id') id: string): Promise<SignedEnvelope> {
    return this.yeriaService.serveBookingForm(id);
  }

  @Get('views/orders/:userId')
  @ApiOperation({
    summary: 'Participant order history (Signed ReaderView)',
  })
  @ApiParam({ name: 'userId', description: 'Eventia user ID' })
  @ApiResponse({ status: 200, description: 'Signed Yeria envelope (ReaderView)' })
  serveOrderHistory(@Param('userId') userId: string): Promise<SignedEnvelope> {
    return this.yeriaService.serveOrderHistory(userId);
  }

  // ---------------------------------------------------------------------------
  // SOUMISSIONS (POST conventions : {baseUrl}/{viewId})
  // ---------------------------------------------------------------------------

  @Post('scan-ticket')
  @UseGuards(YeriaAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Validates a scanned ticket (returns a signed MessageView)',
  })
  @ApiBody({ type: ScanTicketDto })
  @ApiResponse({
    status: 200,
    description: 'Signed Yeria envelope (MessageView: access granted/denied)',
  })
  validateScannedTicket(
    @Body() dto: ScanTicketDto,
    @GetYeriaUser() yeriaUser?: YeriaTokenClaims,
  ): Promise<SignedEnvelope> {
    return this.yeriaService.handleTicketScan(dto, yeriaUser);
  }

  @Post('scan-result')
  @ApiOperation({
    summary: 'Return to scan view ("Scan another ticket")',
    description:
      "Consumed by the action button of the result MessageView.",
  })
  @ApiResponse({ status: 200, description: 'Signed Yeria envelope (QRScanView)' })
  scanAgain(): SignedEnvelope {
    return this.yeriaService.serveScanViewAgain();
  }

  @Post('events/filter')
  @UseGuards(YeriaAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Applies category filter (returns a signed ActionListView)',
    description:
      'Consumed by the filter form submit (FormView event-filter).',
  })
  @ApiBody({ type: EventFilterDto })
  @ApiResponse({
    status: 200,
    description: 'Signed Yeria envelope (filtered ActionListView)',
  })
  filterEvents(@Body() dto: EventFilterDto): Promise<SignedEnvelope> {
    return this.yeriaService.handleEventFilter(dto);
  }

  @Post('event-booking')
  @UseGuards(YeriaAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Creates booking/order (Signed confirmation MessageView)',
    description:
      'Consumed by the booking form submit (FormView event-booking).',
  })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({
    status: 200,
    description: 'Signed Yeria envelope (confirmation MessageView)',
  })
  bookTickets(
    @Body() dto: CreateBookingDto,
    @GetYeriaUser() yeriaUser?: YeriaTokenClaims,
  ): Promise<SignedEnvelope> {
    return this.yeriaService.handleBooking(dto, yeriaUser);
  }

  // ---------------------------------------------------------------------------
  // NOTIFICATIONS
  // ---------------------------------------------------------------------------

  @Post('notifications')
  @ApiOperation({
    summary: 'Sends a signed notification to a Yeria user',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'title', 'body'],
      properties: {
        userId: { type: 'string', description: 'Yeria recipient ID' },
        title: { type: 'string' },
        body: { type: 'string' },
        link: { type: 'string', description: 'Optional link (e.g., /tickets/ABC)' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Notification sent' })
  @ApiResponse({ status: 503, description: 'Yeria platform unreachable' })
  async sendNotification(
    @Body()
    body: {
      userId: string;
      title: string;
      body: string;
      link?: string;
    },
  ): Promise<{ message: string }> {
    await this.yeriaService.sendNotification(
      body.userId,
      body.title,
      body.body,
      body.link,
    );
    return { message: 'Notification sent successfully' };
  }
}
