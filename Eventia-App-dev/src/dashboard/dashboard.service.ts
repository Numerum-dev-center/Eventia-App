import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from 'src/event/entities/event.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Order } from 'src/order/entities/order.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { User } from 'src/user/entities/user.entity';
import { TicketCategory } from 'src/ticket-category/entities/ticket-category.entity';
import { EventStatut } from 'src/common/event-statut.enum';
import { PaymentStatut } from 'src/common/payment-statut.enum';
import { TicketValidationStatut } from 'src/common/ticket-validation-statut.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TicketCategory)
    private ticketCategoryRepository: Repository<TicketCategory>,
  ) {}

  private readonly logger = new Logger(DashboardService.name);

  async getGlobalStats() {
    const [
      totalEvents,
      publishedEvents,
      totalUsers,
      totalTickets,
      scannedTickets,
      totalRevenue,
      totalOrders,
    ] = await Promise.all([
      this.eventRepository.count(),
      this.eventRepository.count({ where: { statut: EventStatut.PUBLISHED } }),
      this.userRepository.count(),
      this.ticketRepository.count(),
      this.ticketRepository.count({ where: { validationStatut: TicketValidationStatut.SCANNNED } }),
      this.paymentRepository
        .createQueryBuilder('p')
        .where('p.statut = :statut', { statut: PaymentStatut.PAID })
        .select('COALESCE(SUM(p.amount), 0)', 'total')
        .getRawOne()
        .then((r) => Number(r?.total || 0)),
      this.orderRepository.count(),
    ]);

    return {
      totalEvents,
      publishedEvents,
      totalUsers,
      totalTickets,
      scannedTickets,
      totalRevenue,
      totalOrders,
      fillRate: totalTickets > 0
        ? Math.round((scannedTickets / totalTickets) * 100)
        : 0,
    };
  }

  async getOrganizerStats(organizerId: string) {
    const events = await this.eventRepository.find({
      where: { organizerProfile: { id: organizerId } },
      relations: { ticketsCategories: true },
    });

    let totalTickets = 0;
    let totalAvailable = 0;
    let totalSold = 0;

    for (const event of events) {
      if (event.ticketsCategories) {
        for (const cat of event.ticketsCategories) {
          totalTickets += cat.totalQuantity;
          totalAvailable += cat.availableQuantity;
          totalSold += cat.totalQuantity - cat.availableQuantity;
        }
      }
    }

    const eventIds = events.map((e) => e.id);
    let totalRevenue = 0;
    let totalPaidOrders = 0;

    if (eventIds.length > 0) {
      const revenueResult = await this.paymentRepository
        .createQueryBuilder('p')
        .innerJoin('p.order', 'o')
        .innerJoin('o.ticket', 't')
        .innerJoin('t.ticketCategory', 'tc')
        .innerJoin('tc.event', 'e', 'e.id IN (:...eventIds)', { eventIds })
        .where('p.statut = :statut', { statut: PaymentStatut.PAID })
        .select('COALESCE(SUM(p.amount), 0)', 'total')
        .getRawOne();
      totalRevenue = Number(revenueResult?.total || 0);

      totalPaidOrders = await this.orderRepository
        .createQueryBuilder('o')
        .innerJoin('o.ticket', 't')
        .innerJoin('t.ticketCategory', 'tc')
        .innerJoin('tc.event', 'e', 'e.id IN (:...eventIds)', { eventIds })
        .where('o.paymentStatut = :statut', { statut: PaymentStatut.PAID })
        .getCount();
    }

    return {
      totalEvents: events.length,
      publishedEvents: events.filter((e) => e.statut === EventStatut.PUBLISHED).length,
      totalTickets,
      totalAvailable,
      totalSold,
      totalRevenue,
      totalPaidOrders,
      fillRate: totalTickets > 0 ? Math.round((totalSold / totalTickets) * 100) : 0,
    };
  }

  async getEventStats(eventId: string) {
    const tickets = await this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.ticketCategory', 'tc')
      .innerJoin('tc.event', 'event', 'event.id = :eventId', { eventId })
      .leftJoinAndSelect('ticket.ticketCategory', 'ticketCategory')
      .getMany();

    const totalTickets = tickets.length;
    const scannedTickets = tickets.filter(
      (t) => t.validationStatut === TicketValidationStatut.SCANNNED,
    ).length;
    const validTickets = tickets.filter(
      (t) => t.validationStatut === TicketValidationStatut.VALID,
    ).length;

    const orders = await this.orderRepository
      .createQueryBuilder('o')
      .innerJoin('o.ticket', 't')
      .innerJoin('t.ticketCategory', 'tc')
      .innerJoin('tc.event', 'event', 'event.id = :eventId', { eventId })
      .getMany();

    const uniqueAttendees = new Set(
      orders.map((o) => o.client?.id).filter(Boolean),
    ).size;

    const revenueResult = await this.paymentRepository
      .createQueryBuilder('p')
      .innerJoin('p.order', 'o')
      .innerJoin('o.ticket', 't')
      .innerJoin('t.ticketCategory', 'tc')
      .innerJoin('tc.event', 'event', 'event.id = :eventId', { eventId })
      .where('p.statut = :statut', { statut: PaymentStatut.PAID })
      .select('COALESCE(SUM(p.amount), 0)', 'total')
      .getRawOne();

    return {
      totalTickets,
      scannedTickets,
      validTickets,
      uniqueAttendees,
      totalRevenue: Number(revenueResult?.total || 0),
      fillRate: totalTickets > 0 ? Math.round((scannedTickets / totalTickets) * 100) : 0,
    };
  }

  async getRecentActivity() {
    const recentOrders = await this.orderRepository.find({
      relations: { client: true },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return recentOrders.map((order) => ({
      id: order.id,
      client: `${order.client?.firstName || ''} ${order.client?.lastName || ''}`.trim() || 'Anonyme',
      amount: order.totalAmount,
      statut: order.paymentStatut,
      date: order.createdAt,
    }));
  }

  async exportParticipants(eventId: string): Promise<string> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Événement #${eventId} non trouvé`);
    }

    const tickets = await this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.ticketCategory', 'tc')
      .innerJoin('tc.event', 'event', 'event.id = :eventId', { eventId })
      .leftJoinAndSelect('ticket.ticketCategory', 'ticketCategory')
      .leftJoinAndSelect('ticket.order', 'order')
      .leftJoinAndSelect('order.client', 'client')
      .getMany();

    const header = 'Nom,Prénom,Email,Téléphone,Catégorie,Billet,Statut,Date achat';
    const rows = tickets.map((ticket) => {
      const client = ticket.order?.client;
      return [
        client?.lastName || '',
        client?.firstName || '',
        client?.email || '',
        client?.phoneNumber || '',
        ticket.ticketCategory?.name || '',
        ticket.uniqueCodeCrypto || '',
        ticket.validationStatut,
        ticket.order?.createdAt ? new Date(ticket.order.createdAt).toISOString() : '',
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    return [header, ...rows].join('\n');
  }
}
