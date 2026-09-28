import 'server-only';
import { auth } from '@clerk/nextjs/server';

/**
 * The signed-in landlord's id. Every query and mutation is scoped to it, so a
 * landlord can never read or change another landlord's data.
 */
export async function requireOwner(): Promise<string> {
  const { userId } = await auth.protect();
  return userId;
}

export function isDemoOwner(ownerId: string): boolean {
  return Boolean(process.env.DEMO_USER_ID) && ownerId === process.env.DEMO_USER_ID;
}
