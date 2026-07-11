import type { DiscountType } from '../constants';
import type { CategoryDto } from './category';

export interface ProductImageDto {
  id: string;
  url: string;
  alt?: string | null;
  position: number;
  isPrimary: boolean;
}

export interface ProductVariantDto {
  id: string;
  sku: string;
  size?: string | null;
  color?: string | null;
  material?: string | null;
  price?: number | null;
  stock: number;
}

export interface DiscountDto {
  id: string;
  type: DiscountType;
  value: number;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand?: string | null;
  basePrice: number;
  currency: string;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  category?: CategoryDto | null;
  categoryId: string;
  images: ProductImageDto[];
  variants: ProductVariantDto[];
  tags: string[];
  discount?: DiscountDto | null;
  finalPrice: number;
  inStock: boolean;
  createdAt: string;
}

export interface ProductListQuery {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  tags?: string[];
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
  featured?: boolean;
  page?: number;
  pageSize?: number;
}
