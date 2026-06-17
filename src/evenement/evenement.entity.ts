import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { CategorieTicket } from 'src/categorie-ticket/entities/categorie-ticket.entity';
import { Utilisateur } from 'src/utilisateur/entities/utilisateur.entity';
import { StatutEvenement } from 'src/common/statut-evenement.enum';

@Entity()
export class Evenement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  titre!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column()
  categorie!: string;

  @Column()
  lieuNom!: string;

  @Column()
  adresse!: string;

  @Column({ nullable: true })
  longitude?: string;

  @Column({ nullable: true })
  latitude?: string;

  @Column({ type: 'timestamp' })
  dateDebut!: Date;

  @Column({ type: 'timestamp' })
  dateFin!: Date;

  @Column({ nullable: true })
  imageBanniere?: string;

  @Column({
    type: 'enum',
    enum: StatutEvenement,
    default: StatutEvenement.BROUILLON,
  })
  statut!: StatutEvenement;

  // Relation : un organisateur (Utilisateur) peut créer plusieurs événements
  @ManyToOne(() => Utilisateur, { eager: true })
  @JoinColumn({ name: 'organisateur_id' })
  organisateur!: Utilisateur;

  // Relation : un événement contient plusieurs catégories de tickets
  @OneToMany(() => CategorieTicket, (categorie) => categorie.evenement)
  categoriesTickets!: CategorieTicket[];
}
