import { clerk, setupClerkTestingToken } from '@clerk/testing/playwright';
import type { Page } from '@playwright/test';

export async function signIn(page: Page, emailAddress: string) {
  await setupClerkTestingToken({ page });
  await page.goto('/');
  await clerk.signIn({ page, emailAddress });
}

/** Picks an option in a Radix select, opened from its labelled trigger. */
export async function choose(page: Page, label: string, option: string | RegExp) {
  await page.getByLabel(label, { exact: true }).click();
  await page.getByRole('option', { name: option }).click();
}

export function isoToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());
}
