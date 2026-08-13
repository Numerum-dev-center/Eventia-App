import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import {
  YeriaApp,
  QRScanView,
  QRDisplayView,
  ReaderView,
  MessageView,
  CardView,
  MapView,
  ActionListView,
  FormView,
  Notification,
  YeriaLink,
  type SignedEnvelope,
  type ProviderErrorSpec,
} from '@numerum-tech/yeriasdk';
import { YERIA_APP, YERIA_VIEW_ID } from './yeria.constants';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { ValidationTicketLog } from 'src/acess-control/entities/ticket-validation-log.entity';
import { TicketValidationStatut } from 'src/common/ticket-validation-statut.enum';
import { Event } from 'src/event/entities/event.entity';
import { TicketCategory } from 'src/ticket-category/entities/ticket-category.entity';
import { Order } from 'src/order/entities/order.entity';
import { User } from 'src/user/entities/user.entity';
import { EventStatut } from 'src/common/event-statut.enum';
import { PaymentStatut } from 'src/common/payment-statut.enum';
import { Role } from 'src/common/role.enum';
import { ScanTicketDto } from './dto/scan-ticket.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import type { YeriaTokenClaims } from '@numerum-tech/yeriasdk';

@Injectable()
export class YeriaService {
  private readonly logger = new Logger(YeriaService.name);

