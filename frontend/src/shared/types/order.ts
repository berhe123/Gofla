import type { OrderStatus } from '../constants';
import type { AddressDto } from './user';

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productImage?: string | null;
  variantLabel?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderDto {
  id: string;
  number: string;
  status: OrderStatus;
  items: OrderItemDto[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  shippingAddress: AddressDto;
  trackingNumber?: string | null;
  createdAt: string;
  updatedAt: string;
}
