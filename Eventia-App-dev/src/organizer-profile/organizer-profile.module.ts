import { Module } from '@nestjs/common';
import { OrganizerProfileService } from './organizer-profile.service';
import { OrganizerProfileController } from './organizer-profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizerProfile } from './entities/organizer-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizerProfile])],
  controllers: [OrganizerProfileController],
  providers: [OrganizerProfileService],
  exports: [OrganizerProfileService],
})
export class OrganizerProfileModule {}