  constructor(
    @Inject(YERIA_APP) private readonly app: YeriaApp,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(ValidationTicketLog)
    private readonly validationLogRepository: Repository<ValidationTicketLog>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(TicketCategory)
    private readonly ticketCategoryRepository: Repository<TicketCategory>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  private get yeriaAppId(): string {
    return this.config.get<string>('YERIA_APP_ID') ?? 'eventia';
  }

  // ---------------------------------------------------------------------------
  // VUES SERVER-DRIVEN (envoyées à l'application Yeria du participant/contrôleur)
  // ---------------------------------------------------------------------------

  /** Vue de scan pour l'agent de contrôle d'accès (scan → POST /scan-ticket). */
  serveScanView(): SignedEnvelope {
    const view = new QRScanView(
      YERIA_VIEW_ID.SCAN_TICKET,
      'Scanner un billet',
    ).setIntro('Pointez la caméra vers le QR code du billet.');

    return this.app.serve(view);
  }

  /** Retourne à la vue de scan (bouton « Scanner un autre billet »). */
  serveScanViewAgain(): SignedEnvelope {
    return this.serveScanView();
  }

  /** Wallet participant : QR code du billet à présenter à l'entrée. */
  async serveTicketWalletQR(code: string): Promise<SignedEnvelope> {
    const ticket = await this.findTicketByCode(code);

    const qrDataUrl = await QRCode.toDataURL(ticket.uniqueCodeCrypto, {
      margin: 1,
      width: 320,
      color: { dark: '#0A1628', light: '#FFFFFF' },
    });

    const view = new QRDisplayView(
      YERIA_VIEW_ID.TICKET_WALLET,
      'Mon billet',
    )
      .setIntro(`Billet ${ticket.ticketCategory?.name ?? ''} pour ${ticket.ticketCategory?.event?.title ?? ''}`)
      .setQRCode(
        qrDataUrl,
        `Billet ${ticket.ticketCategory?.name ?? ''}`,
        'Présentez ce QR code à l\u2019entrée pour accéder à l\u2019événement.',
      );

    return this.app.serve(view);
  }

  /** Détails d'un billet sous forme de contenu riche. */
  async serveTicketDetails(code: string): Promise<SignedEnvelope> {
    const ticket = await this.findTicketByCode(code);
    const category = ticket.ticketCategory;
    const event = category?.event;

    const lines: string[] = [
      `Catégorie : ${category?.name ?? '—'}`,
      `Prix : ${category?.price != null ? `${category.price} FCFA` : '—'}`,
      `Statut : ${ticket.validationStatut}`,
    ];

    if (event) {
      lines.push(
        `Date : ${new Date(event.startDate).toLocaleString('fr-FR')}`,
        `Lieu : ${event.placeName}, ${event.adress}`,
      );
    }

    const view = new ReaderView(
      YERIA_VIEW_ID.TICKET_DETAILS,
      'Détails du billet',
    )
      .setIntro(event?.title ?? 'Billet Eventia')
      .addSubTitle('Événement')
      .addParagraph(
        event?.description ??
          'Les détails de l\u2019événement seront bientôt disponibles.',
      )
      .addSubTitle('Billet')
      .addListField(lines)
      .addSeparator()
      .addParagraph(`Code unique : ${ticket.uniqueCodeCrypto}`);

    return this.app.serve(view);
  }

  // ---------------------------------------------------------------------------
  // VUES ÉVÉNEMENTS (découverte, filtre, détail, carte)
  // ---------------------------------------------------------------------------

  /** Liste des événements publiés (ActionListView). */
  async serveEventList(): Promise<SignedEnvelope> {
    const events = await this.eventRepository.find({
      where: { statut: EventStatut.PUBLISHED },
      order: { startDate: 'ASC' },
      relations: { ticketsCategories: true },
    });

    if (events.length === 0) {
      return this.buildInfoMessage(
        'Aucun événement',
        'Aucun événement disponible pour le moment. Revenez bientôt !',
      );
    }

    const view = new ActionListView(
      YERIA_VIEW_ID.EVENT_LIST,
      'Événements',
    )
      .setIntro('Trouvez votre prochain événement Eventia.')
      .setTitle('Événements');

    for (const event of events) {
      view.addAction(
        event.id,
        event.title,
        this.eventSummary(event),
        event.bannerImage ?? undefined,
        false,
        { href: YeriaLink.component(this.yeriaAppId, `/views/events/${event.id}`) },
      );
    }

    return this.app.serve(view);
  }

  /** Liste filtrée (appelée par le submit du formulaire de filtre). */
  async handleEventFilter(dto: EventFilterDto): Promise<SignedEnvelope> {
    const where: Record<string, unknown> = { statut: EventStatut.PUBLISHED };
    if (dto.category?.trim()) {
      where.category = dto.category.trim();
    }

    const events = await this.eventRepository.find({
      where,
      order: { startDate: 'ASC' },
      relations: { ticketsCategories: true },
    });

    if (events.length === 0) {
      return this.buildInfoMessage(
        'Aucun résultat',
        'Aucun événement ne correspond à ces critères.',
      );
    }

    const view = new ActionListView(
      YERIA_VIEW_ID.EVENT_LIST,
      'Événements',
    )
      .setIntro(
        dto.category?.trim()
          ? `Résultats pour « ${dto.category.trim()} ».`
          : 'Tous les événements.',
      )
      .setTitle('Événements');

    for (const event of events) {
      view.addAction(
        event.id,
        event.title,
        this.eventSummary(event),
        event.bannerImage ?? undefined,
        false,
        { href: YeriaLink.component(this.yeriaAppId, `/views/events/${event.id}`) },
      );
    }

    return this.app.serve(view);
  }

  /** Formulaire de filtre des événements par catégorie. */
  async serveEventFilter(): Promise<SignedEnvelope> {
    const categories = await this.distinctEventCategories();

    const view = new FormView(
      YERIA_VIEW_ID.EVENT_FILTER,
      'Filtrer les événements',
    )
      .setIntro('Sélectionnez une catégorie pour affiner la liste.')
      .addSelectField(
        'category',
        'Catégorie',
        false,
        categories.map((c) => ({ label: c, value: c })),
      )
      .submitButton('Filtrer', 'POST');

    return this.app.serve(view);
  }

  /** Fiche détaillée d'un événement (CardView). */
  async serveEventDetails(eventId: string): Promise<SignedEnvelope> {
    const event = await this.findEventById(eventId);
    const minPrice = this.minPrice(event.ticketsCategories);

    const view = new CardView(YERIA_VIEW_ID.EVENT_DETAILS, event.title)
      .setSubtitle(
        [event.category, this.formatDate(event.startDate)]
          .filter(Boolean)
          .join(' • '),
      )
      .setDescription(event.description ?? '')
      .addStat(
        'Date',
        `${new Date(event.startDate).toLocaleDateString('fr-FR')} → ${new Date(event.endDate).toLocaleDateString('fr-FR')}`,
      )
      .addStat('Lieu', [event.placeName, event.adress].filter(Boolean).join(', '))
      .addStat('Prix', minPrice != null ? `${minPrice} FCFA` : '—');

    if (event.description) {
      view.addSection('À propos', event.description);
    }
    if (event.bannerImage) {
      view.setImage(event.bannerImage);
    }

    view.addAction(
      'book',
      'POST',
      {
        variant: 'primary',
        icon: 'ticket',
        href: YeriaLink.component(this.yeriaAppId, `/views/events/${event.id}/book`),
      },
    );

    if (event.longitude != null && event.latitude != null) {
      view.addAction(
        'map',
        'GET',
        {
          icon: 'map',
          href: YeriaLink.component(this.yeriaAppId, `/views/events/${event.id}/map`),
        },
      );
    }

    return this.app.serve(view);
  }

  /** Position de l'événement sur une carte (MapView). */
  async serveEventMap(eventId: string): Promise<SignedEnvelope> {
    const event = await this.findEventById(eventId);

    if (event.longitude == null || event.latitude == null) {
      throw new BadRequestException(
        'Cet événement ne dispose pas de coordonnées géographiques.',
      );
    }

    const view = new MapView(YERIA_VIEW_ID.EVENT_MAP, event.title)
      .setBasemap('streets')
      .setViewport({
        center: {
          lat: Number(event.latitude),
          lon: Number(event.longitude),
        },
        zoom: 15,
      })
      .setControls({ zoom: true, userLocation: true, fullscreen: true })
      .addMarker({
        id: event.id,
        location: {
          lat: Number(event.latitude),
          lon: Number(event.longitude),
        },
        title: event.title,
        description: [event.placeName, event.adress].filter(Boolean).join(', '),
        popup: {
          title: event.title,
          body: [event.placeName, event.adress].filter(Boolean).join(' — '),
          actions: [
            {
              url: YeriaLink.component(this.yeriaAppId, `/views/events/${event.id}`),
              method: 'GET',
            },
          ],
        },
      });

    return this.app.serve(view);
  }

  // ---------------------------------------------------------------------------
  // RÉSERVATION / ACHAT DE BILLETS
  // ---------------------------------------------------------------------------

  /** Formulaire de réservation : catégorie + quantité (FormView). */
  async serveBookingForm(eventId: string): Promise<SignedEnvelope> {
    const event = await this.findEventById(eventId);

    if (event.statut !== EventStatut.PUBLISHED) {
      throw new BadRequestException(
        'Cet événement n\u2019est pas ouvert à la réservation.',
      );
    }

    const available = (event.ticketsCategories ?? []).filter(
      (c) => c.availableQuantity > 0,
    );

    if (available.length === 0) {
      return this.buildResultMessage(
        'Complet',
        'Toutes les catégories sont épuisées pour cet événement.',
        'warning',
      );
    }

    const limit = Math.max(
      1,
      Math.min(...available.map((c) => c.limitByPerson ?? 1)),
    );

    const view = new FormView(
      YERIA_VIEW_ID.EVENT_BOOKING,
      'Réserver un billet',
    )
      .setIntro(event.title)
      .addSelectField(
        'ticketCategoryId',
        'Catégorie',
        true,
        available.map((c) => ({
          label: `${c.name} — ${c.price} FCFA (${c.availableQuantity} restants)`,
          value: c.id,
        })),
      )
      .addNumberField('quantity', 'Quantité', true, 1, limit)
      .submitButton('Réserver', 'POST');

    return this.app.serve(view);
  }

  /**
   * Traite la réservation : crée la commande (PENDING) et les billets,
   * décrémente les quantités disponibles, retourne une confirmation signée.
   */
  async handleBooking(
    dto: CreateBookingDto,
    yeriaUser?: YeriaTokenClaims,
  ): Promise<SignedEnvelope> {
    const quantity = dto.quantity;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return this.buildResultMessage(
        'Quantité invalide',
        'Indiquez au moins un billet.',
        'error',
      );
    }

    const category = await this.ticketCategoryRepository.findOne({
      where: { id: dto.ticketCategoryId },
      relations: { event: true },
    });

    if (!category) {
      return this.buildResultMessage(
        'Catégorie introuvable',
        'Cette catégorie de billet n\u2019existe pas.',
        'error',
      );
    }

    if (category.event?.id !== dto.eventId) {
      return this.buildResultMessage(
        'Incohérence',
        'La catégorie sélectionnée n\u2019appartient pas à cet événement.',
        'error',
      );
    }

    if (category.event?.statut !== EventStatut.PUBLISHED) {
      return this.buildResultMessage(
        'Indisponible',
        'Cet événement n\u2019est plus ouvert à la réservation.',
        'error',
      );
    }

    if (category.availableQuantity < quantity) {
      return this.buildResultMessage(
        'Stock insuffisant',
        `Il ne reste que ${category.availableQuantity} billet(s) dans cette catégorie.`,
        'error',
      );
    }

    if (category.limitByPerson != null && quantity > category.limitByPerson) {
      return this.buildResultMessage(
        'Limite dépassée',
        `Vous ne pouvez pas acheter plus de ${category.limitByPerson} billet(s) par personne dans cette catégorie.`,
        'error',
      );
    }

    let client: User;
    try {
      client = await this.resolveClient(dto.userId, yeriaUser);
    } catch (error) {
      this.logger.warn('Résolution du client impossible pour la réservation');
      return this.buildResultMessage(
        'Connexion requise',
        'Impossible d\u2019identifier le client. Vérifiez votre session.',
        'error',
      );
    }

    const unitPrice = Number(category.price);
    const total = unitPrice * quantity;

    try {
      category.availableQuantity -= quantity;
      await this.ticketCategoryRepository.save(category);

      const order = this.orderRepository.create({
        totalAmount: total,
        paymentStatut: PaymentStatut.PENDING,
        orderDate: new Date(),
        client,
      });
      const savedOrder = await this.orderRepository.save(order);

      const tickets = await Promise.all(
        Array.from({ length: quantity }, () =>
          this.createTicket(savedOrder.id, category),
        ),
      );

      const view = new MessageView(
        YERIA_VIEW_ID.BOOKING_CONFIRMATION,
        'Réservation confirmée',
      )
        .setBody(
          `${quantity} billet(s) « ${category.name} » réservé(s) pour ${category.event.title} — total ${total} FCFA. Réglez pour finaliser.`,
        )
        .setSeverity('success')
        .setPrimaryAction('Payer', 'POST')
        .setDismissible(true);

      this.scheduleConfirmationNotification(savedOrder, client, tickets);
      return this.app.serve(view);
    } catch (error) {
      this.logger.error('Erreur lors de la réservation', error);
      return this.buildResultMessage(
        'Erreur serveur',
        'La réservation a échoué. Réessayez.',
        'error',
      );
    }
  }

