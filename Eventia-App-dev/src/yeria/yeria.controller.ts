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
    summary: 'Vue de scan pour le contrôle d\u2019accès (QRScanView signée)',
    description:
      "Retourne une enveloppe signée {payload, signature}. L'agent scanne le QR -> POST /scan-ticket avec { qrData }.",
  })
  @ApiResponse({
    status: 200,
    description: 'Enveloppe Yeria signée (QRScanView)',
  })
  serveScanView(): SignedEnvelope {
    return this.yeriaService.serveScanView();
  }

  @Get('views/tickets/:code')
  @ApiOperation({
    summary: 'Wallet participant : QR code du billet (QRDisplayView signée)',
  })
  @ApiParam({ name: 'code', description: 'Code unique du billet (uniqueCodeCrypto)' })
  @ApiResponse({ status: 200, description: 'Enveloppe Yeria signée (QRDisplayView)' })
  @ApiResponse({ status: 404, description: 'Billet introuvable' })
  serveTicketWalletQR(@Param('code') code: string): Promise<SignedEnvelope> {
    return this.yeriaService.serveTicketWalletQR(code);
  }

  @Get('views/tickets/:code/details')
  @ApiOperation({
    summary: 'Détails du billet (ReaderView signée)',
  })
  @ApiParam({ name: 'code', description: 'Code unique du billet (uniqueCodeCrypto)' })
  @ApiResponse({ status: 200, description: 'Enveloppe Yeria signée (ReaderView)' })
  @ApiResponse({ status: 404, description: 'Billet introuvable' })
  serveTicketDetails(@Param('code') code: string): Promise<SignedEnvelope> {
    return this.yeriaService.serveTicketDetails(code);
  }

  @Get('views/events')
  @ApiOperation({
    summary: 'Liste des événements publiés (ActionListView signée)',
    description:
      "Consommée par l'application Yeria. Chaque action renvoie vers la fiche de l'événement.",
  })
  @ApiResponse({
    status: 200,
    description: 'Enveloppe Yeria signée (ActionListView)',
  })
  serveEventList(): Promise<SignedEnvelope> {
    return this.yeriaService.serveEventList();
  }

  @Get('views/events/filter')
  @ApiOperation({
    summary: 'Formulaire de filtre des événements par catégorie (FormView signée)',
    description: 'Le submit POST renvoie vers /events/filter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Enveloppe Yeria signée (FormView)',
  })
  serveEventFilter(): Promise<SignedEnvelope> {
    return this.yeriaService.serveEventFilter();
  }

  @Get('views/events/:id')
  @ApiOperation({
    summary: 'Fiche détaillée d\u2019un événement (CardView signée)',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de l\u2019événement' })
  @ApiResponse({
    status: 200,
    description: 'Enveloppe Yeria signée (CardView)',
  })
  @ApiResponse({ status: 404, description: 'Événement introuvable' })
  serveEventDetails(@Param('id') id: string): Promise<SignedEnvelope> {
    return this.yeriaService.serveEventDetails(id);
  }

  @Get('views/events/:id/map')
  @ApiOperation({
    summary: 'Position de l\u2019événement sur une carte (MapView signée)',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de l\u2019événement' })
  @ApiResponse({ status: 200, description: 'Enveloppe Yeria signée (MapView)' })
  @ApiResponse({ status: 404, description: 'Événement introuvable' })
  @ApiResponse({ status: 400, description: 'Pas de coordonnées géographiques' })
  serveEventMap(@Param('id') id: string): Promise<SignedEnvelope> {
    return this.yeriaService.serveEventMap(id);
  }

  @Get('views/events/:id/book')
  @ApiOperation({
    summary: 'Formulaire de réservation (FormView signée)',
    description: 'Le submit POST renvoie vers /event-booking.',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de l\u2019événement' })
  @ApiResponse({
    status: 200,
    description: 'Enveloppe Yeria signée (FormView)',
  })
  @ApiResponse({ status: 404, description: 'Événement introuvable' })
  serveBookingForm(@Param('id') id: string): Promise<SignedEnvelope> {
    return this.yeriaService.serveBookingForm(id);
  }

  @Get('views/orders/:userId')
  @ApiOperation({
    summary: 'Historique des commandes d\u2019un participant (ReaderView signée)',
  })
  @ApiParam({ name: 'userId', description: 'Identifiant Eventia de l\u2019utilisateur' })
  @ApiResponse({ status: 200, description: 'Enveloppe Yeria signée (ReaderView)' })
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
    summary: 'Valide un billet scanné (retourne une MessageView signée)',
  })
  @ApiBody({ type: ScanTicketDto })
  @ApiResponse({
    status: 200,
    description: 'Enveloppe Yeria signée (MessageView : accès autorisé/refusé)',
  })
  validateScannedTicket(
    @Body() dto: ScanTicketDto,
    @GetYeriaUser() yeriaUser?: YeriaTokenClaims,
  ): Promise<SignedEnvelope> {
    return this.yeriaService.handleTicketScan(dto, yeriaUser);
  }

  @Post('scan-result')
  @ApiOperation({
    summary: 'Retour à la vue de scan (« Scanner un autre billet »)',
    description:
      "Consommé par le bouton d'action de la MessageView de résultat.",
  })
  @ApiResponse({ status: 200, description: 'Enveloppe Yeria signée (QRScanView)' })
  scanAgain(): SignedEnvelope {
    return this.yeriaService.serveScanViewAgain();
  }

  @Post('events/filter')
  @UseGuards(YeriaAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Applique le filtre de catégorie (retourne une ActionListView signée)',
    description:
      'Consommé par le submit du formulaire de filtre (FormView event-filter).',
  })
  @ApiBody({ type: EventFilterDto })
  @ApiResponse({
    status: 200,
    description: 'Enveloppe Yeria signée (ActionListView filtrée)',
  })
  filterEvents(@Body() dto: EventFilterDto): Promise<SignedEnvelope> {
    return this.yeriaService.handleEventFilter(dto);
  }

  @Post('event-booking')
  @UseGuards(YeriaAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crée la réservation/commande (MessageView de confirmation signée)',
    description:
      'Consommé par le submit du formulaire de réservation (FormView event-booking).',
  })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({
    status: 200,
    description: 'Enveloppe Yeria signée (MessageView de confirmation)',
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
    summary: 'Envoie une notification signée à un utilisateur Yeria',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'title', 'body'],
      properties: {
        userId: { type: 'string', description: 'Identifiant Yeria du destinataire' },
        title: { type: 'string' },
        body: { type: 'string' },
        link: { type: 'string', description: 'Lien optionnel (ex: /tickets/ABC)' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Notification envoyée' })
  @ApiResponse({ status: 503, description: 'Plateforme Yeria injoignable' })
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
    return { message: 'Notification envoyée avec succès' };
  }
}
