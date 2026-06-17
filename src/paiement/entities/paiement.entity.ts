import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Commande } from 'src/commande/entities/commande.entity';
import { StatutPaiement } from 'src/common/statut-paiement.enum';

@Entity('paiements')
export class Paiement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montant!: number;

  // ex: 'succes', 'echec', 'en_attente', 'rembourse'
  @Column({
    type: 'enum',
    enum: StatutPaiement,
    default: StatutPaiement.EN_ATTENTE,
  })
  statut!: StatutPaiement;

  // Référence externe fournie par le prestataire (ex: pi_123456... pour Stripe)
  @Column({ nullable: true })
  referenceTransactionExterne?: string;

  @Column()
  methodePaiement!: string; // ex: 'carte_bancaire', 'mobile_money'

  @CreateDateColumn()
  dateCreation!: Date;

  // Relation : Plusieurs transactions (paiements) peuvent être liées à une seule commande
  // (utile en cas de réessais ou paiements partiels)
  @ManyToOne(() => Commande, (commande) => commande.paiements)
  @JoinColumn({ name: 'commande_id' })
  commande!: Commande;

  @Column()
  commandeId!: string;
}