  // ---------------------------------------------------------------------------
  // HISTORIQUE DE COMMANDES (participant)
  // ---------------------------------------------------------------------------

  /** Historique des commandes + billets d'un participant (ReaderView). */
  async serveOrderHistory(userId: string): Promise<SignedEnvelope> {
    const orders = await this.orderRepository.find({
      where: { client: { id: userId } },
      relations: {
        client: true,
        ticket: { ticketCategory: { event: true } },
      },
      order: { orderDate: 'DESC' },
    });

    const view = new ReaderView(
      YERIA_VIEW_ID.ORDER_HISTORY,
      'Mes commandes',
    ).setIntro('Vos billets Eventia.');

    if (orders.length === 0) {
      view.addParagraph('Aucune commande pour le moment.');
      return this.app.serve(view);
    }

    for (const order of orders) {
      view
        .addSubTitle(
          `Commande du ${order.orderDate ? new Date(order.orderDate).toLocaleDateString('fr-FR') : '—'} — ${order.paymentStatut}`,
        )
        .addListField(
          (order.ticket ?? []).map(
            (t) =>
              `${t.ticketCategory?.name ?? 'Billet'} · ${t.ticketCategory?.event?.title ?? ''} · ${t.validationStatut}`,
          ),
        )
        .addSeparator();
    }

    return this.app.serve(view);
  }

