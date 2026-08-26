import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { TicketCategory } from 'src/ticket-category/entities/ticket-category.entity';
import { EventStatut } from 'src/common/event-statut.enum';
import { EventCategory } from 'src/common/event-category.enum';
import { OrganizerProfile } from 'src/organizer-profile/entities/organizer-profile.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { EventMedia } from 'src/media/entities/event-media.entity';

@Entity()
export class Event extends BaseEntity {

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: EventCategory })
  category!: EventCategory;

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  ticketPrice!: number;

  @Column({ nullable: true })
  placeName?: string;

  @Column({ nullable: true })
  adress?: string;

  @Column({ nullable: true })
  longitude?: string;

  @Column({ nullable: true })
  latitude?: string;

  @Column({ type: 'timestamp' })
  startDate!: Date;

  @Column({ type: 'timestamp' })
  endDate!: Date;

  @Column({ nullable: true })
  bannerImage?: string;

  @Column({ nullable: true })
  maxCapacity?: number;

  @Column({
    type: 'enum',
    enum: EventStatut,
    default: EventStatut.DRAFT,
  })
  statut!: EventStatut;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @ManyToOne(() => OrganizerProfile, (profile) => profile.event)
  @JoinColumn({ name: 'organizer_profile_id' })
  organizerProfile!: OrganizerProfile;

  @OneToMany(() => TicketCategory, (category) => category.event)
  ticketsCategories!: TicketCategory[];

  @OneToMany(() => EventMedia, (media) => media.event)
  media?: EventMedia[];
}
