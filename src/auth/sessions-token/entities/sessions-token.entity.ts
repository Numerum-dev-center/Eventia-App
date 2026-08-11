import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
@Entity('sessions_jetons')
export class SessionsToken extends BaseEntity{

  @Column()
  refresh_token_hash!: string;

  @Column()
  deviceInfo!: string;

  @Column()
  ipAdress!: string;

  @Column({ type: 'timestamp' })
  expirationDate!: Date;

  @ManyToOne(() => User, (user) => user.sessions)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
