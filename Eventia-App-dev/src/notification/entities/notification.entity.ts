import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/user/entities/user.entity';

export enum NotificationType {
  EVENT_APPROVED = 'event_approved',
  EVENT_REJECTED = 'event_rejected',
  NEW_SALE = 'new_sale',
  NEW_PARTICIPANT = 'new_participant',
  PAYOUT_DONE = 'payout_done',
  EVENT_CANCELLED = 'event_cancelled',
  PURCHASE_CONFIRMATION = 'purchase_confirmation',
  ACCOUNT_ACTIVATED = 'account_activated',
  EVENT_REMINDER = 'event_reminder',
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column()
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'enum', enum: NotificationType })
  type!: NotificationType;

  @Column({ default: false })
  isRead!: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
