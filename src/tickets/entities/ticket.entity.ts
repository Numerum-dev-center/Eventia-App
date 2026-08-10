import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Order } from 'src/order/entities/order.entity';
import { TicketCategory } from 'src/ticket-category/entities/ticket-category.entity';
import { User } from 'src/user/entities/user.entity';
import { TicketValidationStatut } from 'src/common/ticket-validation-statut.enum';
import { ValidationTicketLog } from 'src/acess-control/entities/ticket-validation-log.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class Ticket extends BaseEntity {

  @Column({ unique: true })
  uniqueCodeCrypto!: string;

  @Column({
    type: 'enum',
    enum: TicketValidationStatut,
    default: TicketValidationStatut.VALID,
  })
  validationStatut!: TicketValidationStatut;

  @Column({ type: 'timestamp', nullable: true })
  scanDate?: Date;

  // Relation : une commande contient plusieurs tickets émis
  @ManyToOne(() => Order, (order) => order.ticket)
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  // Relation : une catégorie de ticket contient plusieurs tickets émis
  @ManyToOne(() => TicketCategory, (category) => category.ticket)
  @JoinColumn({ name: 'ticket_category_id' })
  ticketCategory!: TicketCategory;

  // Relation : un utilisateur (agent de contrôle) scanne plusieurs tickets
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'scan_by' })
  scanBy?: User;

  @OneToMany(() => ValidationTicketLog, (log) => log.ticket)
  logValidation!: ValidationTicketLog[];
}
