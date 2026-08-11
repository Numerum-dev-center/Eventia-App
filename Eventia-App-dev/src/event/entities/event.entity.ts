import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { TicketCategory } from 'src/ticket-category/entities/ticket-category.entity';
import { EventStatut } from 'src/common/event-statut.enum';
import { OrganizerProfile } from 'src/organizer-profile/entities/organizer-profile.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class Event extends BaseEntity {

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column()
  category!: string;

  @Column()
  placeName!: string;

  @Column()
  adress!: string;

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

  @Column({
    type: 'enum',
    enum: EventStatut,
    default: EventStatut.DRAFT,
  })
  statut!: EventStatut;

  // Relation : un organisateur (Utilisateur) peut créer plusieurs événements
  @ManyToOne(() => OrganizerProfile, (profil) => profil.event)
  @JoinColumn({ name: 'organizer_profile_id' }) // La clé étrangère est ici !
  organizerProfile!: OrganizerProfile;

  // Relation : un événement contient plusieurs catégories de tickets
  @OneToMany(() => TicketCategory, (category) => category.event)
  ticketsCategories!: TicketCategory[];
}
