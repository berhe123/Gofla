import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('orders')
@ApiBearerAuth()
@Controller()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly payment: PaymentService,
  ) {}

  @Post('checkout')
  checkout(@CurrentUser('id') userId: string, @Body() dto: CheckoutDto) {
    return this.orderService.checkout(userId, dto);
  }

  @Get('orders')
  list(@CurrentUser('id') userId: string) {
    return this.orderService.list(userId);
  }

  @Get('orders/:id')
  get(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.orderService.findOne(userId, id);
  }

  @Public()
  @Post('payments/webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(@Req() req: Request, @Headers('stripe-signature') signature: string) {
    if (!this.payment.isEnabled) return { received: true, mocked: true };
    const event = this.payment.constructWebhookEvent((req as any).rawBody ?? req.body, signature);
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as { metadata?: { orderId?: string } };
      if (intent.metadata?.orderId) await this.orderService.markPaid(intent.metadata.orderId);
    }
    return { received: true };
  }
}
