import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

export enum NotificationType {
  EVENT_PUBLISHED = 'event_published',
  EVENT_CANCELED = 'event_canceled',
  EVENT_REMINDER = 'event_reminder',
  TICKET_PURCHASED = 'ticket_purchased',
  TICKET_VALIDATED = 'ticket_validated',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  PAYMENT_FAILED = 'payment_failed',
  ORDER_CANCELLED = 'order_cancelled',
  INVOICE_GENERATED = 'invoice_generated',
  ORGANIZER_PAYOUT = 'organizer_payout',
  ADMIN_ANNOUNCEMENT = 'admin_announcement',
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column({ type: 'enum', enum: NotificationType })
  type!: NotificationType;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ default: false })
  isRead!: boolean;

  @Column({ nullable: true })
  entityType?: string;

  @Column({ nullable: true })
  entityId?: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
