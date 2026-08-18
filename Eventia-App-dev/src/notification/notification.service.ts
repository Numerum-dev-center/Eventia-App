import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private readonly logger = new Logger(NotificationService.name);

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`Utilisateur #${dto.userId} non trouvé`);
    }

    const notification = this.notificationRepository.create({
      type: dto.type,
      title: dto.title,
      message: dto.message,
      entityType: dto.entityType,
      entityId: dto.entityId,
      user,
    });

    return await this.notificationRepository.save(notification);
  }

  async createBulk(
    type: NotificationType,
    title: string,
    message: string,
    userIds: string[],
    entityType?: string,
    entityId?: string,
  ): Promise<Notification[]> {
    const notifications = userIds.map((userId) =>
      this.notificationRepository.create({
        type,
        title,
        message,
        entityType,
        entityId,
        user: { id: userId } as any,
      }),
    );

    return await this.notificationRepository.save(notifications);
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { user: { id: userId }, isRead: false },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException(`Notification #${id} non trouvée`);
    }
    notification.isRead = true;
    return await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
  }

  async remove(id: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException(`Notification #${id} non trouvée`);
    }
    await this.notificationRepository.remove(notification);
  }
}
