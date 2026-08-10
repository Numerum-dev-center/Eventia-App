import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('validation_log')
export class ValidationTicketLog extends BaseEntity {

  @Column()
  ticketId!: string;

  @Column()
  deviceId!: string; // ID de l'appareil du contrôleur

  @Column()
  location!: string; // Ex: "Entrée Nord", "Porte A"

  @Column({ default: true })
  isSuccess!: boolean; // Permet de logger aussi les tentatives frauduleuses

  @Column({ nullable: true })
  errorMessage?: string; // Ex: "Billet déjà utilisé"

  @ManyToOne(() => Ticket, (ticket) => ticket.logValidation)
  @JoinColumn({ name: 'ticket_id' })
  ticket!: Ticket;
}
