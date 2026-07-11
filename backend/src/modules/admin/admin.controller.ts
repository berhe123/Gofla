import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProductService } from '../product/product.service';
import { CategoryService } from '../category/category.service';
import { OrderService } from '../order/order.service';
import { ReviewService } from '../review/review.service';
import { CreateProductDto, UpdateProductDto } from '../product/dto/product.dto';
import { CreateCategoryDto, UpdateCategoryDto } from '../category/dto/category.dto';
import { UpdateOrderStatusDto } from '../order/dto/checkout.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly products: ProductService,
    private readonly categories: CategoryService,
    private readonly orders: OrderService,
    private readonly reviews: ReviewService,
  ) {}

  @Get('analytics')
  analytics() {
    return this.admin.analytics();
  }

  @Get('users')
  users() {
    return this.admin.listUsers();
  }

  // Products
  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.products.remove(id);
  }

  // Categories
  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categories.create(dto);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categories.update(id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.categories.remove(id);
  }

  // Orders
  @Get('orders')
  listOrders() {
    return this.orders.adminList();
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status, dto.trackingNumber);
  }

  // Reviews
  @Get('reviews/pending')
  pendingReviews() {
    return this.reviews.listPending();
  }

  @Patch('reviews/:id/approve')
  approveReview(@Param('id') id: string) {
    return this.reviews.moderate(id, 'APPROVED');
  }

  @Patch('reviews/:id/reject')
  rejectReview(@Param('id') id: string) {
    return this.reviews.moderate(id, 'REJECTED');
  }
}
