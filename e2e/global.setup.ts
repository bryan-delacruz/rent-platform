import { clerkSetup } from '@clerk/testing/playwright';
import { test as setup } from '@playwright/test';
import { prisma } from '../lib/prisma';
import { resetDemoData } from '../lib/demo-data';
import { OTHER_EMAIL, OWNER_EMAIL, userIdFor } from './users';

setup('clerk testing token and clean test data', async () => {
  await clerkSetup();

  // Start every run from empty accounts for the two test landlords.
  for (const email of [OWNER_EMAIL, OTHER_EMAIL]) {
    const ownerId = await userIdFor(email);
    await prisma.payment.deleteMany({ where: { ownerId } });
    await prisma.lease.deleteMany({ where: { ownerId } });
    await prisma.tenant.deleteMany({ where: { ownerId } });
    await prisma.property.deleteMany({ where: { ownerId } });
  }

  if (process.env.DEMO_USER_ID) await resetDemoData(prisma, process.env.DEMO_USER_ID);
  await prisma.$disconnect();
});
