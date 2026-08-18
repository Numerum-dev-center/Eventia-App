import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Event } from 'src/event/entities/event.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class TicketCategory extends BaseEntity {

  @Column()
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column()
  totalQuantity!: number;

  @Column()
  availableQuantity!: number;

  @Column({ nullable: true })
  limitByPerson?: number;

  // Relation : un événement contient plusieurs catégories de tickets
  @ManyToOne(() => Event, (event) => event.ticketsCategories)
  @JoinColumn({ name: 'evenement_id' })
  event!: Event;

  // Relation : une catégorie de ticket contient plusieurs tickets émis
  @OneToMany(() => Ticket, (ticket) => ticket.ticketCategory)
  ticket?: Ticket[];
}