  // ---------------------------------------------------------------------------
  // SCAN / VALIDATION (POST /scan-ticket depuis la vue QRScanView)
  // ---------------------------------------------------------------------------

  /**
   * Traite le QR code scanné : recherche le billet, met à jour son statut,
   * journalise l'entrée et retourne une vue Message signée (résultat).
   */
  async handleTicketScan(
    dto: ScanTicketDto,
    yeriaUser?: YeriaTokenClaims,
  ): Promise<SignedEnvelope> {
    const code = dto.qrData?.trim();

    if (!code) {
      return this.buildResultMessage(
        'Code QR manquant',
        'Aucun code n\u2019a été scanné. Réessayez.',
        'error',
      );
    }

    const ticket = await this.ticketRepository.findOne({
      where: { uniqueCodeCrypto: code },
      relations: {
        order: { client: true },
        ticketCategory: { event: true },
      },
    });

    if (!ticket) {
      return this.buildResultMessage(
        'Billet introuvable',
        'Ce QR code ne correspond à aucun billet Eventia.',
        'error',
      );
    }

    if (ticket.validationStatut === TicketValidationStatut.SCANNNED) {
      const scanDate = ticket.scanDate
        ? new Date(ticket.scanDate).toLocaleString('fr-FR')
        : 'précédemment';
      return this.buildResultMessage(
        'Billet déjà utilisé',
        `Ce billet a déjà été scanné le ${scanDate}. Accès refusé.`,
        'warning',
      );
    }

    if (ticket.validationStatut === TicketValidationStatut.INVALID) {
      return this.buildResultMessage(
        'Billet invalide',
        'Ce billet a été invalidé. Contactez le support Eventia.',
        'error',
      );
    }

    try {
      ticket.validationStatut = TicketValidationStatut.SCANNNED;
      ticket.scanDate = new Date();
      if (yeriaUser?.sub) {
        ticket.scanBy = { id: yeriaUser.sub } as Ticket['scanBy'];
      }
      await this.ticketRepository.save(ticket);

      const log = this.validationLogRepository.create({
        ticket,
        ticketId: ticket.id,
        deviceId: dto.deviceId,
        location: dto.location,
        isSuccess: true,
      });
      await this.validationLogRepository.save(log);
    } catch (error) {
      this.logger.error('Erreur lors de la validation du billet', error);
      return this.buildResultMessage(
        'Erreur serveur',
        'Une erreur est survenue lors de la validation. Réessayez.',
        'error',
      );
    }

    const eventTitle = ticket.ticketCategory?.event?.title ?? 'cet événement';
    return this.buildResultMessage(
      'Accès autorisé',
      `Billet valide pour « ${eventTitle} ». Bonne entrée !`,
      'success',
    );
  }

