// Type-only contracts shared across apps. No runtime values here so that
// `import type` usage is fully erased and neither app needs to compile this
// package at runtime. Runtime enums live in Prisma (api) and web/config (web).

export type Role = 'CUSTOMER' | 'ADMIN' | 'VENDOR';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'FULFILLED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type DiscountType = 'PERCENT' | 'FIXED';

export type CategorySlug = 'shoes' | 'bags' | 'wallets' | 'jackets' | 'belts' | 'keys';
