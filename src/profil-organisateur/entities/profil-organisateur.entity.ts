import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Utilisateur } from '../../utilisateur/entities/utilisateur.entity';
import { StatutVerification } from 'src/common/statut-verification-profilOrganisateur.enum';

@Entity('profil_organisateurs')
export class ProfilOrganisateur {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  @OneToOne(() => Utilisateur, (utilisateur) => utilisateur.profilOrganisateur)
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur!: Utilisateur;
}
