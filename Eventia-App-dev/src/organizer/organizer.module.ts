import { Module } from '@nestjs/common';
import { OrganizerController } from './organizer.controller';
import { EventModule } from 'src/event/event.module';
import { TicketCategoryModule } from 'src/ticket-category/ticket-category.module';
import { AcessControlModule } from 'src/acess-control/acess-control.module';
import { DashboardModule } from 'src/dashboard/dashboard.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    EventModule,
    TicketCategoryModule,
    AcessControlModule,
    DashboardModule,
    UserModule,
  ],
  controllers: [OrganizerController],
})
export class OrganizerModule {}
