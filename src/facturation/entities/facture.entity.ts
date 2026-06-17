import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Commande } from '../../commande/entities/commande.entity';
import { StatutFacture } from 'src/common/statut-facture.enum';

@Entity('factures')
export class Facture {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  numeroFacture!: string; // Ex: FAC-2026-0001 (Doit être généré logiquement)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montantHT!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montantTVA!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montantTTC!: number;

  @Column({ nullable: true })
  pdfUrl?: string; // Lien vers le fichier stocké sur S3 ou serveur

  @Column({
    type: 'enum',
    enum: StatutFacture,
    default: StatutFacture.BROUILLON,
  })
  statut!: StatutFacture;

  @CreateDateColumn()
  dateEmission!: Date;

  // Relation 1:1 avec la commande (une commande génère une facture)
  @OneToOne(() => Commande)
  @JoinColumn({ name: 'commande_id' })
  commande!: Commande;

  @Column()
  commandeId!: string;
}
