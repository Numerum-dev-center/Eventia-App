import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { InvoiceStatut } from 'src/common/invoice-statut.enum';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('invoices')
export class Invoice extends BaseEntity {

  @Column({ unique: true })
  invoiceNumber!: string; // Ex: FAC-2026-0001 (Doit être généré logiquement)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountExcludingTax!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  vatAmount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountIncludingTax!: number;

  @Column({ nullable: true })
  pdfUrl?: string; // Lien vers le fichier stocké sur S3 ou serveur

  @Column({
    type: 'enum',
    enum: InvoiceStatut,
    default: InvoiceStatut.DRAFT,
  })
  statut!: InvoiceStatut;

  @CreateDateColumn()
  creationDate!: Date;

  // Relation 1:1 avec la commande (une commande génère une facture)
  @OneToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order!: Order;

}
