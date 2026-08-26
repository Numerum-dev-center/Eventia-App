import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}
  private readonly logger = new Logger(NotificationService.name);

  async create(userId: string, title: string, message: string, type: NotificationType): Promise<Notification> {
    const notif = this.notificationRepo.create({ title, message, type, user: { id: userId } });
    return this.notificationRepo.save(notif);
  }

  async findByUser(userId: string, unreadOnly = false) {
    const qb = this.notificationRepo
      .createQueryBuilder('n')
      .where('n.user_id = :userId', { userId })
      .orderBy('n.createdAt', 'DESC');
    if (unreadOnly) qb.andWhere('n.isRead = false');
    return qb.getMany();
  }

  async markAsRead(id: string) {
    await this.notificationRepo.update(id, { isRead: true });
    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.update({ user: { id: userId } }, { isRead: true });
    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationRepo.count({
      where: { user: { id: userId }, isRead: false },
    });
    return { unreadCount: count };
  }
}
