import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { ProfilOrganisateur } from 'src/profil-organisateur/entities/profil-organisateur.entity';
import { Evenement } from 'src/evenement/entities/evenement.entity';
import { Commande } from 'src/commande/entities/commande.entity';
import { SessionsJetons } from 'src/auth/sessions-jetons/entities/sessions-jeton.entity';
import { LogsAudit } from 'src/logs-audit/entities/logs-audit.entity';
import { Role } from 'src/common/role.enum';
import { Sexe } from 'src/common/sexe.enum';
import { BaseEntity } from 'src/common/entities/base.entity';
import { AuthProvider } from 'src/common/auth-provider.enum';

@Entity()
export class Utilisateur extends BaseEntity {

  @Column({ unique: true })
  email!: string;

  @Column()
  motDePasse!: string;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL, // Par défaut, un utilisateur est "local"
  })
  authProvider!: AuthProvider;

  @Column({nullable : true})
  nom!: string;

  @Column({nullable : true})
  prenoms!: string;

  @Column( {type: 'enum',
    enum: Sexe,
    default: Sexe.MASCULIN})
  sexe!: Sexe;

  @Column({nullable : true})
  dateDeNaissance!: Date;

  @Column({nullable : true})
  telephone?: string;

  @Column({nullable : true})
  adresse?: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CLIENT,
  })
  role!: Role;

  @Column({ default: false })
  estActif!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  code2faSecret!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  dateExpirationCode!: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetPasswordCode!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires!: Date | null;

  @Column({ default: 0 })
  tentativesConnexion!: number;

  @Column({ type: 'timestamp', nullable: true })
  compteBloqueJusqua!: Date;

  @Column({ type: 'timestamp', nullable: true })
  derniereConnexion?: Date;

  // Relation : un utilisateur peut avoir un profil organisateur (Crée)
  @OneToOne(() => ProfilOrganisateur, (profil) => profil.utilisateur)
  profilOrganisateur?: ProfilOrganisateur;

  // Relation : un organisateur (utilisateur) organise plusieurs événements (Organise)
  @OneToMany(() => Evenement, (evenement) => evenement.profilOrganisateur)
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
