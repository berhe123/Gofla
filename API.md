# Gofla — API Reference

Base URL: `http://localhost:3000/api/v1`
Live interactive docs (Swagger/OpenAPI): `http://localhost:3000/docs`

All responses are wrapped: `{ "success": true, "data": <payload> }`.
Errors: `{ "statusCode", "error", "message", "path", "timestamp" }`.
Authenticated endpoints expect `Authorization: Bearer <accessToken>`.

## Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | – | Create account, returns user + tokens |
| POST | `/auth/login` | – | Login, returns user + tokens |
| POST | `/auth/refresh` | – | Rotate tokens via `refreshToken` |
| POST | `/auth/logout` | ✓ | Revoke refresh token(s) |
| POST | `/auth/forgot-password` | – | Begin password reset |

## Users
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | ✓ | Current profile |
| PATCH | `/users/me` | ✓ | Update profile |
| GET/POST | `/users/me/addresses` | ✓ | List / add address |
| PATCH/DELETE | `/users/me/addresses/:id` | ✓ | Update / delete address |

## Catalog
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products` | – | List with `q, category, minPrice, maxPrice, color, size, tags, sort, featured, page, pageSize` |
| GET | `/products/slug/:slug` | – | Product detail |
| GET | `/products/:id/related` | – | Related products |
| GET | `/categories` | – | Category tree |
| GET | `/categories/:slug` | – | Category by slug |

## Gofla Studio
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/search/visual` | – | Visual search (multipart `image` + `color`, `category`) |
| GET | `/search/visual` | – | Visual search via query params |
| GET | `/products/:id/complete-the-look` | – | Complementary bundle |
| GET | `/studio/live-drops` | – | Live drop collection + countdown |

## Cart & Wishlist
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/cart` | ✓ | Get cart with totals |
| POST | `/cart/items` | ✓ | Add `{ variantId, quantity }` |
| PATCH | `/cart/items/:id` | ✓ | Update quantity |
| DELETE | `/cart/items/:id` | ✓ | Remove item |
| DELETE | `/cart` | ✓ | Clear cart |
| GET | `/wishlist` | ✓ | List wishlist |
| POST/DELETE | `/wishlist/:productId` | ✓ | Add / remove |

## Orders & Payments
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/checkout` | ✓ | Create order from cart (`addressId` or inline `address`) |
| GET | `/orders` | ✓ | Order history |
| GET | `/orders/:id` | ✓ | Order detail + tracking |
| POST | `/payments/webhook` | – | Stripe webhook |

## Reviews
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products/:productId/reviews` | – | Approved reviews |
| GET | `/products/:productId/reviews/summary` | – | Rating summary |
| POST | `/products/:productId/reviews` | ✓ | Submit review |

## Admin (role: ADMIN)
| Method | Path | Description |
|---|---|---|
| GET | `/admin/analytics` | KPIs, sales trend, top products, recent orders |
| GET | `/admin/users` | All users |
| POST/PATCH/DELETE | `/admin/products[/:id]` | Product CRUD |
| POST/PATCH/DELETE | `/admin/categories[/:id]` | Category CRUD |
| GET | `/admin/orders` | All orders |
| PATCH | `/admin/orders/:id/status` | Update status / tracking |
| GET | `/admin/reviews/pending` | Reviews awaiting moderation |
| PATCH | `/admin/reviews/:id/approve` \| `/reject` | Moderate review |

## Health
| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness + DB check |
