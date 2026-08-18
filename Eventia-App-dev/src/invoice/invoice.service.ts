import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Order } from 'src/order/entities/order.entity';
import { InvoiceStatut } from 'src/common/invoice-statut.enum';

@Injectable()
export class InvoiceService {
  private readonly VAT_RATE = 0.18; // 18% TVA (Togo)

  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  private readonly logger = new Logger(InvoiceService.name);

  async create(dto: CreateInvoiceDto): Promise<Invoice> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: dto.orderId },
      });
      if (!order) {
        throw new NotFoundException('Commande non trouvée');
      }

      const existing = await this.invoiceRepository.findOne({
        where: { order: { id: dto.orderId } },
      });
      if (existing) {
        throw new BadRequestException('Une facture existe déjà pour cette commande');
      }

      const amountExcludingTax = Number(order.totalAmount);
      const vatAmount = Math.round(amountExcludingTax * this.VAT_RATE * 100) / 100;
      const amountIncludingTax = Math.round((amountExcludingTax + vatAmount) * 100) / 100;

      const invoiceNumber = await this.generateInvoiceNumber();

      const invoice = this.invoiceRepository.create({
        invoiceNumber,
        amountExcludingTax,
        vatAmount,
        amountIncludingTax,
        pdfUrl: dto.pdfUrl,
        statut: InvoiceStatut.DRAFT,
        order,
      });

      return await this.invoiceRepository.save(invoice);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Erreur lors de la création de la facture', error);
      throw new InternalServerErrorException('Erreur lors de la création de la facture');
    }
  }

  async findAll(): Promise<Invoice[]> {
    return await this.invoiceRepository.find({
      relations: { order: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: { order: { client: true } },
    });
    if (!invoice) {
      throw new NotFoundException(`Facture #${id} non trouvée`);
    }
    return invoice;
  }

  async findByOrder(orderId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { order: { id: orderId } },
      relations: { order: true },
    });
    if (!invoice) {
      throw new NotFoundException(`Facture pour la commande #${orderId} non trouvée`);
    }
    return invoice;
  }

  async findByOrganizer(organizerId: string): Promise<Invoice[]> {
    return await this.invoiceRepository
      .createQueryBuilder('invoice')
      .innerJoin('invoice.order', 'order')
      .innerJoin('order.client', 'client')
      .leftJoinAndSelect('invoice.order', 'ord')
      .where('client.id = :organizerId', { organizerId })
      .getMany();
  }

  async updateStatut(id: string, statut: InvoiceStatut): Promise<Invoice> {
    const invoice = await this.findOne(id);
    invoice.statut = statut;
    return await this.invoiceRepository.save(invoice);
  }

  async update(id: string, dto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(id);
    Object.assign(invoice, dto);
    return await this.invoiceRepository.save(invoice);
  }

  async remove(id: string): Promise<void> {
    const invoice = await this.findOne(id);
    await this.invoiceRepository.remove(invoice);
  }

  async getStats(): Promise<{ totalInvoices: number; totalAmount: number; totalVat: number }> {
    const result = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('COUNT(*)', 'totalInvoices')
      .addSelect('COALESCE(SUM(invoice.amountIncludingTax), 0)', 'totalAmount')
      .addSelect('COALESCE(SUM(invoice.vatAmount), 0)', 'totalVat')
      .getRawOne();
    return {
      totalInvoices: Number(result?.totalInvoices || 0),
      totalAmount: Number(result?.totalAmount || 0),
      totalVat: Number(result?.totalVat || 0),
    };
  }

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.invoiceRepository.count();
    const sequence = String(count + 1).padStart(4, '0');
    return `FAC-${year}-${sequence}`;
  }
}
