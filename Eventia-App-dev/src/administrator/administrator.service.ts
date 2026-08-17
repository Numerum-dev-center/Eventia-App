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

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getUsersByRole(role: Role): Promise<User[]> {
    return await this.userRepository.find({
      where: { role },
      order: { createdAt: 'DESC' },
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
      where: { statut: EventStatut.DRAFT },
      relations: { organizerProfile: true },
      order: { createdAt: 'DESC' },
    });
  }

  async moderateEvent(eventId: string, statut: EventStatut): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException(`Événement #${eventId} non trouvé`);
    }
    event.statut = statut;
    return await this.eventRepository.save(event);
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
