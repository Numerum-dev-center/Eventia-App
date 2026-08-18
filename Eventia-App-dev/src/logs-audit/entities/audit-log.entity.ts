import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
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
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
