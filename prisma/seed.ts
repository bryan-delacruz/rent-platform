import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { resetDemoData } from '../lib/demo-data';

/**
 * Seeds the demo portfolio for DEMO_USER_ID (the Clerk user behind "Try the
 * demo"). Pass another Clerk user id as an argument to seed your own account.
 */
async function main() {
  const ownerId = process.argv[2] ?? process.env.DEMO_USER_ID;
  if (!ownerId) {
    throw new Error('Set DEMO_USER_ID or pass a Clerk user id: pnpm prisma:seed user_123');
  }
  await resetDemoData(prisma, ownerId);
  console.log(`Seeded demo data for ${ownerId}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
