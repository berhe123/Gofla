/**
 * Fast production bootstrap — creates admin + demo customer only.
 * Used on Render startup (compiled to JS). Full catalog seed stays in seed.ts for local dev.
 */
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@gofla.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
  const adminHash = await argon2.hash(adminPassword);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      firstName: 'Gofla',
      lastName: 'Admin',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  const customerHash = await argon2.hash('Customer123!');
  await prisma.user.upsert({
    where: { email: 'customer@gofla.com' },
    update: {},
    create: {
      email: 'customer@gofla.com',
      passwordHash: customerHash,
      firstName: 'Demo',
      lastName: 'Customer',
      role: 'CUSTOMER',
      emailVerified: true,
      cart: { create: {} },
    },
  });

  console.log(`Bootstrap OK — admin: ${adminEmail}, demo: customer@gofla.com`);
}

main()
  .catch((e) => {
    console.error('Bootstrap failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
