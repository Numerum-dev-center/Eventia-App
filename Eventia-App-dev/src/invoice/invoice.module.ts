import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/order/entities/order.entity';
import { Invoice } from './entities/invoice.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Order])],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
