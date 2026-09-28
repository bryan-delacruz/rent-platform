import { createClerkClient } from '@clerk/backend';

/** Clerk test users (the +clerk_test suffix never sends real email). */
export const OWNER_EMAIL = 'e2e.owner+clerk_test@example.com';
export const OTHER_EMAIL = 'e2e.other+clerk_test@example.com';

export async function userIdFor(email: string): Promise<string> {
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const { data } = await clerk.users.getUserList({ emailAddress: [email] });
  if (!data[0]) throw new Error(`Clerk test user ${email} does not exist`);
  return data[0].id;
}

/** Short random suffix so desktop and mobile runs never collide on names or DNI. */
export function uniqueSuffix(): string {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

export function randomDni(): string {
  return String(Math.floor(10_000_000 + Math.random() * 89_999_999));
}
