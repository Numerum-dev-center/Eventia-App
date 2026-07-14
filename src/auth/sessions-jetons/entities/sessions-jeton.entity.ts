import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Utilisateur } from 'src/utilisateur/entities/utilisateur.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
@Entity('sessions_jetons')
export class SessionsJetons extends BaseEntity{

  @Column()
  refresh_token_hash!: string;

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
