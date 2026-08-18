import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { OrganizerProfile } from 'src/organizer-profile/entities/organizer-profile.entity';
import { Event } from 'src/event/entities/event.entity';
import { Order } from 'src/order/entities/order.entity';
import { SessionsToken } from 'src/auth/sessions-jetons/entities/sessions-token.entity';
import { AuditLog } from 'src/logs-audit/entities/audit-log.entity';
import { Role } from 'src/common/role.enum';
import { Sex } from 'src/common/sex.enum';
import { BaseEntity } from 'src/common/entities/base.entity';
import { AuthProvider } from 'src/common/auth-provider.enum';

@Entity()
export class User extends BaseEntity {

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL, // Par défaut, un utilisateur est "local"
  })
  authProvider!: AuthProvider;

  @Column({nullable : true})
  lastName!: string;

  @Column({nullable : true})
  firstName!: string;

  @Column( {type: 'enum',
    enum: Sex,
    default: Sex.MASCULINE})
  sex!: Sex;

  @Column({nullable : true})
  birthDate!: Date;

  @Column({nullable : true})
  phoneNumber?: string;

  @Column({nullable : true})
  homeAdress?: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CLIENT,
  })
  role!: Role;

  @Column({ default: false })
  isActive!: boolean;

  @Column({ type: 'varchar', nullable: true })
  activationToken!: string | null ;

  @Column({ type: 'timestamp', nullable: true })
  activationTokenExpires! : Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  twoFASecretCode!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  dateExpirationCode!: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetPasswordCode!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires!: Date | null;

  @Column({ default: 0 })
  tentativesConnexion!: number;

  @Column({ type: 'timestamp', nullable: true })
  dateExpirationLockedAccount!: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLogIn?: Date;

  // Identifiant Yeria du participant (l'utilisateur est créé automatiquement
  // lors de sa première réservation via l'application Yeria)
  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  yeriaUserId?: string;

  // Relation : un utilisateur peut avoir un profil organisateur (Crée)
  @OneToOne(() => OrganizerProfile, (profile) => profile.user)
  organizerProfile?: OrganizerProfile;

  // Relation : un organisateur (utilisateur) organise plusieurs événements (Organise)
  @OneToMany(() => Event, (event) => event.organizerProfile)
  events?: Event[];

  // Relation : un client (utilisateur) passe plusieurs commandes (Passe)
  @OneToMany(() => Order, (order) => order.client)
  orders?: Order[];

  // Relation : un utilisateur possède plusieurs sessions (Possède)
  @OneToMany(() => SessionsToken, (session) => session.user)
  sessions?: SessionsToken[];

  // Relation : un utilisateur génère plusieurs logs d'audit (Génère)
  @OneToMany(() => AuditLog, (log) => log.user)
  logsAudit?: AuditLog[];
}
