import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Event } from 'src/event/entities/event.entity';
import { Order } from 'src/order/entities/order.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { EventStatut } from 'src/common/event-statut.enum';
import { PaymentStatut } from 'src/common/payment-statut.enum';
import { Role } from 'src/common/role.enum';

@Injectable()
export class AdministratorService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  private readonly logger = new Logger(AdministratorService.name);

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { organizerProfile: true },
    });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    const { password, activationToken, twoFASecretCode, resetPasswordCode, ...safe } = user as any;
    return safe;
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find({
      order: { createdAt: 'DESC' },
      relations: { organizerProfile: true },
    });
  }

  async getUsersByRole(role: Role): Promise<User[]> {
    return await this.userRepository.find({
      where: { role },
      order: { createdAt: 'DESC' },
      relations: { organizerProfile: true },
    });
  }

  async toggleUserActive(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Utilisateur #${userId} non trouvé`);
    }
    user.isActive = !user.isActive;
    return await this.userRepository.save(user);
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Utilisateur #${userId} non trouvé`);
    }
    await this.userRepository.remove(user);
  }

  async getAllEvents(): Promise<Event[]> {
    return await this.eventRepository.find({
      relations: { organizerProfile: true, ticketsCategories: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingEvents(): Promise<Event[]> {
    return await this.eventRepository.find({
      where: [
        { statut: EventStatut.DRAFT },
        { statut: EventStatut.PENDING_REVIEW },
      ],
      relations: { organizerProfile: true },
      order: { createdAt: 'DESC' },
    });
  }

  async moderateEvent(eventId: string, statut: EventStatut, reason?: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException(`Événement #${eventId} non trouvé`);
    }
    event.statut = statut;
    if (reason) {
      (event as any).rejectionReason = reason;
    } else {
      (event as any).rejectionReason = null;
    }
    return await this.eventRepository.save(event);
  }

  async searchUsers(query: { search?: string; role?: string; isActive?: string; page?: string; limit?: string }) {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organizerProfile', 'organizerProfile');

    if (query.search) {
      qb.andWhere('(LOWER(user.email) LIKE :search OR LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search OR LOWER(user.phoneNumber) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` });
    }
    if (query.role) {
      qb.andWhere('user.role = :role', { role: query.role });
    }
    if (query.isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', { isActive: query.isActive === 'true' });
    }

    qb.orderBy('user.createdAt', 'DESC');

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    qb.skip((page - 1) * limit).take(limit);

    const [users, total] = await qb.getManyAndCount();
    return { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async updateUserRole(userId: string, role: Role): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User #${userId} not found`);
    user.role = role;
    return this.userRepository.save(user);
  }

  async rejectEvent(eventId: string, reason: string): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException(`Event #${eventId} not found`);
    event.statut = EventStatut.SUSPENDED;
    (event as any).rejectionReason = reason;
    return this.eventRepository.save(event);
  }

  async suspendEvent(eventId: string): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException(`Event #${eventId} not found`);
    event.statut = EventStatut.SUSPENDED;
    return this.eventRepository.save(event);
  }

  async searchEvents(query: { search?: string; status?: string; category?: string; page?: string; limit?: string }) {
    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizerProfile', 'organizerProfile')
      .leftJoinAndSelect('event.ticketsCategories', 'ticketsCategories');

    if (query.search) {
      qb.andWhere('(LOWER(event.title) LIKE :search OR LOWER(event.description) LIKE :search)', { search: `%${query.search.toLowerCase()}%` });
    }
    if (query.status) {
      qb.andWhere('event.statut = :status', { status: query.status });
    }
    if (query.category) {
      qb.andWhere('event.category = :category', { category: query.category });
    }

    qb.orderBy('event.createdAt', 'DESC');
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    qb.skip((page - 1) * limit).take(limit);

    const [events, total] = await qb.getManyAndCount();
    return { events, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getEventById(eventId: string) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: { organizerProfile: true, ticketsCategories: true, media: true },
    });
    if (!event) throw new NotFoundException(`Event #${eventId} not found`);
    return event;
  }

  async getFinancialSummary() {
    const [
      totalOrders,
      paidOrders,
      totalRevenue,
      pendingPayments,
    ] = await Promise.all([
      this.orderRepository.count(),
      this.orderRepository.count({ where: { paymentStatut: PaymentStatut.PAID } }),
      this.paymentRepository
        .createQueryBuilder('p')
        .where('p.statut = :statut', { statut: PaymentStatut.PAID })
        .select('COALESCE(SUM(p.amount), 0)', 'total')
        .getRawOne()
        .then((r) => Number(r?.total || 0)),
      this.paymentRepository
        .createQueryBuilder('p')
        .where('p.statut = :statut', { statut: PaymentStatut.PENDING })
        .select('COALESCE(SUM(p.amount), 0)', 'pending')
        .getRawOne()
        .then((r) => Number(r?.pending || 0)),
    ]);

    return {
      totalOrders,
      paidOrders,
      unpaidOrders: totalOrders - paidOrders,
      totalRevenue,
      pendingPayments,
      commission: Math.round(totalRevenue * 0.1 * 100) / 100,
    };
  }

  async getUserStats() {
    const [totalClients, totalOrganizers, totalAdmins, activeUsers] = await Promise.all([
      this.userRepository.count({ where: { role: Role.CLIENT } }),
      this.userRepository.count({ where: { role: Role.ORGANIZER } }),
      this.userRepository.count({ where: { role: Role.ADMIN } }),
      this.userRepository.count({ where: { isActive: true } }),
    ]);

    return {
      totalUsers: totalClients + totalOrganizers + totalAdmins,
      totalClients,
      totalOrganizers,
      totalAdmins,
      activeUsers,
    };
  }
}
