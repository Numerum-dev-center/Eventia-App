import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { TicketEmis } from 'src/tickets/entities/ticket-emis.entity';

@Entity('logs_validation')
export class LogValidationBillet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  billetId!: string;

  @Column()
  appareilId!: string; // ID de l'appareil du contrôleur

  @Column()
  localisation!: string; // Ex: "Entrée Nord", "Porte A"

  @Column({ default: true })
  estSucces!: boolean; // Permet de logger aussi les tentatives frauduleuses

  @Column({ nullable: true })
  messageErreur?: string; // Ex: "Billet déjà utilisé"

  @CreateDateColumn()
  dateValidation!: Date;

  @ManyToOne(() => TicketEmis, (billet) => billet.logsValidation)
  @JoinColumn({ name: 'billet_id' })
  billet!: TicketEmis;
}
