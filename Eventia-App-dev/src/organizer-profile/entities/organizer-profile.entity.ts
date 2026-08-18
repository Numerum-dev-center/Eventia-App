import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { StatutVerification } from 'src/common/profile-organizer-validation-statut.enum';
import { Event } from 'src/event/entities/event.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('organizer_profile')
export class OrganizerProfile extends BaseEntity {

  @Column()
  societyName!: string;

  @Column({ nullable: true })
  brand?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: StatutVerification,
    default: StatutVerification.PENDING,
  })
  verificationStatut!: StatutVerification;

  // JSON est très pratique pour les détails de paiement variables
  @Column({ type: 'json', nullable: true })
  paymentDetails?: any;

  @Column({ nullable: true })
  officialFiles?: string;

  @OneToOne(() => User, (user) => user.organizerProfile)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => Event, (event) => event.organizerProfile)
  event!: Event[];
}
