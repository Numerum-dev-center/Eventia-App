import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Utilisateur } from 'src/utilisateur/entities/utilisateur.entity';

@Entity('logs_audit')
export class LogsAudit {
  @PrimaryGeneratedColumn('increment') // Utilisera BigInt dans PostgreSQL
  id!: number;

  @Column()
  utilisateurId!: string;

  @Column()
  action!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column()
  adresseIp!: string;

  @Column({ type: 'timestamp' })
  dateAction!: Date;

  // Relation : Plusieurs logs sont générés par un utilisateur
  @ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.logsAudit)
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur!: Utilisateur;
}
