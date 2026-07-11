import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { mapProduct, PRODUCT_INCLUDE } from './product.mapper';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ProductQueryDto) {
    const where: Prisma.ProductWhereInput = { isActive: true };

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
        { brand: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    if (query.category) where.category = { slug: query.category };
    if (query.featured) where.isFeatured = true;
    if (query.minPrice != null || query.maxPrice != null) {
      where.basePrice = {};
      if (query.minPrice != null) where.basePrice.gte = query.minPrice;
      if (query.maxPrice != null) where.basePrice.lte = query.maxPrice;
    }
    if (query.color || query.size) {
      where.variants = {
        some: {
          ...(query.color ? { color: { equals: query.color, mode: 'insensitive' } } : {}),
          ...(query.size ? { size: { equals: query.size, mode: 'insensitive' } } : {}),
        },
      };
    }
    if (query.tags) {
      const tagList = query.tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagList.length) where.tags = { some: { tag: { name: { in: tagList } } } };
    }

    const orderBy = this.resolveSort(query.sort);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        orderBy,
        skip: query.skip,
        take: query.pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginate(items.map(mapProduct), total, query.page, query.pageSize);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: PRODUCT_INCLUDE,
    });
    if (!product) throw new NotFoundException('Product not found');
    return mapProduct(product);
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: PRODUCT_INCLUDE,
    });
    if (!product) throw new NotFoundException('Product not found');
    return mapProduct(product);
  }

  async related(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    const items = await this.prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: id }, isActive: true },
      include: PRODUCT_INCLUDE,
      take: 8,
      orderBy: { rating: 'desc' },
    });
    return items.map(mapProduct);
  }

  // --- Admin CRUD ---
  async create(dto: CreateProductDto) {
    const slug = `${slugify(dto.name)}-${Date.now().toString(36)}`;
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        brand: dto.brand,
        basePrice: new Prisma.Decimal(dto.basePrice),
        categoryId: dto.categoryId,
        isFeatured: dto.isFeatured ?? false,
        images: dto.images
          ? {
              create: dto.images.map((img, i) => ({
                url: img.url,
                alt: img.alt,
                position: i,
                isPrimary: img.isPrimary ?? i === 0,
              })),
            }
          : undefined,
        variants: dto.variants
          ? {
              create: dto.variants.map((v) => ({
                sku: v.sku,
                size: v.size,
                color: v.color,
                material: v.material,
                price: v.price != null ? new Prisma.Decimal(v.price) : null,
                stock: v.stock,
              })),
            }
          : undefined,
        tags: dto.tags
          ? {
              create: await this.connectTags(dto.tags),
            }
          : undefined,
      },
      include: PRODUCT_INCLUDE,
    });
    return mapProduct(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.ensureExists(id);
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        brand: dto.brand,
        basePrice: dto.basePrice != null ? new Prisma.Decimal(dto.basePrice) : undefined,
        categoryId: dto.categoryId,
        isFeatured: dto.isFeatured,
      },
      include: PRODUCT_INCLUDE,
    });
    return mapProduct(product);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.product.update({ where: { id }, data: { isActive: false } });
    return { deleted: true };
  }

  private async connectTags(tags: string[]) {
    const result: { tagId: string }[] = [];
    for (const name of tags) {
      const tag = await this.prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      result.push({ tagId: tag.id });
    }
    return result;
  }

  private resolveSort(sort?: string): Prisma.ProductOrderByWithRelationInput {
    switch (sort) {
      case 'price_asc':
        return { basePrice: 'asc' };
      case 'price_desc':
        return { basePrice: 'desc' };
      case 'rating':
        return { rating: 'desc' };
      case 'popular':
        return { reviewCount: 'desc' };
      case 'newest':
      default:
        return { createdAt: 'desc' };
    }
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.product.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Product not found');
  }
}
