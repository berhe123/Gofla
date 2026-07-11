import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ProductModule } from '../product/product.module';
import { CategoryModule } from '../category/category.module';
import { OrderModule } from '../order/order.module';
import { ReviewModule } from '../review/review.module';

@Module({
  imports: [ProductModule, CategoryModule, OrderModule, ReviewModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