  // ---------------------------------------------------------------------------
  // NOTIFICATIONS
  // ---------------------------------------------------------------------------

  /** Envoie une notification signée à un utilisateur Yeria. */
  async sendNotification(
    userId: string,
    title: string,
    body: string,
    link?: string,
  ): Promise<void> {
    const notification = new Notification(userId, title, body);
    if (link) {
      notification.setLink(link);
    }

    try {
      await this.app.notify(notification);
    } catch (error) {
      this.logger.error('Échec de l\u2019envoi de la notification Yeria', error);
      throw new ServiceUnavailableException(
        'Impossible de joindre la plateforme Yeria',
      );
    }
  }

  // ---------------------------------------------------------------------------
  // UTILITAIRES
  // ---------------------------------------------------------------------------

  private formatDate(date?: Date): string {
    return date ? new Date(date).toLocaleString('fr-FR') : 'Date à confirmer';
  }

  private eventSummary(event: Event): string {
    const price = this.minPrice(event.ticketsCategories);
    return [
      this.formatDate(event.startDate),
      event.placeName,
      ...(price != null ? [`dès ${price} FCFA`] : []),
    ].join(' • ');
  }

  private minPrice(categories: TicketCategory[] | undefined): number | null {
    const prices = (categories ?? [])
      .map((c) => Number(c.price))
      .filter((p) => !Number.isNaN(p));
    return prices.length ? Math.min(...prices) : null;
  }

