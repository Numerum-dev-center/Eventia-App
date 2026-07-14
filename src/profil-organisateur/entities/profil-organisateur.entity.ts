import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Utilisateur } from '../../utilisateur/entities/utilisateur.entity';
import { StatutVerification } from 'src/common/statut-verification-profilOrganisateur.enum';
import { Evenement } from 'src/evenement/entities/evenement.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('profil_organisateurs')
export class ProfilOrganisateur extends BaseEntity {

  @Column()
  nomEntreprise!: string;

  @Column({ nullable: true })
  logo?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: StatutVerification,
    default: StatutVerification.EN_ATTENTE,
  })
  statutVerification!: StatutVerification;

  // JSON est très pratique pour les détails de paiement variables
  @Column({ type: 'json', nullable: true })
  detailsPaiement?: any;

  @Column({ nullable: true })
  documentsJustificatifs?: string;

  // Clé étrangère pour la relation 1:1
  @Column()
  utilisateurId!: string;

  @Column()
  evenementId!: string;

  @OneToOne(() => Utilisateur, (utilisateur) => utilisateur.profilOrganisateur)
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur!: Utilisateur;

  @OneToMany(() => Evenement, (evenement) => evenement.profilOrganisateur) // Note : 'profilOrganisateur' (minuscule)
  evenements!: Evenement[];
}
