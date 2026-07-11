import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Public()
  @Get()
  list(@Query() query: ProductQueryDto) {
    return this.productService.list(query);
  }

  @Public()
  @Get('slug/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.productService.findBySlug(slug);
  }

  @Public()
  @Get(':id/related')
  related(@Param('id') id: string) {
    return this.productService.related(id);
  }
}
