import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Order } from 'src/order/entities/order.entity';
import { PaymentStatut } from 'src/common/payment-statut.enum';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('payments')
export class Payment extends BaseEntity {

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  // ex: 'succes', 'echec', 'en_attente', 'rembourse'
  @Column({
    type: 'enum',
    enum: PaymentStatut,
    default: PaymentStatut.PENDING,
  })
  statut!: PaymentStatut;

  // Référence externe fournie par le prestataire (ex: pi_123456... pour Stripe)
  @Column({ nullable: true })
  externalTransactionReference?: string;

  @Column()
  paymentMethod!: string; // ex: 'carte_bancaire', 'mobile_money'

  @CreateDateColumn()
  creationDate!: Date;

  // Relation : Plusieurs transactions (paiements) peuvent être liées à une seule commande
  // (utile en cas de réessais ou paiements partiels)
  @ManyToOne(() => Order, (order) => order.paiements)
  @JoinColumn({ name: 'order_id' })
  order!: Order;

}
