import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { CategorieTicket } from 'src/categorie-ticket/entities/categorie-ticket.entity';
import { StatutEvenement } from 'src/common/statut-evenement.enum';
import { ProfilOrganisateur } from 'src/profil-organisateur/entities/profil-organisateur.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class Evenement extends BaseEntity {

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
  @ManyToOne(() => ProfilOrganisateur, (profil) => profil.evenements)
  @JoinColumn({ name: 'profil_organisateur_id' }) // La clé étrangère est ici !
  profilOrganisateur!: ProfilOrganisateur;

  // Relation : un événement contient plusieurs catégories de tickets
  @OneToMany(() => CategorieTicket, (categorie) => categorie.evenement)
  categoriesTickets!: CategorieTicket[];
}
