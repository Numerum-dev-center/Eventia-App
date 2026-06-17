import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { ProfilOrganisateur } from 'src/profil-organisateur/entities/profil-organisateur.entity';
import { Evenement } from 'src/evenement/evenement.entity';
import { Commande } from 'src/commande/entities/commande.entity';
import { SessionsJetons } from 'src/auth/sessions-jetons/entities/sessions-jeton.entity';
import { LogsAudit } from 'src/logs-audit/entities/logs-audit.entity';
import { Role } from 'src/common/role.enum';

@Entity()
export class Utilisateur {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  motDePasseHash!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CLIENT,
  })
  role!: Role;

  @Column({ default: false })
  estVerifie!: boolean;

  @Column({ nullable: true })
  code2faSecret?: string;

  @Column({ default: 0 })
  tentativesConnexion!: number;

  @Column({ type: 'timestamp', nullable: true })
  compteBloqueJusqua?: Date;

  @Column({ type: 'timestamp' })
  dateCreation!: Date;

  @Column({ type: 'timestamp', nullable: true })
  derniereConnexion?: Date;

  // Relation : un utilisateur peut avoir un profil organisateur (Crée)
  @OneToOne(() => ProfilOrganisateur, (profil) => profil.utilisateur)
  profilOrganisateur?: ProfilOrganisateur;

  // Relation : un organisateur (utilisateur) organise plusieurs événements (Organise)
  @OneToMany(() => Evenement, (evenement) => evenement.organisateur)
  evenements?: Evenement[];

  // Relation : un client (utilisateur) passe plusieurs commandes (Passe)
  @OneToMany(() => Commande, (commande) => commande.client)
  commandes?: Commande[];

  // Relation : un utilisateur possède plusieurs sessions (Possède)
  @OneToMany(() => SessionsJetons, (session) => session.utilisateur)
  sessions?: SessionsJetons[];

  // Relation : un utilisateur génère plusieurs logs d'audit (Génère)
  @OneToMany(() => LogsAudit, (log) => log.utilisateur)
  logsAudit?: LogsAudit[];
}
