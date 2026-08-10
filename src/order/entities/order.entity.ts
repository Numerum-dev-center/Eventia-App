import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { PaymentStatut } from 'src/common/payment-statut.enum';
import { Payment } from 'src/payment/entities/payment.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class Order extends BaseEntity {

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({
    type: 'enum',
    enum: PaymentStatut,
    default: PaymentStatut.PENDING,
  })
  paymentStatut!: PaymentStatut;

  @Column({ nullable: true })
  transactionGatewayId?: string;

  @Column({ type: 'timestamp' })
  orderDate!: Date;

  // Relation : un client (utilisateur) passe plusieurs commandes
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'client_id' })
  client!: User;

  // Relation : une commande contient plusieurs tickets émis
  @OneToMany(() => Ticket, (ticket) => ticket.order)
  ticket?: Ticket[];

  @OneToMany(() => Payment, (payment) => payment.order)
  paiements?: Payment[];
}
