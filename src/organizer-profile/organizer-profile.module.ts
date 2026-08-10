import { Module } from '@nestjs/common';
import { OrganizerProfileService } from './organizer-profile.service';
import { OrganizerProfileController } from './organizer-profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Event } from 'src/event/entities/event.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Event, User])],
  controllers: [OrganizerProfileController],
  providers: [OrganizerProfileService],
})
export class OrganizerProfileModule {}
