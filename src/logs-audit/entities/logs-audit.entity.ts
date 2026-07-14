import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Utilisateur } from 'src/utilisateur/entities/utilisateur.entity';

@Entity('logs_audit')
export class LogsAudit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  targetEntity!: string; // Ex: 'Evenement'

  @Column()
  targetId!: string; // L'ID de l'événement modifié

  @Column()
  action!: string; // 'INSERT', 'UPDATE', 'DELETE'

  @Column({ type: 'jsonb' })
  changes!: any; // Ce qui a été modifié

  @Column({ nullable: true })
  userId!: string; // Qui a fait l'action

  @CreateDateColumn()
  createdAt!: Date;

  // Relation : Plusieurs logs sont générés par un utilisateur
  @ManyToOne(() => Utilisateur, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur!: Utilisateur;
}
