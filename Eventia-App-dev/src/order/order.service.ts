import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { PaymentStatut } from 'src/common/payment-statut.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  private readonly logger = new Logger(OrderService.name);

  async create(clientId: string, totalAmount: number): Promise<Order> {
    try {
      const order = this.orderRepository.create({
        client: { id: clientId },
        totalAmount,
        orderDate: new Date(),
        paymentStatut: PaymentStatut.PENDING,
      });
      return await this.orderRepository.save(order);
    } catch (error) {
      this.logger.error('Erreur lors de la création de la commande', error);
      throw new InternalServerErrorException('Erreur lors de la création de la commande');
    }
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: { client: true, ticket: true, paiements: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { client: true, ticket: { ticketCategory: { event: true } }, paiements: true },
    });
    if (!order) {
      throw new NotFoundException(`Commande #${id} non trouvée`);
    }
    return order;
  }

  async findByClient(clientId: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { client: { id: clientId } },
      relations: { ticket: { ticketCategory: { event: true } } },
      order: { createdAt: 'DESC' },
    });
  }

  async updatePaymentStatut(
    id: string,
    statut: PaymentStatut,
    transactionId?: string,
  ): Promise<Order> {
    const order = await this.findOne(id);
    order.paymentStatut = statut;
    if (transactionId) {
      order.transactionGatewayId = transactionId;
    }
    return await this.orderRepository.save(order);
  }

  async update(id: string, dto: Partial<Order>): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, dto);
    return await this.orderRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }

  async countByClient(clientId: string): Promise<number> {
    return await this.orderRepository.count({
      where: { client: { id: clientId } },
    });
  }

  async getRevenueByEvent(eventId: string): Promise<number> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.ticket', 'ticket')
      .innerJoin('ticket.ticketCategory', 'tc')
      .innerJoin('tc.event', 'event', 'event.id = :eventId', { eventId })
      .where('order.paymentStatut = :statut', { statut: PaymentStatut.PAID })
      .select('COALESCE(SUM(order.totalAmount), 0)', 'totalAmount')
      .getRawOne();
    return Number(result?.totalAmount || 0);
  }
}
