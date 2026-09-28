import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';
import { prisma } from '../lib/prisma';
import { signIn } from './fixtures';
import { OTHER_EMAIL, OWNER_EMAIL, randomDni, uniqueSuffix, userIdFor } from './users';

test.afterAll(async () => {
  await prisma.$disconnect();
});

test('signed-out visitors are sent to sign in', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/sign-in/);
});

test('a landlord never sees another landlord’s data', async ({ page }) => {
  const ownerId = await userIdFor(OWNER_EMAIL);
  const name = `Private Room ${uniqueSuffix()}`;
  const property = await prisma.property.create({
    data: { ownerId, name, type: 'ROOM', location: 'Hidden 1', floor: 1, price: '400.00', currency: 'PEN', status: 'OCCUPIED' },
  });
  const tenant = await prisma.tenant.create({
    data: { ownerId, name: `Private Tenant ${uniqueSuffix()}`, dni: randomDni(), phone: '987000000', email: 'private@example.com', address: 'Hidden 2' },
  });
  const lease = await prisma.lease.create({
    data: {
      ownerId,
      propertyId: property.id,
      tenantId: tenant.id,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      monthlyRent: '400.00',
      currency: 'PEN',
      status: 'ACTIVE',
    },
  });

  await signIn(page, OTHER_EMAIL);

  await page.goto('/properties');
  await expect(page.getByRole('heading', { name: 'Properties' })).toBeVisible();
  await expect(page.getByText(name)).toHaveCount(0);

  await page.goto('/tenants');
  await expect(page.getByText(tenant.name)).toHaveCount(0);

  const response = await page.goto(`/leases/${lease.id}`);
  expect(response?.status()).toBe(404);
});

test('“Try the demo” signs in without a password', async ({ page }) => {
  test.skip(!process.env.DEMO_USER_ID, 'DEMO_USER_ID is not set');
  await setupClerkTestingToken({ page });
  await page.goto('/');
  await page.getByRole('link', { name: 'Try the demo' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText('You are exploring a demo account. Data resets every day.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('the language switch translates the app and remembers the choice', async ({ page }) => {
  await signIn(page, OWNER_EMAIL);
  await page.goto('/properties');
  await expect(page.getByRole('heading', { name: 'Properties' })).toBeVisible();

  await page.getByRole('button', { name: 'Español' }).click();
  await expect(page.getByRole('heading', { name: 'Propiedades' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Propiedades' })).toBeVisible();

  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('heading', { name: 'Properties' })).toBeVisible();
});
