import { expect, test } from '@playwright/test';
import { choose, isoToday, signIn } from './fixtures';
import { OWNER_EMAIL, randomDni, uniqueSuffix } from './users';

test('a landlord rents a room, collects the rent and ends the lease', async ({ page }) => {
  const suffix = uniqueSuffix();
  const room = `E2E Room ${suffix}`;
  const tenant = `E2E Tenant ${suffix}`;
  const today = isoToday();
  const firstOfMonth = `${today.slice(0, 7)}-01`;
  const nextYear = `${Number(today.slice(0, 4)) + 1}${today.slice(4, 7)}-01`;

  await signIn(page, OWNER_EMAIL);

  // Property
  await page.goto('/properties/new');
  await page.getByLabel('Name').fill(room);
  await page.getByLabel('Location').fill('Jr. Test 123');
  await page.getByLabel('Monthly price').fill('500');
  await page.getByRole('button', { name: 'Create property' }).click();
  await expect(page).toHaveURL(/\/properties$/);
  await expect(page.getByText(room)).toBeVisible();

  // Tenant
  await page.goto('/tenants/new');
  await page.getByLabel('Full name').fill(tenant);
  await page.getByLabel('ID number (DNI)').fill(randomDni());
  await page.getByLabel('Phone').fill('987654321');
  await page.getByLabel('Email').fill(`tenant.${suffix.toLowerCase()}@example.com`);
  await page.getByLabel('Address').fill('Av. Test 456');
  await page.getByRole('button', { name: 'Create tenant' }).click();
  await expect(page).toHaveURL(/\/tenants$/);
  await expect(page.getByText(tenant)).toBeVisible();

  // Lease starting this month
  await page.goto('/leases/new');
  await choose(page, 'Property', new RegExp(room));
  await choose(page, 'Tenant', tenant);
  await page.getByLabel('Start date').fill(firstOfMonth);
  await page.getByLabel('End date').fill(nextYear);
  await expect(page.getByLabel('Monthly rent')).toHaveValue('500');
  await page.getByRole('button', { name: 'Create lease' }).click();
  await expect(page).toHaveURL(/\/leases\/(?!new$)\w+$/);
  const leaseUrl = page.url();
  await expect(page.getByText('No charges for this lease yet.')).toBeVisible();

  // This month's charge; running it twice never duplicates it.
  await page.goto('/payments');
  await page.getByRole('button', { name: 'Generate this month’s charges' }).click();
  await expect(page.getByText(/new charges created|already has a charge/)).toBeVisible();
  await page.getByRole('button', { name: 'Generate this month’s charges' }).click();
  await expect(page.getByText('Every active lease already has a charge for this month.')).toBeVisible();

  // Partial payment, then the rest
  await page.goto(leaseUrl);
  const row = page.getByRole('row').filter({ hasText: 'S/ 500.00' }).first();
  await row.getByRole('button', { name: 'Record payment' }).click();
  await page.getByLabel('Amount received').fill('200');
  await page.getByRole('dialog').getByRole('button', { name: 'Record payment' }).click();
  await expect(row.getByText('Partial')).toBeVisible();
  await expect(page.getByText('S/ 300.00').first()).toBeVisible(); // balance

  await row.getByRole('button', { name: 'Record payment' }).click();
  await expect(page.getByLabel('Amount received')).toHaveValue('300.00');
  await page.getByRole('dialog').getByRole('button', { name: 'Record payment' }).click();
  await expect(row.getByText('Paid', { exact: true })).toBeVisible();

  // Receipt
  const download = page.waitForEvent('download');
  await row.getByRole('button', { name: 'Download PDF receipt' }).click();
  expect((await download).suggestedFilename()).toMatch(/^Receipt_.+\.pdf$/);

  // Terminate the lease; the room becomes available again.
  await page.goto('/leases');
  const leaseRow = page.getByRole('row').filter({ hasText: room });
  await leaseRow.getByRole('button', { name: 'Terminate' }).click();
  await page.getByRole('button', { name: 'Confirm termination' }).click();
  await expect(leaseRow.getByText('Terminated', { exact: true })).toBeVisible();

  await page.goto('/properties');
  await expect(page.getByRole('row').filter({ hasText: room }).getByText('Available')).toBeVisible();
});

test('invalid input shows a translated error instead of saving', async ({ page }) => {
  await signIn(page, OWNER_EMAIL);
  await page.goto('/tenants/new');
  await page.getByLabel('Full name').fill('Bad Phone');
  await page.getByLabel('ID number (DNI)').fill(randomDni());
  await page.getByLabel('Phone').fill('abc');
  await page.getByLabel('Email').fill('bad.phone@example.com');
  await page.getByLabel('Address').fill('Somewhere');
  await page.getByRole('button', { name: 'Create tenant' }).click();
  await expect(page.getByText('Some fields are invalid. Please review them.')).toBeVisible();
  await expect(page).toHaveURL(/\/tenants\/new$/);
});
