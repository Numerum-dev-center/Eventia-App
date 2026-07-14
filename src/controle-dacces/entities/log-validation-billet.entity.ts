import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TicketEmis } from 'src/tickets/entities/ticket-emis.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('logs_validation')
export class LogValidationBillet extends BaseEntity {

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

  @ManyToOne(() => TicketEmis, (billet) => billet.logsValidation)
  @JoinColumn({ name: 'billet_id' })
  billet!: TicketEmis;
}
