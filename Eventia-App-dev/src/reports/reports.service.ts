import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from 'src/event/entities/event.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Order } from 'src/order/entities/order.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { User } from 'src/user/entities/user.entity';
import { Commission } from 'src/commission/entities/commission.entity';
import { PaymentStatut } from 'src/common/payment-statut.enum';
import { TicketValidationStatut } from 'src/common/ticket-validation-statut.enum';
import { EventStatut } from 'src/common/event-statut.enum';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Commission) private commissionRepo: Repository<Commission>,
  ) {}

  async getSalesReport(startDate?: string, endDate?: string) {
    const qb = this.orderRepo.createQueryBuilder('o');
    if (startDate) qb.andWhere('o.createdAt >= :startDate', { startDate });
    if (endDate) qb.andWhere('o.createdAt <= :endDate', { endDate });

    const totalOrders = await qb.getCount();
    const paidOrders = await qb.clone().andWhere('o.paymentStatut = :s', { s: PaymentStatut.PAID }).getCount();

    const revenueQb = this.paymentRepo
      .createQueryBuilder('p')
      .where('p.statut = :s', { s: PaymentStatut.PAID });
    if (startDate) revenueQb.andWhere('p.createdAt >= :startDate', { startDate });
    if (endDate) revenueQb.andWhere('p.createdAt <= :endDate', { endDate });

    const revenue = await revenueQb
      .select('COALESCE(SUM(p.amount), 0)', 'total')
      .getRawOne();

    return {
      totalOrders,
      paidOrders,
      unpaidOrders: totalOrders - paidOrders,
      totalRevenue: Number(revenue?.total || 0),
      averageOrderValue: paidOrders > 0 ? Math.round(Number(revenue?.total || 0) / paidOrders * 100) / 100 : 0,
      period: { startDate: startDate || 'all', endDate: endDate || 'all' },
    };
  }

  async getFinancialReport(startDate?: string, endDate?: string) {
    const revenueByEventQb = this.paymentRepo
      .createQueryBuilder('p')
      .innerJoin('p.order', 'o')
      .innerJoin('o.ticket', 't')
      .innerJoin('t.ticketCategory', 'tc')
      .innerJoin('tc.event', 'event')
      .where('p.statut = :s', { s: PaymentStatut.PAID });
    if (startDate) revenueByEventQb.andWhere('p.createdAt >= :startDate', { startDate });
    if (endDate) revenueByEventQb.andWhere('p.createdAt <= :endDate', { endDate });

    const revenueByEvent = await revenueByEventQb
      .select('event.id', 'eventId')
      .addSelect('event.title', 'eventTitle')
      .addSelect('SUM(p.amount)', 'revenue')
      .groupBy('event.id')
      .addGroupBy('event.title')
      .orderBy('SUM(p.amount)', 'DESC')
      .getRawMany();

    const totalCommissions = await this.commissionRepo
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.amount), 0)', 'total')
      .getRawOne();

    return {
      revenueByEvent,
      totalCommissions: Number(totalCommissions?.total || 0),
      period: { startDate: startDate || 'all', endDate: endDate || 'all' },
    };
  }

  async getTicketReport(startDate?: string, endDate?: string) {
    const byStatusQb = this.ticketRepo
      .createQueryBuilder('t')
      .innerJoin('t.order', 'o')
      .select('t.validationStatut', 'status')
      .addSelect('COUNT(*)', 'count');
    if (startDate) byStatusQb.andWhere('o.createdAt >= :startDate', { startDate });
    if (endDate) byStatusQb.andWhere('o.createdAt <= :endDate', { endDate });

    const byStatus = await byStatusQb
      .groupBy('t.validationStatut')
      .getRawMany();

    const byCategoryQb = this.ticketRepo
      .createQueryBuilder('t')
      .innerJoin('t.ticketCategory', 'tc')
      .select('tc.name', 'category')
      .addSelect('COUNT(*)', 'count');
    if (startDate || endDate) {
      byCategoryQb.innerJoin('t.order', 'o2');
      if (startDate) byCategoryQb.andWhere('o2.createdAt >= :startDate', { startDate });
      if (endDate) byCategoryQb.andWhere('o2.createdAt <= :endDate', { endDate });
    }

    const byCategory = await byCategoryQb
      .groupBy('tc.name')
      .getRawMany();

    const totalTicketsQb = this.ticketRepo.createQueryBuilder('t');
    if (startDate || endDate) {
      totalTicketsQb.innerJoin('t.order', 'o3');
      if (startDate) totalTicketsQb.andWhere('o3.createdAt >= :startDate', { startDate });
      if (endDate) totalTicketsQb.andWhere('o3.createdAt <= :endDate', { endDate });
    }

    const totalTickets = await totalTicketsQb.getCount();

    return { totalTickets, byStatus, byCategory, period: { startDate: startDate || 'all', endDate: endDate || 'all' } };
  }

  async getUserReport() {
    const byRole = await this.userRepo
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('u.role')
      .getRawMany();

    const active = await this.userRepo.count({ where: { isActive: true } });
    const inactive = await this.userRepo.count({ where: { isActive: false } });

    return { total: active + inactive, active, inactive, byRole };
  }

  async getEventReport() {
    const byStatus = await this.eventRepo
      .createQueryBuilder('e')
      .select('e.statut', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('e.statut')
      .getRawMany();

    const byCategory = await this.eventRepo
      .createQueryBuilder('e')
      .select('e.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('e.category')
      .getRawMany();

    const total = await this.eventRepo.count();

    return { total, byStatus, byCategory };
  }

  async getCheckinReport(eventId?: string) {
    const qb = this.ticketRepo.createQueryBuilder('t');
    if (eventId) {
      qb.innerJoin('t.ticketCategory', 'tc').innerJoin('tc.event', 'e', 'e.id = :eventId', { eventId });
    }

    const total = await qb.getCount();
    const scanned = await qb.clone().andWhere('t.validationStatut = :s', { s: TicketValidationStatut.SCANNNED }).getCount();
    const valid = await qb.clone().andWhere('t.validationStatut = :s', { s: TicketValidationStatut.VALID }).getCount();
    const invalid = await qb.clone().andWhere('t.validationStatut = :s', { s: TicketValidationStatut.INVALID }).getCount();

    return {
      total,
      scanned,
      valid,
      invalid,
      scanRate: total > 0 ? Math.round((scanned / total) * 100) : 0,
      eventId: eventId || 'all',
    };
  }
}
