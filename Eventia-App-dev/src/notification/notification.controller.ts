import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/common/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findByUser(@GetUser() user: AuthenticatedUser) {
    return this.notificationService.findByUser(user.id);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  getUnreadCount(@GetUser() user: AuthenticatedUser) {
    return this.notificationService.getUnreadCount(user.id);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  markAllAsRead(@GetUser() user: AuthenticatedUser) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }
}
