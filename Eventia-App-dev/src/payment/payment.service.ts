import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatut } from 'src/common/payment-statut.enum';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  private readonly logger = new Logger(PaymentService.name);

  async create(dto: CreatePaymentDto): Promise<Payment> {
    try {
      const payment = this.paymentRepository.create({
        order: { id: dto.orderId },
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        externalTransactionReference: dto.externalTransactionReference,
        statut: PaymentStatut.PENDING,
      });
      return await this.paymentRepository.save(payment);
    } catch (error) {
      this.logger.error('Erreur lors de la création du paiement', error);
      throw new InternalServerErrorException('Erreur lors de la création du paiement');
    }
  }

  async findAll(): Promise<Payment[]> {
    return await this.paymentRepository.find({
      relations: { order: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: { order: true },
    });
    if (!payment) {
      throw new NotFoundException(`Paiement #${id} non trouvé`);
    }
    return payment;
  }

  async findByOrder(orderId: string): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { order: { id: orderId } },
      order: { createdAt: 'ASC' },
    });
  }

  async updateStatut(
    id: string,
    statut: PaymentStatut,
    externalRef?: string,
  ): Promise<Payment> {
    const payment = await this.findOne(id);
    payment.statut = statut;
    if (externalRef) {
      payment.externalTransactionReference = externalRef;
    }
    return await this.paymentRepository.save(payment);
  }

  async update(id: string, dto: Partial<Payment>): Promise<Payment> {
    const payment = await this.findOne(id);
    Object.assign(payment, dto);
    return await this.paymentRepository.save(payment);
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
  }

  async getRevenue(): Promise<number> {
    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.statut = :statut', { statut: PaymentStatut.PAID })
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .getRawOne();
    return Number(result?.total || 0);
  }

  async getPaymentsByMethod(): Promise<{ method: string; count: number; total: number }[]> {
    return await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.statut = :statut', { statut: PaymentStatut.PAID })
      .select('payment.paymentMethod', 'method')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.amount)', 'total')
      .groupBy('payment.paymentMethod')
      .getRawMany();
  }
}
