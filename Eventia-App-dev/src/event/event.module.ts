import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { OrganizerProfile } from 'src/organizer-profile/entities/organizer-profile.entity';
import { TicketCategory } from 'src/ticket-category/entities/ticket-category.entity';
import { EventMedia } from 'src/media/entities/event-media.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, OrganizerProfile, TicketCategory, EventMedia]), 
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
