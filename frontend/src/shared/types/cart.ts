import type { ProductDto, ProductVariantDto } from './product';

export interface CartItemDto {
  id: string;
  product: ProductDto;
  variant: ProductVariantDto;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}

export interface WishlistItemDto {
  id: string;
  product: ProductDto;
  addedAt: string;
}
