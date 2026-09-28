import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * "Try the demo": signs the visitor in as the shared demo landlord with a
 * one-time Clerk sign-in token, so no password is needed.
 */
export async function GET(request: Request) {
  const { userId } = await auth();
  if (userId) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const demoUserId = process.env.DEMO_USER_ID;
  if (!demoUserId) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const client = await clerkClient();
  const { token } = await client.signInTokens.createSignInToken({
    userId: demoUserId,
    expiresInSeconds: 60,
  });

  const signIn = new URL('/sign-in', request.url);
  signIn.searchParams.set('__clerk_ticket', token);
  return NextResponse.redirect(signIn);
}
