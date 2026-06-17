import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Utilisateur } from 'src/utilisateur/entities/utilisateur.entity';
@Entity('sessions_jetons')
export class SessionsJetons {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  utilisateurId!: string;

  @Column()
  refreshTokenHash!: string;

  @Column()
  appareilInfo!: string;

  @Column()
  adresseIp!: string;

  @Column({ type: 'timestamp' })
  dateExpiration!: Date;

  @ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.sessions)
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur!: Utilisateur;
}
