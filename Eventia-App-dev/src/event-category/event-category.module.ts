import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventCategory } from './entities/event-category.entity';
import { EventCategoryService } from './event-category.service';
import { EventCategoryController } from './event-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EventCategory])],
  controllers: [EventCategoryController],
  providers: [EventCategoryService],
  exports: [EventCategoryService],
})
export class EventCategoryModule {}