  private async distinctEventCategories(): Promise<string[]> {
    const rows = await this.eventRepository
      .createQueryBuilder('event')
      .select('DISTINCT event.category', 'category')
      .where('event.statut = :statut', { statut: EventStatut.PUBLISHED })
      .getRawMany<{ category: string }>();

    return rows
      .map((r) => r.category)
      .filter((c): c is string => typeof c === 'string' && c.length > 0);
  }

  private async findEventById(eventId: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: { organizerProfile: true, ticketsCategories: true },
    });

    if (!event) {
      this.logger.warn(`Événement introuvable : ${eventId}`);
      throw new NotFoundException('Événement introuvable');
    }

    return event;
  }

  /** Retrouve ou crée le User Eventia lié à un utilisateur Yeria. */
  private async resolveClient(
    userId?: string,
    yeriaUser?: YeriaTokenClaims,
  ): Promise<User> {
    if (userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }
      return user;
    }

    const sub = yeriaUser?.sub;
    if (!sub) {
      throw new BadRequestException(
        'Aucun utilisateur identifié pour cette réservation.',
      );
    }

    const existing = await this.userRepository.findOne({
      where: { yeriaUserId: sub },
    });
    if (existing) {
      return existing;
    }

    const created = this.userRepository.create({
      email: `${sub}@yeria.eventia`,
      password: crypto.randomBytes(24).toString('hex'),
      firstName: 'Participant',
      lastName: 'Yeria',
      isActive: true,
      role: Role.CLIENT,
      yeriaUserId: sub,
    });
    return this.userRepository.save(created);
  }

  /** Crée un billet avec un code unique, lié à la commande et à la catégorie. */
  private async createTicket(
    orderId: string,
    category: TicketCategory,
  ): Promise<Ticket> {
    const ticket = this.ticketRepository.create({
      uniqueCodeCrypto: `EVT-${crypto.randomBytes(12).toString('hex').toUpperCase()}`,
      validationStatut: TicketValidationStatut.VALID,
      order: { id: orderId } as Ticket['order'],
      ticketCategory: category,
    });
    return this.ticketRepository.save(ticket);
  }

  private scheduleConfirmationNotification(
    order: Order,
    client: User,
    tickets: Ticket[],
  ): void {
    const targetId = client.yeriaUserId;
    if (!targetId) {
      return;
    }

    const firstCode = tickets[0]?.uniqueCodeCrypto;
    const link = firstCode
      ? YeriaLink.component(this.yeriaAppId, `/views/tickets/${firstCode}`)
      : undefined;

    void this.sendNotification(
      targetId,
      'Réservation confirmée',
      `Votre commande ${order.id} est confirmée. Pensez à régler vos billets.`,
      link,
    ).catch(() => {
      this.logger.warn('Notification de réservation non délivrée');
    });
  }

  private buildInfoMessage(title: string, body: string): SignedEnvelope {
    const view = new MessageView(YERIA_VIEW_ID.ERROR, title)
      .setBody(body)
      .setSeverity('info')
      .setDismissible(true);

    return this.app.serve(view);
  }

  private buildResultMessage(
    title: string,
    body: string,
    severity: 'info' | 'success' | 'warning' | 'error',
  ): SignedEnvelope {
    const view = new MessageView(YERIA_VIEW_ID.SCAN_RESULT, title)
      .setBody(body)
      .setSeverity(severity)
      .setPrimaryAction('Scanner un autre billet', 'POST')
      .setDismissible(true);

    return this.app.serve(view);
  }

  /** Enveloppe d'erreur signée (contrat ProviderError). */
  serveError(spec: ProviderErrorSpec): SignedEnvelope {
    return this.app.serveError(spec);
  }

  /** Vérifie qu'un jeton Yeria est valide (retourne les claims). */
  async verifyUserToken(
    bearerToken: string,
  ): Promise<YeriaTokenClaims> {
    return this.app.verifyUserToken(bearerToken);
  }

  private async findTicketByCode(code: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { uniqueCodeCrypto: code },
      relations: {
        order: { client: true },
        ticketCategory: { event: true },
      },
    });

    if (!ticket) {
      this.logger.warn(`Billet introuvable : ${code}`);
      throw new NotFoundException(`Billet introuvable`);
    }

    return ticket;
  }
}
