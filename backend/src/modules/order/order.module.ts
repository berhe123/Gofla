import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PaymentService } from './payment.service';
import { CartModule } from '../cart/cart.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [CartModule, NotificationModule],
  providers: [OrderService, PaymentService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
