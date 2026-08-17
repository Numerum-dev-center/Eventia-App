import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventMedia } from './entities/event-media.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { Event } from 'src/event/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventMedia, Event])],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
