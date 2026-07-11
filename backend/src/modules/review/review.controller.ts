import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreateReviewDto } from './dto/review.dto';

@ApiTags('reviews')
@Controller('products/:productId/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Public()
  @Get()
  list(@Param('productId') productId: string) {
    return this.reviewService.listForProduct(productId);
  }

  @Public()
  @Get('summary')
  summary(@Param('productId') productId: string) {
    return this.reviewService.summary(productId);
  }

  @ApiBearerAuth()
  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.create(userId, productId, dto);
  }
}
